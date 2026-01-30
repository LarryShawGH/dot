"use client";

import { useEffect, useId, useRef } from "react";

const DIAGRAM_CODE = `flowchart LR
  A[Idea] --> B[Review]
  B --> C[Approval]
  C --> D[Provisioning]`;

export function MermaidWorkflow() {
  const id = "mermaid-workflow-" + useId().replace(/:/g, "");
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
      className="flex min-h-[120px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 [&_svg]:max-w-full"
      aria-label="Workflow: Idea to Review to Approval to Provisioning"
    />
  );
}
