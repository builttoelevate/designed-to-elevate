/**
 * Resend transactional email helpers.
 *
 * Email policy (per CLIENT_HUB_PLAN.md §6) — only three messages ever go out:
 *   1. We got your request    → client, on submit
 *   2. [New] {client}: {title} → admin, on submit
 *   3. Need one more thing    → client, on status → waiting_on_client
 *
 * Status changes to in_progress and complete deliberately do NOT email.
 *
 * Visual design system (shared with the Supabase auth templates in
 * supabase/email-templates/):
 *   - bg #0F0F0F, card #1A1A1A, divider #2A2A2A
 *   - primary text #F5F5F5, secondary text #A1A1AA, muted #71717A
 *   - accent #FF6A00 (DTE orange), button text #000000
 *   - system font stack (no Google Fonts — they break in some clients)
 *   - max-width 560px card, inline styles only
 *   - Outlook-safe button via VML conditional
 *
 * Every send is wrapped in try/catch and logs on failure — email should
 * never block a request from being created or status from being changed.
 */

import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const EMAIL_FROM = import.meta.env.EMAIL_FROM || 'Designed to Elevate <hello@designedtoelevate.co>';
const ADMIN_EMAIL = import.meta.env.ADMIN_NOTIFY_EMAIL || 'bilsonxnc@gmail.com';
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

/* ── design tokens ─────────────────────────────────────────────────────── */
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const COLOR = {
  bg: '#0F0F0F',
  card: '#1A1A1A',
  divider: '#2A2A2A',
  text: '#F5F5F5',
  textMuted: '#A1A1AA',
  textFaint: '#71717A',
  accent: '#FF6A00',
  buttonText: '#000000',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphs(text: string): string {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return parts
    .map((p, i) => {
      const last = i === parts.length - 1;
      const margin = last ? '0' : '0 0 14px';
      return `<p style="margin:${margin};font-family:${FONT};font-size:16px;line-height:1.6;color:${COLOR.textMuted};">${esc(p).replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

/* ── shared HTML shell ─────────────────────────────────────────────────── */
function renderShell(opts: {
  preheader: string;
  title: string;
  headline: string;
  bodyHtml: string;
  buttonText: string;
  buttonUrl: string;
  subtextHtml?: string;
}): string {
  const subtextRow = opts.subtextHtml
    ? `<tr>
         <td style="padding:0 30px 32px;font-family:${FONT};font-size:13px;line-height:1.55;color:${COLOR.textMuted};">
           ${opts.subtextHtml}
         </td>
       </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${esc(opts.title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLOR.bg};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;visibility:hidden;color:transparent;font-size:1px;line-height:1px;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${COLOR.bg}" style="background-color:${COLOR.bg};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" bgcolor="${COLOR.card}" style="background-color:${COLOR.card};border-radius:14px;max-width:560px;width:100%;">
        <tr>
          <td style="padding:32px 30px 0;">
            <span style="font-family:${FONT};font-weight:700;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.text};">Designed to <span style="color:${COLOR.accent};">Elevate</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 30px 14px;font-family:${FONT};font-weight:700;font-size:24px;line-height:1.25;color:${COLOR.text};letter-spacing:-0.01em;">
            ${esc(opts.headline)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 30px 26px;">
            ${opts.bodyHtml}
          </td>
        </tr>
        <tr>
          <td align="left" style="padding:0 30px 26px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="${COLOR.accent}" style="background-color:${COLOR.accent};border-radius:8px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${opts.buttonUrl}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="17%" stroke="f" fillcolor="${COLOR.accent}">
                    <w:anchorlock/>
                    <center style="color:${COLOR.buttonText};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${esc(opts.buttonText)}</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a href="${opts.buttonUrl}" style="display:inline-block;padding:14px 30px;color:${COLOR.buttonText};background-color:${COLOR.accent};border-radius:8px;text-decoration:none;font-family:${FONT};font-weight:700;font-size:15px;line-height:1;mso-padding-alt:0;">${esc(opts.buttonText)}</a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${subtextRow}
        <tr>
          <td style="border-top:1px solid ${COLOR.divider};padding:22px 30px 30px;font-family:${FONT};font-size:12px;line-height:1.6;color:${COLOR.textFaint};">
            Designed to Elevate · Zanesville, Ohio · <a href="https://designedtoelevate.co" style="color:${COLOR.textFaint};text-decoration:underline;">designedtoelevate.co</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

async function send(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
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

/* ── 1. client: request received ───────────────────────────────────────── */
export async function sendRequestReceivedEmail(args: ClientEmail) {
  const url = clientRequestUrl(args.requestId);
  const text = `Hi ${args.firstName},

We received your website change request '${args.title}' and it's in the queue.

You can check progress anytime in your dashboard — it'll show when work is in progress and when it's complete.

We'll only email you again if we need something from you to finish the job.

View it here: ${url}

— Bill, Designed to Elevate`;

  const bodyHtml = paragraphs(`Hi ${args.firstName}, we received your website change request '${args.title}' and it's in the queue.

You can check progress anytime in your dashboard — it'll show when work is in progress and when it's complete.

We'll only email you again if we need something from you to finish the job.`);

  const html = renderShell({
    preheader: `Your request '${args.title}' is in the queue.`,
    title: `We got your request — ${args.title}`,
    headline: 'We got your request',
    bodyHtml,
    buttonText: 'View request',
    buttonUrl: url,
  });

  await send({
    to: args.toEmail,
    subject: `We got your request — ${args.title}`,
    text,
    html,
    replyTo: ADMIN_EMAIL,
  });
}

/* ── 2. admin: new request notification ────────────────────────────────── */
export async function sendAdminNewRequestEmail(args: AdminEmail) {
  const url = adminRequestUrl(args.requestId);
  const desc = (args.description || '').trim();
  const preview = desc.length > 200 ? `${desc.slice(0, 200)}…` : desc;

  // Plain-text version — short, scannable.
  const text = [
    args.title,
    `Category: ${args.category || '—'}  |  Priority: ${args.priority || '—'}`,
    '',
    preview || '(no description)',
    '',
    `Open: ${url}`,
  ].join('\n');

  // Utilitarian body: title large, meta row, then the description preview.
  const bodyHtml = `
    <div style="margin:0 0 6px;font-family:${FONT};font-size:18px;font-weight:600;line-height:1.3;color:${COLOR.text};">${esc(args.title)}</div>
    <div style="margin:0 0 18px;font-family:${FONT};font-size:13px;line-height:1.4;color:${COLOR.textMuted};letter-spacing:0.02em;">
      <span style="color:${COLOR.textFaint};">Category:</span> ${esc(args.category || '—')}
      <span style="color:${COLOR.textFaint};padding:0 8px;">|</span>
      <span style="color:${COLOR.textFaint};">Priority:</span> ${esc(args.priority || '—')}
    </div>
    <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.55;color:${COLOR.textMuted};white-space:pre-wrap;">${esc(preview || '(no description)')}</p>
  `;

  const html = renderShell({
    preheader: `New request from ${args.clientName}: ${args.title}`,
    title: `[New] ${args.clientName}: ${args.title}`,
    headline: `New request from ${args.clientName}`,
    bodyHtml,
    buttonText: 'Open in admin',
    buttonUrl: url,
  });

  await send({
    to: ADMIN_EMAIL,
    subject: `[New] ${args.clientName}: ${args.title}`,
    text,
    html,
  });
}

/* ── 3. client: status → waiting_on_client ─────────────────────────────── */
export async function sendStatusWaitingOnClientEmail(args: ClientEmail) {
  const url = clientRequestUrl(args.requestId);
  const text = `Hi ${args.firstName},

We need a bit more info to move forward on '${args.title}'.

Open the request and reply with what we need to keep things moving:
${url}

— Bill, Designed to Elevate`;

  const bodyHtml = paragraphs(`Hi ${args.firstName}, we need a bit more info to move forward on '${args.title}'.

Open the request and reply with what we need to keep things moving.`);

  const html = renderShell({
    preheader: `We need something from you to keep '${args.title}' moving.`,
    title: `Need one more thing — ${args.title}`,
    headline: 'We need one more thing',
    bodyHtml,
    buttonText: 'Open request',
    buttonUrl: url,
  });

  await send({
    to: args.toEmail,
    subject: `Need one more thing — ${args.title}`,
    text,
    html,
    replyTo: ADMIN_EMAIL,
  });
}
