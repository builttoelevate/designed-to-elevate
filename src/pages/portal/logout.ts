export const prerender = false;

import type { APIRoute } from 'astro';
import { clearAuthCookies } from '../../lib/supabase';

export const POST: APIRoute = ({ cookies }) => {
  clearAuthCookies(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export const GET: APIRoute = ({ cookies, redirect }) => {
  clearAuthCookies(cookies);
  return redirect('/portal/login');
};
