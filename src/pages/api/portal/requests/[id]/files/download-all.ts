/**
 * GET /api/portal/requests/:id/files/download-all
 *
 * Bundles every attachment on a request into a single .zip and returns it as
 * a download. One file the user can save and extract into a folder — the only
 * reliable "download everything" on mobile Safari, which blocks multiple
 * programmatic downloads.
 *
 * Auth: signed in, and either admin or a member of the request's client.
 * Downloading is non-destructive, so a client may grab the whole set
 * (including admin completion screenshots, which are already visible to
 * them).
 *
 * Zips with fflate (pure JS — works in the Cloudflare Workers runtime; the
 * Node-stream zip libraries do not). level: 0 (store, no deflate) because
 * attachments are mostly already-compressed images, so deflate would burn
 * Worker CPU for no real size gain.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { zipSync } from 'fflate';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const session = await getPortalSession({ cookies, request });
  if (!session) return new Response('Not signed in', { status: 401 });

  const requestId = params.id;
  if (!requestId) return new Response('Missing id', { status: 400 });

  const admin = createServiceSupabase();

  const { data: req } = await admin
    .from('requests')
    .select('title, client_id')
    .eq('id', requestId)
    .maybeSingle();
  if (!req) return new Response('Not found', { status: 404 });

  if (session.role !== 'admin' && !session.clientIds.includes(req.client_id)) {
    return new Response('Not found', { status: 404 });
  }

  const { data: files } = await admin
    .from('request_files')
    .select('file_url, filename')
    .eq('request_id', requestId)
    .order('created_at');

  if (!files || files.length === 0) return new Response('No files', { status: 404 });

  const entries: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  for (const f of files) {
    const { data: blob, error } = await admin.storage.from('request-files').download(f.file_url);
    if (error || !blob) continue;
    const buf = new Uint8Array(await blob.arrayBuffer());
    entries[uniqueName(f.filename || 'file', used)] = buf;
  }

  if (Object.keys(entries).length === 0) {
    return new Response('Could not read files', { status: 500 });
  }

  const zipped = zipSync(entries, { level: 0 });
  const zipName = `${slugify(req.title)}-files.zip`;

  return new Response(zipped, {
    status: 200,
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="${zipName}"`,
      'content-length': String(zipped.byteLength),
      'cache-control': 'no-store',
    },
  });
};

// Keep filenames distinct inside the zip — two attachments can share a name.
function uniqueName(name: string, used: Set<string>): string {
  let candidate = name;
  let i = 1;
  while (used.has(candidate)) {
    const dot = name.lastIndexOf('.');
    candidate = dot > 0 ? `${name.slice(0, dot)} (${i})${name.slice(dot)}` : `${name} (${i})`;
    i++;
  }
  used.add(candidate);
  return candidate;
}

function slugify(s: string): string {
  return (
    (s || 'request')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'request'
  );
}
