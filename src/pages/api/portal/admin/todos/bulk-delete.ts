/**
 * POST /api/portal/admin/todos/bulk-delete  { ids: string[] }
 *
 * Admin-only. Hard-deletes the given owner_todos rows owned by the calling
 * admin. Mirrors the per-id DELETE at ./[id].ts: best-effort cleanup of
 * storage attachments first, then the row delete (which cascades the
 * owner_todo_attachments rows). Storage failures are logged and ignored —
 * orphan objects are recoverable; a missed row delete is the only failure
 * that turns into a 5xx.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../lib/supabase';
import { getPortalSession } from '../../../../../lib/session';

const BUCKET = 'owner-todo-attachments';
const MAX_BULK = 200;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const session = await getPortalSession({ cookies, request }).catch(() => null);
    if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

    let body: { ids?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid body' }, 400);
    }

    const rawIds = Array.isArray(body.ids) ? body.ids : [];
    const ids = Array.from(new Set(rawIds.filter((v): v is string => typeof v === 'string' && v.length > 0)));
    if (ids.length === 0) return json({ error: 'No ids' }, 400);
    if (ids.length > MAX_BULK) return json({ error: `Too many ids (max ${MAX_BULK})` }, 400);

    const admin = createServiceSupabase();

    // 1) Collect attachment storage paths for the batch (scoped to the
    //    calling admin's own todos so we never reach across owners).
    let paths: string[] = [];
    try {
      const { data, error } = await admin
        .from('owner_todo_attachments')
        .select('storage_path')
        .in('todo_id', ids)
        .eq('owner_id', session.userId);
      if (error) {
        console.error('[todos bulk-delete] list attachments error:', error.message);
      } else {
        paths = (data ?? [])
          .map((a: { storage_path: string }) => a.storage_path)
          .filter((p): p is string => typeof p === 'string' && p.length > 0);
      }
    } catch (e) {
      console.error('[todos bulk-delete] list attachments threw:', e);
    }

    // 2) Best-effort storage cleanup. Batch first; if it fails, per-path.
    //    Either way, continue to the row delete.
    if (paths.length > 0) {
      try {
        const { error } = await admin.storage.from(BUCKET).remove(paths);
        if (error) {
          console.error('[todos bulk-delete] batch storage remove error:', error.message);
          for (const p of paths) {
            try {
              const { error: perPathErr } = await admin.storage.from(BUCKET).remove([p]);
              if (perPathErr) {
                console.error(`[todos bulk-delete] remove "${p}" error:`, perPathErr.message);
              }
            } catch (e) {
              console.error(`[todos bulk-delete] remove "${p}" threw:`, e);
            }
          }
        }
      } catch (e) {
        console.error('[todos bulk-delete] batch storage remove threw:', e);
      }
    }

    // 3) Delete rows (owner-scoped). Cascade drops attachment rows.
    try {
      const { error, count } = await admin
        .from('owner_todos')
        .delete({ count: 'exact' })
        .in('id', ids)
        .eq('owner_id', session.userId);
      if (error) {
        console.error('[todos bulk-delete] row delete error:', error.message);
        return json({ error: error.message }, 500);
      }
      return json({ ok: true, deleted: count ?? 0 });
    } catch (e) {
      console.error('[todos bulk-delete] row delete threw:', e);
      return json({ error: e instanceof Error ? e.message : 'Delete failed' }, 500);
    }
  } catch (e) {
    console.error('[todos bulk-delete] top-level error:', e);
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
