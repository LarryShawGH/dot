"use client";

import { useEffect, useId, useRef } from "react";

const DIAGRAM_CODE = `stateDiagram-v2
  [*] --> Draft
  Draft --> ArchitectureReview: Submit
  ArchitectureReview --> SecurityReview: Reviewer Approves
  ArchitectureReview --> Draft: Request Remediation
  SecurityReview --> Approved: Final Approve
  SecurityReview --> Draft: Request Remediation`;

export function MermaidApprovalWorkflow() {
  const id = "mermaid-approval-" + useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    const run = async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
      });
      if (cancelled) return;
      try {
        const { svg } = await mermaid.render(id, DIAGRAM_CODE);
        if (!cancelled) el.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[180px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 [&_svg]:max-w-full"
      aria-label="Approval workflow: Draft to Architecture Review to Security Review to Approved"
    />
  );
}
