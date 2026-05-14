/**
 * Resend transactional email helpers.
 *
 * Email is intentionally minimal. Per CLIENT_HUB_PLAN.md §6, only three
 * messages ever go out:
 *   1. We got your request    → client, on submit
 *   2. [New] {client}: {title} → admin, on submit
 *   3. Need one more thing    → client, when status → waiting_on_client
 *
 * Status changes to in_progress and complete deliberately do NOT email.
 * The portal is the source of truth for status; the inbox is reserved
 * for "we need something from you."
 *
 * Every send is wrapped in try/catch and logs on failure — email should
 * never block a request from being created or status from being changed.
 */

import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const EMAIL_FROM = import.meta.env.EMAIL_FROM || 'Designed to Elevate <hello@designedtoelevate.co>';
const ADMIN_EMAIL = import.meta.env.ADMIN_NOTIFY_EMAIL || 'bill@designedtoelevate.co';
const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://designedtoelevate.co';

let _resend: Resend | null = null;
function client(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping send.');
    return null;
  }
  if (!_resend) _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

interface ClientEmail {
  toEmail: string;
  firstName: string;
  title: string;
  requestId: string;
}

interface AdminEmail {
  clientName: string;
  title: string;
  requestId: string;
  category?: string;
  priority?: string;
  description?: string;
}

function clientRequestUrl(id: string): string {
  return `${SITE_URL}/portal/r/${id}`;
}
function adminRequestUrl(id: string): string {
  return `${SITE_URL}/portal/admin/r/${id}`;
}

async function send(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<void> {
  const r = client();
  if (!r) return;
  try {
    await r.emails.send({
      from: EMAIL_FROM,
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: args.html,
      replyTo: args.replyTo,
    });
  } catch (err) {
    console.error('[email] send failed:', err);
  }
}

function wrap(text: string): string {
  // Minimal HTML wrapper. Plain-text rendering is the canonical version;
  // HTML just makes the URL clickable and adds a tiny bit of breathing room.
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div style="font:15px/1.55 -apple-system,BlinkMacSystemFont,Inter,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
<pre style="white-space:pre-wrap;font:inherit;margin:0;">${esc}</pre>
</div>`;
}

/* ─── client: request received ───────────────────────────────────────────── */
export async function sendRequestReceivedEmail(args: ClientEmail) {
  const url = clientRequestUrl(args.requestId);
  const text = `Hi ${args.firstName},

We received your website change request '${args.title}' and it's in the queue.

You can check progress anytime at ${url} — your dashboard shows when work is in progress and when it's complete.

We'll only email you again if we need something from you to finish the job.

— Bill, Designed to Elevate`;
  await send({
    to: args.toEmail,
    subject: `We got your request — ${args.title}`,
    text,
    html: wrap(text),
    replyTo: ADMIN_EMAIL,
  });
}

/* ─── admin: new request notification ────────────────────────────────────── */
export async function sendAdminNewRequestEmail(args: AdminEmail) {
  const url = adminRequestUrl(args.requestId);
  const lines = [
    `New request from ${args.clientName}: ${args.title}`,
    '',
  ];
  if (args.category) lines.push(`Category: ${args.category}`);
  if (args.priority) lines.push(`Priority: ${args.priority}`);
  if (args.description) {
    lines.push('');
    lines.push('Preview:');
    lines.push(args.description.slice(0, 300) + (args.description.length > 300 ? '…' : ''));
  }
  lines.push('');
  lines.push(`Open: ${url}`);

  const text = lines.join('\n');
  await send({
    to: ADMIN_EMAIL,
    subject: `[New] ${args.clientName}: ${args.title}`,
    text,
    html: wrap(text),
  });
}

/* ─── client: status → waiting_on_client ─────────────────────────────────── */
/* This is the only client-facing status email by design. in_progress and    */
/* complete intentionally do NOT send — the portal is the source of truth    */
/* for status; email is reserved for "we need something from you" so the     */
/* inbox stays signal-only. See CLIENT_HUB_PLAN.md §6 for the policy.        */
export async function sendStatusWaitingOnClientEmail(args: ClientEmail) {
  const url = clientRequestUrl(args.requestId);
  const text = `Hi ${args.firstName},

We need a bit more info to move forward on '${args.title}'. Check the request for details and reply with what we need.

${url}

— Bill, Designed to Elevate`;
  await send({
    to: args.toEmail,
    subject: `Need one more thing — ${args.title}`,
    text,
    html: wrap(text),
    replyTo: ADMIN_EMAIL,
  });
}
