/**
 * POST /api/portal/admin/client-users/:id/resend-invite
 *
 * Admin-only. Re-fires Supabase's "Invite user" template for a user that
 * was invited but hasn't accepted yet. Looks the user up via the
 * client_users row, then calls supabase.auth.admin.inviteUserByEmail with
 * the same email + redirect.
 *
 * Safe to call against a user that's already signed in — Supabase will
 * still send the invite email, but they can just sign in normally too.
 * In practice we only show the Resend button for pending users.
 */

export const prerender = false;

import type { APIRoute } from 'astro';
import { createServiceSupabase } from '../../../../../../lib/supabase';
import { getPortalSession } from '../../../../../../lib/session';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://designedtoelevate.co';

export const POST: APIRoute = async ({ params, cookies }) => {
  const session = await getPortalSession(cookies);
  if (!session || session.role !== 'admin') return json({ error: 'Forbidden' }, 403);

  const membershipId = params.id;
  if (!membershipId) return json({ error: 'Missing membership id' }, 400);

  const admin = createServiceSupabase();

  // Resolve the auth.users row for this membership.
  const { data: link, error: linkErr } = await admin
    .from('client_users')
    .select('user_id')
    .eq('id', membershipId)
    .maybeSingle();

  if (linkErr || !link?.user_id) {
    return json({ error: 'Membership not found' }, 404);
  }

  const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(link.user_id);
  if (userErr || !userRes?.user?.email) {
    return json({ error: userErr?.message || 'User not found' }, 404);
  }
  const email = userRes.user.email;

  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE_URL}/portal/auth/callback`,
  });

  if (inviteErr) {
    console.error('[resend-invite] failed', {
      membershipId,
      email,
      status: inviteErr.status,
      message: inviteErr.message,
    });
    return json({ error: inviteErr.message || 'Could not resend invite' }, 500);
  }

  return json({ ok: true, email });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
