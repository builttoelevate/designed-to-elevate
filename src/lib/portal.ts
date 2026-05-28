/**
 * Shared labels + types for the Client Hub.
 * Mirror of CLIENT_HUB_PLAN.md §6 — UI strings are decided. Don't invent variants.
 */

export type RequestStatus = 'new' | 'in_progress' | 'waiting_on_client' | 'complete';
export type RequestCategory = 'text' | 'image' | 'layout' | 'new_feature' | 'broken' | 'other';
export type RequestPriority = 'normal' | 'important' | 'urgent';
export type BillingType = 'included' | 'billable' | 'needs_estimate' | 'courtesy';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  in_progress: 'In Progress',
  waiting_on_client: 'Waiting on You',
  complete: 'Complete',
};

export const STATUS_DESCRIPTIONS: Record<RequestStatus, string> = {
  new: "We received your request and it's in the queue.",
  in_progress: 'Your update is being worked on.',
  waiting_on_client:
    'We need one more detail, file, or approval before moving forward.',
  complete: 'Your update has been completed.',
};

export const STATUS_ORDER: RequestStatus[] = [
  'new',
  'in_progress',
  'waiting_on_client',
  'complete',
];

export const CATEGORY_OPTIONS: { value: RequestCategory; label: string }[] = [
  { value: 'text', label: 'Text update' },
  { value: 'image', label: 'Image or photo update' },
  { value: 'layout', label: 'Layout or design change' },
  { value: 'new_feature', label: 'New page or feature' },
  { value: 'broken', label: "Something's broken" },
  { value: 'other', label: 'Other' },
];

// Labels are intentionally client-facing ("how urgently do you need to act?")
// rather than internal triage labels. They render the same in the admin UI;
// the admin sees the same words a client does so there's one shared vocabulary.
export const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: 'normal', label: 'Whenever you get a chance' },
  { value: 'important', label: "Soon — please don't sit on it" },
  { value: 'urgent', label: "Blocking — I can't move forward" },
];

// Used to compare priorities for escalation emails: a change is an escalation
// only when the new rank is strictly greater than the previous one.
const PRIORITY_RANK: Record<RequestPriority, number> = {
  normal: 0,
  important: 1,
  urgent: 2,
};

export function priorityRank(value: string): number {
  return PRIORITY_RANK[value as RequestPriority] ?? 0;
}

export const BILLING_OPTIONS: { value: BillingType; label: string }[] = [
  { value: 'included', label: 'Included in plan' },
  { value: 'billable', label: 'Billable' },
  { value: 'needs_estimate', label: 'Needs estimate' },
  { value: 'courtesy', label: 'Courtesy' },
];

export function categoryLabel(value: string): string {
  return CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function priorityLabel(value: string): string {
  return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function billingLabel(value: string): string {
  return BILLING_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

// Page URLs are optional + freeform — clients can type "site.com" without a
// scheme. Prepend https:// for `<a href>` so the link goes to the right
// place; the displayed text stays as whatever the client originally typed.
export function externalUrl(value: string | null | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function relativeDate(value: string | Date | null): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
