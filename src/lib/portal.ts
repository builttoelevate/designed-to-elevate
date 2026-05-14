/**
 * Shared labels + types for the Client Hub.
 * Mirror of CLIENT_HUB_PLAN.md §6 — UI strings are decided. Don't invent variants.
 */

export type RequestStatus = 'new' | 'in_progress' | 'waiting_on_client' | 'complete';
export type RequestCategory = 'text' | 'image' | 'layout' | 'new_feature' | 'broken';
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
];

export const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
];

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
