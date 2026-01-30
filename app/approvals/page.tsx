"use client";

import { useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useRole } from "@/context/role-context";
import { MermaidApprovalWorkflow } from "@/components/approvals/mermaid-approval-workflow";
import {
  loadApprovalStore,
  saveApprovalStore,
  APPROVAL_STATE_LABELS,
  type ApprovalState,
  type ApprovalStore,
  type TimelineEvent,
  type TimelineAction,
} from "@/lib/approvals-store";
import { cn } from "@/lib/utils";

const STATE_ORDER: ApprovalState[] = [
  "draft",
  "architecture_review",
  "security_review",
  "approved",
];

function actionLabel(action: TimelineAction): string {
  switch (action) {
    case "approved":
      return "Approved";
    case "requested_remediation":
      return "Requested remediation";
    case "final_approved":
      return "Final approved";
    case "comment":
      return "Comment";
    case "submitted":
      return "Submitted for review";
    default:
      return action;
  }
}

export default function ApprovalsPage() {
  const { role } = useRole();
  const [store, setStore] = useState<ApprovalStore>({
    state: "draft",
    securityApproved: false,
    timeline: [],
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    setStore(loadApprovalStore());
  }, []);

  const persist = useCallback((next: ApprovalStore) => {
    setStore(next);
    saveApprovalStore(next);
  }, []);

  const addTimelineEvent = useCallback(
    (action: TimelineAction, commentText?: string) => {
      const event: TimelineEvent = {
        id: crypto.randomUUID?.() ?? `ev-${Date.now()}`,
        role,
        action,
        comment: commentText || undefined,
        timestamp: new Date().toISOString(),
      };
      persist({
        ...store,
        timeline: [event, ...store.timeline],
      });
    },
    [store, role, persist]
  );

  const handleApprove = useCallback(() => {
    const event: TimelineEvent = {
      id: crypto.randomUUID?.() ?? `ev-${Date.now()}`,
      role,
      action: "approved",
      timestamp: new Date().toISOString(),
    };
    if (role === "Reviewer" && store.state === "architecture_review") {
      persist({
        ...store,
        state: "security_review",
        timeline: [event, ...store.timeline],
      });
      return;
    }
    if (role === "Security" && store.state === "security_review") {
      persist({
        ...store,
        securityApproved: true,
        timeline: [event, ...store.timeline],
      });
    }
  }, [store, role, persist]);

  const handleRequestRemediation = useCallback(() => {
    if (
      (role === "Reviewer" && store.state === "architecture_review") ||
      (role === "Security" && store.state === "security_review")
    ) {
      const event: TimelineEvent = {
        id: crypto.randomUUID?.() ?? `ev-${Date.now()}`,
        role,
        action: "requested_remediation",
        comment: comment || undefined,
        timestamp: new Date().toISOString(),
      };
      persist({
        ...store,
        state: "draft",
        securityApproved: false,
        timeline: [event, ...store.timeline],
      });
      setComment("");
    }
  }, [store, role, comment, persist]);

  const handleFinalApprove = useCallback(() => {
    if (
      role === "Approver" &&
      store.state === "security_review" &&
      store.securityApproved
    ) {
      const event: TimelineEvent = {
        id: crypto.randomUUID?.() ?? `ev-${Date.now()}`,
        role,
        action: "final_approved",
        timestamp: new Date().toISOString(),
      };
      persist({
        ...store,
        state: "approved",
        timeline: [event, ...store.timeline],
      });
    }
  }, [store, role, persist]);

  const handleAddComment = useCallback(() => {
    if (!comment.trim()) return;
    addTimelineEvent("comment", comment.trim());
    setComment("");
  }, [comment, addTimelineEvent]);

  const handleSubmitForReview = useCallback(() => {
    if (role !== "Author" || store.state !== "draft") return;
    const event: TimelineEvent = {
      id: crypto.randomUUID?.() ?? `ev-${Date.now()}`,
      role,
      action: "submitted",
      timestamp: new Date().toISOString(),
    };
    persist({
      ...store,
      state: "architecture_review",
      timeline: [event, ...store.timeline],
    });
  }, [store, role, persist]);

  const canAuthorSubmit = role === "Author" && store.state === "draft";
  const canReviewerSecurityAct =
    (role === "Reviewer" && store.state === "architecture_review") ||
    (role === "Security" && store.state === "security_review");
  const canApproverFinalApprove =
    role === "Approver" &&
    store.state === "security_review" &&
    store.securityApproved;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Approvals</h2>
        <p className="mt-1 text-sm text-slate-600">
          Review state, role-based actions, and decision timeline. State is persisted in local storage.
        </p>
      </div>

      {/* Current review state */}
      <section className="card">
        <h3 className="section-title">Current review state</h3>
        <p className="section-subtitle">Draft → Architecture Review → Security Review → Approved</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STATE_ORDER.map((s, i) => {
            const variant =
              s === "approved" ? "approved" : s === "draft" ? "draft" : "review";
            return (
              <span key={s} className="flex items-center gap-2">
                <Badge
                  variant={store.state === s ? variant : "default"}
                  className={cn(
                    store.state === s && "ring-2 ring-offset-1 ring-slate-400"
                  )}
                >
                  {APPROVAL_STATE_LABELS[s]}
                </Badge>
                {i < STATE_ORDER.length - 1 && (
                  <span className="text-slate-300" aria-hidden>
                    →
                  </span>
                )}
              </span>
            );
          })}
        </div>
        {store.state === "security_review" && store.securityApproved && (
          <p className="mt-3 text-sm text-slate-600">
            Security has approved. Awaiting Approver for Final Approve.
          </p>
        )}
      </section>

      {/* Mermaid state diagram */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Approval workflow</h3>
        <div className="mt-4">
          <MermaidApprovalWorkflow />
        </div>
      </section>

      {/* Role-based actions */}
      <section id="actions" className="card">
        <h3 className="section-title">Actions</h3>
        <p className="mt-1 text-sm text-slate-600">
          Current role: <strong>{role}</strong>. Buttons shown based on role and state.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {canReviewerSecurityAct && (
            <>
              <Button onClick={handleApprove}>Approve</Button>
              <Button variant="outline" onClick={handleRequestRemediation} className="border-slate-300">
                Request Remediation
              </Button>
            </>
          )}
          {canApproverFinalApprove && (
            <Button onClick={handleFinalApprove}>Final Approve</Button>
          )}
          {!canReviewerSecurityAct && !canApproverFinalApprove && (
            <p className="text-sm text-slate-500">
              No actions available for {role} in current state.
            </p>
          )}
        </div>
      </section>

      {/* Comment box */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Comment (as {role})</h3>
        <p className="mt-1 text-sm text-slate-600">
          Add a comment to the timeline. Stored with your current role.
        </p>
        <div className="mt-4 flex gap-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            aria-label="Comment"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddComment}
            disabled={!comment.trim()}
            className="shrink-0 self-end"
          >
            <Send className="mr-2 h-4 w-4" />
            Add comment
          </Button>
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-medium text-slate-800">Timeline</h3>
          <p className="mt-1 text-sm text-slate-600">
            Decisions and comments in reverse chronological order.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {store.timeline.length === 0 ? (
            <EmptyState
              title="No decisions yet"
              guidance="Submit for review, then use Approve or Request Remediation. Add a comment to record notes."
              action={
                <Button asChild variant="outline" size="sm">
                  <a href="#actions">View actions</a>
                </Button>
              }
              className="m-4 rounded-lg"
            />
          ) : (
            store.timeline.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 px-6 py-4 text-sm"
              >
                <div className="shrink-0 text-slate-500">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-slate-800">{event.role}</span>
                  <span className="text-slate-600"> — {actionLabel(event.action)}</span>
                  {event.comment && (
                    <p className="mt-1 text-slate-700">{event.comment}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
