"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Check, Circle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { loadApprovalStore } from "@/lib/approvals-store";
import { cn } from "@/lib/utils";

type StepCompleteState = Record<string, boolean>;

const STEPS = [
  { id: "workspace", label: "Create Cloud Workspace" },
  { id: "git", label: "Initialize Git Repo" },
  { id: "ci", label: "Configure CI Pipeline" },
] as const;

const MOCK_LOG_LINES = [
  "[INFO] Provisioning started",
  "[INFO] Step 1: Create Cloud Workspace",
  "[INFO] Validating cloud provider credentials...",
  "[OK] Credentials validated",
  "[INFO] Creating workspace 'arch-review-workspace'...",
  "[OK] Workspace created",
  "[INFO] Step 2: Initialize Git Repo",
  "[INFO] Cloning template repository...",
  "[OK] Repository initialized",
  "[INFO] Step 3: Configure CI Pipeline",
  "[INFO] Creating pipeline configuration...",
  "[OK] CI pipeline configured",
  "[INFO] Provisioning complete",
];

const TERRAFORM_SNIPPET = `# Create Cloud Workspace (sample)
resource "aws_workspaces_workspace" "main" {
  directory_id = aws_workspaces_directory.main.id
  bundle_id    = data.aws_workspaces_bundle.value_windows_10.id
  user_name    = "arch-review-user"

  workspace_properties {
    compute_type_name                         = "VALUE"
    user_volume_size_gib                      = 50
    root_volume_size_gib                      = 80
    running_mode                              = "ALWAYS_ON"
    running_mode_options {
      compute_type_name = "VALUE"
    }
  }

  tags = {
    Environment = "arch-review-poc"
    Project     = "Architecture Review"
  }
}`;

function ProvisioningApprovedContent({
  stepComplete,
  logLines,
  allComplete,
  logEndRef,
}: {
  stepComplete: StepCompleteState;
  logLines: string[];
  allComplete: boolean;
  logEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Provisioning</h2>
        <p className="mt-1 text-sm text-slate-600">
          Provisioning steps run after approval. Log stream is mocked.
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Provisioning steps</h3>
        <ul className="mt-4 space-y-4">
          {STEPS.map((step) => {
            const complete = stepComplete[step.id];
            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-4 py-3 transition-colors",
                  complete
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-100 bg-slate-50"
                )}
              >
                {complete ? (
                  <Check
                    className="h-5 w-5 shrink-0 text-emerald-600"
                    aria-label="Complete"
                  />
                ) : (
                  <Circle
                    className="h-5 w-5 shrink-0 text-slate-300"
                    aria-label="Pending"
                  />
                )}
                <span
                  className={cn(
                    "font-medium",
                    complete ? "text-emerald-800" : "text-slate-700"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
        {allComplete && (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            All steps completed successfully.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-medium text-slate-800">Log stream</h3>
          <p className="mt-0.5 text-xs text-slate-500">Mocked output; updates every 600ms.</p>
        </div>
        <div className="max-h-64 overflow-y-auto bg-slate-900 px-4 py-3 font-mono text-xs text-slate-300">
          {logLines.length === 0 ? (
            <span className="text-slate-500">Waiting for log output...</span>
          ) : (
            logLines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Sample Terraform: workspace creation</h3>
        <p className="mt-1 text-sm text-slate-600">
          Example Terraform for creating a cloud workspace (AWS WorkSpaces).
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">
          <code>{TERRAFORM_SNIPPET}</code>
        </pre>
      </section>
    </div>
  );
}

export default function ProvisioningPage() {
  const [approved, setApproved] = useState<boolean | null>(null);
  const [stepComplete, setStepComplete] = useState<StepCompleteState>({
    workspace: false,
    git: false,
    ci: false,
  });
  const [logLines, setLogLines] = useState<string[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const store = loadApprovalStore();
    setApproved(store.state === "approved");
  }, []);

  useEffect(() => {
    if (approved !== true) return;

    const stepDelays = [
      { id: "workspace", ms: 2500 },
      { id: "git", ms: 5000 },
      { id: "ci", ms: 7500 },
    ];

    const timers = stepDelays.map(({ id, ms }) =>
      setTimeout(() => {
        setStepComplete((prev) => ({ ...prev, [id]: true }));
      }, ms)
    );

    const allDoneTimer = setTimeout(() => setAllComplete(true), 8500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(allDoneTimer);
    };
  }, [approved]);

  useEffect(() => {
    if (approved !== true || MOCK_LOG_LINES.length === 0) return;

    const interval = 600;
    let index = 0;
    const id = setInterval(() => {
      if (index >= MOCK_LOG_LINES.length) {
        clearInterval(id);
        return;
      }
      setLogLines((prev) => [...prev, MOCK_LOG_LINES[index]]);
      index += 1;
    }, interval);

    return () => clearInterval(id);
  }, [approved]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logLines]);

  let content: ReactNode;
  if (approved === null) {
    content = (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  } else if (approved !== true) {
    content = (
      <div className="space-y-6">
        <div>
          <h2 className="page-title">Provisioning</h2>
          <p className="section-subtitle">
            Provisioning is only available after the review is approved.
          </p>
        </div>
        <EmptyState
          icon={<Lock className="h-10 w-10" />}
          title="Review must be approved first"
          guidance="Complete the approval workflow in Approvals and receive Final Approve. Then return here to run provisioning steps."
          action={
            <Button asChild>
              <Link href="/approvals">Go to Approvals</Link>
            </Button>
          }
        />
      </div>
    );
  } else {
    content = (
      <ProvisioningApprovedContent
        stepComplete={stepComplete}
        logLines={logLines}
        allComplete={allComplete}
        logEndRef={logEndRef}
      />
    );
  }

  return content;
}
