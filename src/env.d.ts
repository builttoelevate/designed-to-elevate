/// <reference types="astro/client" />

import type { PortalSession } from './lib/session';

declare namespace App {
  interface Locals {
    session: PortalSession | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly RESEND_API_KEY: string;
  readonly EMAIL_FROM: string;
  readonly ADMIN_NOTIFY_EMAIL: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
