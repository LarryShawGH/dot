"use client";

import { useEffect, useId, useRef } from "react";

const DEFAULT_DIAGRAM = `flowchart LR
  User --> ALB[ALB]
  ALB --> ECS[ECS]
  ECS --> Bedrock[Bedrock]
  ECS --> RDS[RDS]
  ECS --> SM[Secrets Manager]`;

export function MermaidTadArchitecture({ code }: { code?: string }) {
  const diagramCode = code?.trim() || DEFAULT_DIAGRAM;
  const id = "mermaid-tad-arch-" + useId().replace(/:/g, "");
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
        const { svg } = await mermaid.render(id, diagramCode);
        if (!cancelled) el.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [id, diagramCode]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-[140px] items-center justify-center rounded-lg border border-slate-200 bg-white p-6 [&_svg]:max-w-full"
      aria-label="Architecture: User to ALB to ECS to Bedrock, RDS, Secrets Manager"
    />
  );
}
