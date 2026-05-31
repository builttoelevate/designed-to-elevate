/**
 * PATCH  /api/portal/admin/todos/:id   { completed?, title?, body?, due_at?, priority? }
 * DELETE /api/portal/admin/todos/:id
 *
 * Admin-only. Operates only on rows owned by the calling admin —
 * filters by owner_id even though the service-role client bypasses RLS,
 * so a malicious admin couldn't tamper with a future second admin's rows.
 *
 * Every step is wrapped so a network/storage hiccup can't take the handler
 * down with an unhandled rejection — the browser always gets back JSON.
 * Storage cleanup on DELETE is best-effort: if removing an object fails we
 * log it and continue so the parent row still goes away.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const MAX_TITLE = 200;
const MAX_BODY = 50_000;
const BUCKET = 'owner-todo-attachments';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  try {
    const session = await getPortalSession({ cookies, request }).catch(() => null);
    if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const id = params.id;
    if (!id) return json({ error: 'Missing id' }, 400);

    let body: {
      completed?: boolean;
      title?: string;
      body?: string | null;
      due_at?: string | null;
      priority?: number | null;
      applies_to_all?: boolean;
      client_ids?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid body' }, 400);
    }

    const patch: Record<string, unknown> = {};

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        return json({ error: 'completed must be boolean' }, 400);
      }
      patch.completed = body.completed;
    }

    if (body.title !== undefined) {
      const t = (body.title ?? '').trim();
      if (!t) return json({ error: 'Title required' }, 400);
      if (t.length > MAX_TITLE) return json({ error: `Title too long (${MAX_TITLE} max)` }, 400);
      patch.title = t;
    }

    if (body.body !== undefined) {
      if (body.body === null || body.body === '') {
        patch.body = null;
      } else if (typeof body.body !== 'string') {
        return json({ error: 'body must be string or null' }, 400);
      } else {
        if (body.body.length > MAX_BODY) {
          return json({ error: `Body too long (${MAX_BODY} max)` }, 400);
        }
        patch.body = body.body;
      }
    }

    // due_at is a date (YYYY-MM-DD), not a timestamp.
    if (body.due_at !== undefined) {
      if (body.due_at === null || body.due_at === '') {
        patch.due_at = null;
      } else {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.due_at)) {
          return json({ error: 'due_at must be YYYY-MM-DD' }, 400);
        }
        const probe = new Date(`${body.due_at}T00:00:00Z`);
        if (Number.isNaN(probe.getTime())) return json({ error: 'Invalid due_at' }, 400);
        patch.due_at = body.due_at;
      }
    }

    // priority: 0=low, 1=normal, 2=high. null is not accepted on PATCH —
    // there's no "unset" state; the column is NOT NULL with default 1.
    if (body.priority !== undefined) {
      if (
        body.priority === null ||
        !Number.isInteger(body.priority) ||
        ![0, 1, 2].includes(body.priority)
      ) {
        return json({ error: 'priority must be 0, 1, or 2' }, 400);
      }
      patch.priority = body.priority;
    }

    // Client-tag updates are a separate concern from row fields, but the
    // UI sends them in the same PATCH so the toggle UX feels atomic. Either
    // of these flags being present means "rewrite this todo's tag set".
    const appliesToAllProvided = body.applies_to_all !== undefined;
    const clientIdsProvided = body.client_ids !== undefined;
    let appliesToAll = false;
    let clientIds: string[] = [];
    if (appliesToAllProvided) {
      if (typeof body.applies_to_all !== 'boolean') {
        return json({ error: 'applies_to_all must be boolean' }, 400);
      }
      appliesToAll = body.applies_to_all;
      patch.applies_to_all_clients = appliesToAll;
    }
    if (clientIdsProvided) {
      if (!Array.isArray(body.client_ids)) {
        return json({ error: 'client_ids must be an array' }, 400);
      }
      clientIds = Array.from(
        new Set(
          (body.client_ids as unknown[]).filter(
            (v): v is string => typeof v === 'string' && v.length > 0,
          ),
        ),
      );
      if (clientIds.length > 200) {
        return json({ error: 'Too many client tags (max 200)' }, 400);
      }
    }

    if (Object.keys(patch).length === 0 && !clientIdsProvided) {
      return json({ error: 'No fields to update' }, 400);
    }

    const admin = createServiceSupabase();
    try {
      // owner_todos row update (skip if only tags changed).
      let data: any = null;
      if (Object.keys(patch).length > 0) {
        const res = await admin
          .from('owner_todos')
          .update(patch)
          .eq('id', id)
          .eq('owner_id', session.userId)
          .select(
            'id, title, body, due_at, priority, completed, created_at, completed_at, updated_at, applies_to_all_clients',
          )
          .maybeSingle();
        if (res.error) {
          console.error('[todos PATCH] update error:', res.error.message);
          return json({ error: res.error.message }, 500);
        }
        if (!res.data) return json({ error: 'Not found' }, 404);
        data = res.data;
      } else {
        // Tag-only patch: confirm ownership and fetch row for the response.
        const res = await admin
          .from('owner_todos')
          .select(
            'id, title, body, due_at, priority, completed, created_at, completed_at, updated_at, applies_to_all_clients',
          )
          .eq('id', id)
          .eq('owner_id', session.userId)
          .maybeSingle();
        if (res.error) return json({ error: res.error.message }, 500);
        if (!res.data) return json({ error: 'Not found' }, 404);
        data = res.data;
      }

      // Rewrite client tag set when either tag field came in. "applies to
      // all" clears the join (the flag is the source of truth in that state).
      if (appliesToAllProvided || clientIdsProvided) {
        const wantsRows = !appliesToAll && clientIds.length > 0;
        const { error: delErr } = await admin
          .from('owner_todo_clients')
          .delete()
          .eq('todo_id', id);
        if (delErr) {
          console.error('[todos PATCH] tag-clear error:', delErr.message);
          return json({ error: delErr.message }, 500);
        }
        if (wantsRows) {
          const rows = clientIds.map((cid) => ({ todo_id: id, client_id: cid }));
          const { error: insErr } = await admin.from('owner_todo_clients').insert(rows);
          if (insErr) {
            console.error('[todos PATCH] tag-insert error:', insErr.message);
            return json({ error: insErr.message }, 500);
          }
        }
      }

      return json({ todo: data, client_ids: appliesToAll ? [] : clientIds });
    } catch (e) {
      console.error('[todos PATCH] update threw:', e);
      return json({ error: e instanceof Error ? e.message : 'Update failed' }, 500);
    }
  } catch (e) {
    console.error('[todos PATCH] top-level error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const session = await getPortalSession({ cookies, request }).catch(() => null);
    if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    const id = params.id;
    if (!id) return json({ error: 'Missing id' }, 400);

    const admin = createServiceSupabase();

    // 1) List attachment paths so we can clean up the bucket. The DB cascade
    //    will drop the attachment rows when the parent todo goes away, so
    //    this query is purely for storage cleanup. A failure here just means
    //    we'll leave orphan objects — recoverable, don't fail the request.
    let paths: string[] = [];
    try {
      const { data, error } = await admin
        .from('owner_todo_attachments')
        .select('storage_path')
        .eq('todo_id', id)
        .eq('owner_id', session.userId);
      if (error) {
        console.error('[todos DELETE] list attachments error:', error.message);
      } else {
        paths = (data ?? [])
          .map((a: { storage_path: string }) => a.storage_path)
          .filter((p): p is string => typeof p === 'string' && p.length > 0);
      }
    } catch (e) {
      console.error('[todos DELETE] list attachments threw:', e);
    }

    // 2) Remove each storage object best-effort. Try the batch call first;
    //    if it throws or partial-fails, fall back to per-path removes so a
    //    single bad object can't block the others. Always continue to step 3.
    if (paths.length > 0) {
      try {
        const { error } = await admin.storage.from(BUCKET).remove(paths);
        if (error) {
          console.error('[todos DELETE] batch storage remove error:', error.message);
          for (const p of paths) {
            try {
              const { error: perPathErr } = await admin.storage.from(BUCKET).remove([p]);
              if (perPathErr) {
                console.error(`[todos DELETE] remove "${p}" error:`, perPathErr.message);
              }
            } catch (e) {
              console.error(`[todos DELETE] remove "${p}" threw:`, e);
            }
          }
        }
      } catch (e) {
        console.error('[todos DELETE] batch storage remove threw:', e);
      }
    }

    // 3) Delete the row. Cascade drops attachment rows. This is the only
    //    step whose failure should turn into a 5xx response to the client.
    try {
      const { error, count } = await admin
        .from('owner_todos')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('owner_id', session.userId);
      if (error) {
        console.error('[todos DELETE] row delete error:', error.message);
        return json({ error: error.message }, 500);
      }
      if (!count) return json({ error: 'Not found' }, 404);
      return json({ ok: true });
    } catch (e) {
      console.error('[todos DELETE] row delete threw:', e);
      return json({ error: e instanceof Error ? e.message : 'Delete failed' }, 500);
    }
  } catch (e) {
    console.error('[todos DELETE] top-level error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
