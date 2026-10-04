/**
 * Public credentials for the read-only portfolio demo of /admin.
 *
 * LYHOFF is a portfolio project, so anyone may sign in to the admin with this
 * account and look at every screen. The account can never write: the Worker
 * refuses its admin writes (worker.ts, demoWriteGuard) and database triggers
 * refuse them again (supabase/demo-mode.sql). The password is public on
 * purpose, so it protects nothing and must never be reused anywhere.
 */
export const DEMO_ADMIN_EMAIL = "demo@lyhoff.com";
export const DEMO_ADMIN_PASSWORD = "LyhoffDemo-2026";
