/**
 * Client email notifications — single source of truth.
 *
 * Every email that can go to a client is listed here with its trigger and a
 * default on/off. The admin can override each one per client (stored in
 * public.client_notification_settings); a missing row falls back to the
 * `defaultEnabled` below.
 *
 * To add a new client notification: add an entry here, gate the send with
 * isClientNotificationEnabled(), and the admin Settings card picks it up
 * automatically.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface ClientNotificationType {
  key: string;
  /** Admin-facing short name (the checkbox label). */
  label: string;
  /** When it fires, in the admin's words. */
  trigger: string;
  /** What the client receives. */
  clientGets: string;
  defaultEnabled: boolean;
}

export const CLIENT_NOTIFICATIONS: ClientNotificationType[] = [
  {
    key: 'request_received',
    label: 'Request received',
    trigger: 'They submit a new request',
    clientGets: '“We got your request — it’s in the queue.”',
    defaultEnabled: true,
  },
  {
    key: 'job_logged_for_client',
    label: 'Job logged for them',
    trigger: 'You log a job for them (status starts at “New”)',
    clientGets: '“We added a job to your queue — here’s what it is.”',
    defaultEnabled: true,
  },
  {
    key: 'status_waiting_on_client',
    label: 'Waiting on them',
    trigger: 'You set a job to “Waiting on client” (on create or later)',
    clientGets: '“We need one more thing to keep moving.”',
    defaultEnabled: true,
  },
  {
    key: 'urgency_escalated',
    label: 'Urgency went up',
    trigger: 'You bump a job’s urgency UP (Whenever → Soon → Blocking)',
    clientGets: '“Heads up — the urgency on this job just went up.”',
    defaultEnabled: true,
  },
  {
    key: 'job_complete',
    label: 'Job complete',
    trigger: 'You set a job to “Complete”',
    clientGets: '“Your job is done.”',
    defaultEnabled: true,
  },
  {
    key: 'new_message',
    label: 'New message',
    trigger: 'You post a message (not an internal note)',
    clientGets: '“You have a new message on your request.”',
    defaultEnabled: false,
  },
];

const DEFAULTS: Record<string, boolean> = Object.fromEntries(
  CLIENT_NOTIFICATIONS.map((n) => [n.key, n.defaultEnabled])
);

export function notificationDefault(key: string): boolean {
  return DEFAULTS[key] ?? true;
}

/** Merge stored rows over the defaults → resolved state for every known key. */
export function resolveClientNotifications(
  rows: { notification_key: string; enabled: boolean }[]
): Record<string, boolean> {
  const state: Record<string, boolean> = { ...DEFAULTS };
  for (const r of rows) {
    if (r.notification_key in state) state[r.notification_key] = r.enabled;
  }
  return state;
}

/** Server-side gate: should we send `key` to `clientId`? */
export async function isClientNotificationEnabled(
  admin: SupabaseClient,
  clientId: string,
  key: string
): Promise<boolean> {
  try {
    const { data } = await admin
      .from('client_notification_settings')
      .select('enabled')
      .eq('client_id', clientId)
      .eq('notification_key', key)
      .maybeSingle();
    if (data && typeof data.enabled === 'boolean') return data.enabled;
  } catch {
    // fall through to default on any lookup error — never block on prefs
  }
  return notificationDefault(key);
}
