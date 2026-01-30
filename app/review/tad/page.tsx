"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MermaidTadArchitecture } from "@/components/review/mermaid-tad-architecture";
import type { TechnicalArchitectureDocument } from "@/lib/types/review";
import { cn } from "@/lib/utils";

export default function TadPage() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId") ?? "REV-001";

  const [tad, setTad] = useState<TechnicalArchitectureDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/tad/${encodeURIComponent(reviewId)}`);
        if (cancelled) return;
        if (!res.ok) {
          if (res.status === 404) {
            setError("TAD not found for this review.");
          } else {
            const err = await res.json().catch(() => ({}));
            setError((err.error as string) || `Request failed (${res.status})`);
          }
          setTad(null);
          setLoading(false);
          return;
        }
        const data: TechnicalArchitectureDocument = await res.json();
        setTad(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load TAD");
          setTad(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="page-title">Technical Architecture Document</h1>
        <div className="card flex items-center justify-center py-12">
          <p className="text-sm text-slate-600">Loading document…</p>
        </div>
      </div>
    );
  }

  if (error || !tad) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="page-title">Technical Architecture Document</h1>
        <div className="card rounded-lg border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-medium text-amber-900">Document not found</p>
          <p className="mt-2 text-sm text-amber-800">{error ?? "Document not found."}</p>
          <p className="mt-3 text-sm text-amber-700">
            Run an architecture review from the dashboard to generate a TAD, or open a review that already exists.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/review/new">Start new review</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/review/results">Review results</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalMonthly = tad.cost.reduce((sum, row) => {
    const value = row.monthly.replace(/[^0-9.]/g, "");
    return sum + (parseFloat(value) || 0);
  }, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Header: title, badge, back link */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">Technical Architecture Document</h1>
          <Badge variant="approved" className="shrink-0">
            Auto-generated from approved standards
          </Badge>
        </div>
        <p className="section-subtitle">
          Architecture summary, controls mapping, tech stack, and cost estimate. Read-only.
        </p>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/review/results">Back to review results</Link>
          </Button>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Executive Summary</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          {(() => {
            const paragraphs = (tad.summary || "")
              .split(/(?<=\.)\s+/)
              .map((p) => p.trim())
              .filter(Boolean);
            if (paragraphs.length === 0) {
              return <p>{tad.summary || "No summary available."}</p>;
            }
            return paragraphs.map((p, i) => <p key={i}>{p}</p>);
          })()}
        </div>
      </section>

      {/* 2. Architecture Diagram (Mermaid) */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Architecture Diagram</h2>
        <p className="mt-1 text-sm text-slate-600">
          Proposed architecture (AWS-based). Rendered from Mermaid.
        </p>
        <div className="mt-4">
          <MermaidTadArchitecture code={tad.diagram} />
        </div>
      </section>

      {/* 3. Security & Compliance Mapping */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Security & Compliance Mapping</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mapping of controls to PASS/FAIL based on the architecture review.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Control ID</TableHead>
              <TableHead className="text-slate-700">Control</TableHead>
              <TableHead className="text-slate-700">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tad.controls.length === 0 ? (
              <TableRow className="border-slate-100">
                <TableCell colSpan={3} className="py-8 text-center text-slate-500">
                  No controls to display.
                </TableCell>
              </TableRow>
            ) : (
              tad.controls.map((row) => (
                <TableRow key={row.controlId} className="border-slate-100">
                  <TableCell className="font-mono text-sm font-medium text-slate-900">
                    {row.controlId}
                  </TableCell>
                  <TableCell className="text-slate-800">{row.controlName}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        row.result === "PASS" && "bg-emerald-100 text-emerald-800",
                        row.result === "FAIL" && "bg-red-100 text-red-800"
                      )}
                    >
                      {row.result}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* 4. Recommended Tech Stack (list) */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Recommended Tech Stack</h2>
        <p className="mt-1 text-sm text-slate-600">
          Suggested services aligned with the architecture diagram.
        </p>
        <ul className="mt-4 space-y-2">
          {tad.techStack.map((item) => (
            <li key={item.category} className="flex gap-2 text-sm text-slate-700">
              <span className="font-medium text-slate-800">{item.category}:</span>
              <span>{item.items}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Cost Estimate */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Cost Estimate</h2>
        <p className="mt-1 text-sm text-slate-600">
          Estimated monthly cost for baseline configuration. Not a quote.
        </p>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Item</TableHead>
              <TableHead className="text-slate-700">Monthly</TableHead>
              <TableHead className="text-slate-700">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tad.cost.map((row) => (
              <TableRow key={row.item} className="border-slate-100">
                <TableCell className="font-medium text-slate-900">{row.item}</TableCell>
                <TableCell className="text-slate-800">{row.monthly}</TableCell>
                <TableCell className="text-slate-600">{row.notes ?? "—"}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-slate-200 bg-slate-50 font-medium">
              <TableCell className="text-slate-900">Total (estimated)</TableCell>
              <TableCell className="text-slate-900">${Math.round(totalMonthly)}/mo</TableCell>
              <TableCell className="text-slate-600">—</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
