/**
 * Session helper — call from .astro frontmatter and API routes to learn
 * who the caller is.
 *
 * Returns null when the caller is not authenticated. Returns { user, profile,
 * role, clientIds } otherwise. `clientIds` is the set of client businesses
 * this user is linked to (a non-admin client will almost always have exactly
 * one).
 */

import {
  createServerSupabase,
  createServiceSupabase,
  type SupabaseRequestContext,
} from './supabase';

export type PortalRole = 'admin' | 'client';

export interface PortalSession {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: PortalRole;
  clientIds: string[];
}

export async function getPortalSession(
  ctx: SupabaseRequestContext
): Promise<PortalSession | null> {
  const supabase = createServerSupabase(ctx);

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) return null;

  const userId = userData.user.id;

  // Use the service-role client for the profile + memberships lookup so we
  // don't fight RLS on a known-good user id (and so we work even if a profile
  // row was created before policies attached). Safe — we just looked up the
  // user id from a verified access token.
  const admin = createServiceSupabase();

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    admin.from('profiles').select('full_name, role').eq('id', userId).maybeSingle(),
    admin.from('client_users').select('client_id').eq('user_id', userId),
  ]);

  const role: PortalRole = profile?.role === 'admin' ? 'admin' : 'client';

  return {
    userId,
    email: userData.user.email ?? null,
    fullName: profile?.full_name ?? null,
    role,
    clientIds: (memberships ?? []).map((m: { client_id: string }) => m.client_id),
  };
}

export function firstName(session: PortalSession | null): string {
  if (!session) return 'there';
  if (session.fullName) return session.fullName.split(' ')[0];
  if (session.email) return session.email.split('@')[0];
  return 'there';
}
