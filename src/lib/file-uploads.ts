/**
 * Shared validation + formatting helpers for browser → Supabase Storage uploads.
 *
 * Used by:
 *   - /api/portal/admin/todos/[id]/attachments/{sign,confirm}.ts
 *   - /api/portal/requests/[id]/files/{sign,confirm}.ts
 *
 * Keep this module pure data: no session, no RLS, no Supabase clients.
 * It exists so the bucket-side allowlist and filename rules are written
 * once and stay in sync across every upload entrypoint.
 */

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_UPLOAD_FILENAME = 200;

/**
 * Permissive but not wide-open. The goal is to keep browser-served
 * executables and exotic mismatches out of our private buckets while
 * letting clients hand us screenshots, photos, PDFs, Office docs, and
 * archives without friction.
 */
export const ALLOWED_MIME_PREFIXES: readonly string[] = [
  'image/',
  'video/',
  'audio/',
  'text/',
];

export const ALLOWED_MIME_EXACT: ReadonlySet<string> = new Set([
  'application/pdf',
  'application/json',
  'application/xml',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-7z-compressed',
  'application/rtf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Common fallback for files the browser couldn't classify (often code/text).
  'application/octet-stream',
  // Empty string can come through when a browser declines to set Content-Type.
  '',
]);

export function isAllowedMime(m: string): boolean {
  if (ALLOWED_MIME_EXACT.has(m)) return true;
  return ALLOWED_MIME_PREFIXES.some((p) => m.startsWith(p));
}

/**
 * Strip anything that isn't a safe URL/filesystem character. Cap length so a
 * pathological 4 KB filename can't blow out a storage path. Falls back to
 * `'file'` when the entire input gets stripped (e.g. only emoji).
 */
export function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, MAX_UPLOAD_FILENAME) || 'file';
}

/**
 * Human-readable size: 0 B / 12 KB / 3.4 MB. Used in upload progress chips and
 * any place we surface file size to the user. Matches the formatting used by
 * the admin todo attachments UI.
 */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
