export type ApprovalState =
  | "draft"
  | "architecture_review"
  | "security_review"
  | "approved";

export type TimelineAction =
  | "approved"
  | "requested_remediation"
  | "final_approved"
  | "comment"
  | "submitted";

export type TimelineEvent = {
  id: string;
  role: string;
  action: TimelineAction;
  comment?: string;
  timestamp: string;
};

export type ApprovalStore = {
  state: ApprovalState;
  securityApproved: boolean;
  timeline: TimelineEvent[];
};

const STORAGE_KEY = "arch-review-poc:approvals";

const DEFAULT_STORE: ApprovalStore = {
  state: "draft",
  securityApproved: false,
  timeline: [],
};

export function loadApprovalStore(): ApprovalStore {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    const parsed = JSON.parse(raw) as ApprovalStore;
    return {
      state: parsed.state ?? DEFAULT_STORE.state,
      securityApproved: Boolean(parsed.securityApproved),
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : DEFAULT_STORE.timeline,
    };
  } catch {
    return DEFAULT_STORE;
  }
}

export function saveApprovalStore(store: ApprovalStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export const APPROVAL_STATE_LABELS: Record<ApprovalState, string> = {
  draft: "Draft",
  architecture_review: "Architecture Review",
  security_review: "Security Review",
  approved: "Approved",
};
