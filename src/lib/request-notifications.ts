/**
 * Fire-and-forget notification emails for new change requests.
 *
 * Called from:
 *   - POST /api/portal/requests           (zero-file requests, immediately)
 *   - POST /api/portal/requests/[id]/files/confirm (when the last file lands)
 *
 * Keeps the email firing in one place so both call sites send the same pair
 * (client "got it" + admin "new request") with the same content.
 */

import { createServiceSupabase } from './supabase';
import {
  sendRequestReceivedEmail,
  sendAdminNewRequestEmail,
} from './email';

export interface NotifyNewRequestMeta {
  category: string;
  priority: string;
  description: string;
}

/**
 * Looks up the client + owner profile, then sends both emails in parallel.
 * Swallows errors — we never want a flaky mailer to fail the user's submit.
 */
export async function sendNewRequestNotifications(
  requestId: string,
  clientId: string,
  title: string,
  meta: NotifyNewRequestMeta
): Promise<void> {
  try {
    const admin = createServiceSupabase();

    const [{ data: client }, { data: members }] = await Promise.all([
      admin
        .from('clients')
        .select('business_name, primary_contact_email')
        .eq('id', clientId)
        .maybeSingle(),
      admin
        .from('client_users')
        .select('profiles:user_id (id, full_name)')
        .eq('client_id', clientId),
    ]);

    if (!client) return;

    const owner = (members ?? []).map((m: any) => m.profiles).find(Boolean);

    await Promise.all([
      sendRequestReceivedEmail({
        toEmail: client.primary_contact_email,
        firstName: ownerFirstName(owner),
        title,
        requestId,
      }),
      sendAdminNewRequestEmail({
        clientName: client.business_name,
        title,
        requestId,
        category: meta.category,
        priority: meta.priority,
        description: meta.description,
      }),
    ]);
  } catch (err) {
    console.error('[request-notifications] failed:', err);
  }
}

function ownerFirstName(owner: any): string {
  const name = owner?.full_name;
  if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/)[0];
  return 'there';
}
