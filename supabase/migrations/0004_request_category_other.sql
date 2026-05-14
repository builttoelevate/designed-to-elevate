-- Designed to Elevate — Client Hub
-- Add 'other' to the allowed values for requests.category.
--
-- Originally locked to five buckets per §3 guardrail #5 of CLIENT_HUB_PLAN.md,
-- but real client use revealed a gap: requests that don't cleanly fit any of
-- the existing categories were getting forced into the wrong bucket. Adding a
-- sixth "Other" option keeps the structured categorization useful while
-- providing an honest escape hatch.

alter table public.requests
  drop constraint if exists requests_category_check;

alter table public.requests
  add constraint requests_category_check
  check (category in ('text', 'image', 'layout', 'new_feature', 'broken', 'other'));
