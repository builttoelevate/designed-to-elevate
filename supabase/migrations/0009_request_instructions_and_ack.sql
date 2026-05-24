-- Admin-logged jobs with client instructions + acknowledgment.
--
-- Two additions to public.requests:
--   instructions          — optional text the admin writes FOR the client
--                           (e.g. "update your Google password and send it
--                           to me"). Distinct from `description`, which
--                           describes the job itself. When non-null, the
--                           client's request detail page surfaces it with a
--                           "Got it" acknowledgment button.
--   instructions_ack_at   — timestamp stamped when the client acknowledges
--                           they've read the instructions. NULL = not yet
--                           seen. Lets the admin see whether the client has
--                           acknowledged.
--
-- Admin-created jobs reuse the existing schema otherwise: submitted_by is
-- the admin's profile id, client_id is the target client, normal status
-- lifecycle. No new table needed.
--
-- Idempotent — safe to re-run.

alter table public.requests
  add column if not exists instructions text;

alter table public.requests
  add column if not exists instructions_ack_at timestamptz;
