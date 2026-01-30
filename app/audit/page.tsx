"use client";

import { useEffect, useState } from "react";
import { FileJson, FileText, Download, FolderOpen, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadApprovalStore } from "@/lib/approvals-store";
import { cn } from "@/lib/utils";

type AuditEvent = {
  timestamp: string;
  actor: string;
  action: string;
};

const EVIDENCE_FILES = [
  { name: "standards.json", icon: FileJson },
  { name: "rules.json", icon: FileJson },
  { name: "tad.pdf", icon: FileText },
  { name: "approvals.json", icon: FileJson },
  { name: "audit.log", icon: FileText },
] as const;

function buildAuditEvents(): AuditEvent[] {
  const store = loadApprovalStore();
  const events: AuditEvent[] = [];

  // Mock submission event
  events.push({
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    actor: "Author",
    action: "Submission: review request created",
  });

  // Events from approvals timeline (review, approval)
  if (store.timeline.length > 0) {
    const sorted = [...store.timeline].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    for (const e of sorted) {
      const action =
        e.action === "submitted"
          ? "Submission: submitted for review"
          : e.action === "approved"
            ? "Review: architecture review approved"
            : e.action === "requested_remediation"
              ? "Review: remediation requested"
              : e.action === "final_approved"
                ? "Approval: final approved"
                : e.action === "comment"
                  ? "Comment"
                  : e.action;
      events.push({
        timestamp: e.timestamp,
        actor: e.role,
        action: e.comment ? `${action}: ${e.comment}` : action,
      });
    }
  } else {
    // Fallback mock review/approval events when no timeline
    events.push({
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      actor: "Reviewer",
      action: "Review: architecture review approved",
    });
    events.push({
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: "Security",
      action: "Review: security review approved",
    });
    events.push({
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      actor: "Approver",
      action: "Approval: final approved",
    });
  }

  // Mock provisioning event
  if (store.state === "approved") {
    events.push({
      timestamp: new Date().toISOString(),
      actor: "System",
      action: "Provisioning: workspace and CI pipeline created",
    });
  }

  // Sort newest first (immutable: we don't mutate, we sort a copy)
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    setEvents(buildAuditEvents());
  }, []);

  const handleExportEvidence = () => {
    // Mock action
    alert("Export Evidence is not implemented. This is a mock action.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Audit log</h2>
          <p className="section-subtitle">
            Immutable audit trail: submission, review, approval, provisioning. Evidence bundle below.
          </p>
        </div>
        <Button onClick={handleExportEvidence} className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          Export Evidence
        </Button>
      </div>

      {/* Audit log table */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-medium text-slate-800">Audit events</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Timestamp, actor, and action. Sorted newest first; read-only.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Timestamp</TableHead>
              <TableHead className="text-slate-700">Actor</TableHead>
              <TableHead className="text-slate-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow className="border-slate-100">
                <TableCell colSpan={3} className="p-0">
                  <EmptyState
                    icon={<Inbox className="h-10 w-10" />}
                    title="No audit events yet"
                    guidance="Events appear when you submit a review, advance approvals, or run provisioning. Try the workflow from Dashboard → New Review."
                    className="m-4 rounded-lg border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              events.map((event, i) => (
                <TableRow
                  key={`${event.timestamp}-${i}`}
                  className="border-slate-100 hover:bg-slate-50/50"
                >
                  <TableCell className="font-mono text-xs text-slate-600 tabular-nums">
                    {formatTimestamp(event.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {event.actor}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {event.action}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Evidence Bundle file tree */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Evidence bundle</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Virtual file tree of exported evidence (mock).
        </p>
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/50 p-3 font-mono text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span>evidence-bundle/</span>
          </div>
          <ul className="ml-6 mt-2 space-y-1.5 border-l border-slate-200 pl-3">
            {EVIDENCE_FILES.map(({ name, icon: Icon }) => (
              <li key={name} className="flex items-center gap-2 text-slate-700">
                <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
