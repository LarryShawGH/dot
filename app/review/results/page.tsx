"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MermaidResultsFlow } from "@/components/review/mermaid-results-flow";
import type { ReviewResult } from "@/lib/types/review";
import type { ReviewFormData } from "../new/page";

const STORAGE_KEY = "arch-review-poc:latest-review";

/** Mock product input when no form data is in localStorage. */
const MOCK_PRODUCT_INPUT = {
  productName: "Demo Product",
  description: "Architecture review demo.",
  dataClassification: "Internal" as const,
  cloud: "AWS" as const,
  internetFacing: "No" as const,
  usesAi: "No" as const,
};

function formDataToProductInput(data: ReviewFormData) {
  return {
    productName: data.productName || "Unnamed",
    description: data.description || undefined,
    dataClassification: data.dataClassification,
    cloud: data.cloudPreference,
    internetFacing: data.internetFacing,
    usesAi: data.usesAi,
  };
}

export default function ReviewResultsPage() {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runReview() {
      let body: typeof MOCK_PRODUCT_INPUT;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const form: ReviewFormData = JSON.parse(raw);
          body = formDataToProductInput(form);
        } else {
          body = MOCK_PRODUCT_INPUT;
        }
      } catch {
        body = MOCK_PRODUCT_INPUT;
      }

      try {
        const res = await fetch("/api/review/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (cancelled) return;
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || `Request failed (${res.status})`);
          setLoading(false);
          return;
        }
        const data: ReviewResult = await res.json();
        setResult(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to run review");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    runReview();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="page-title">Review results</h2>
        <div className="card flex items-center justify-center py-12">
          <p className="text-sm text-slate-600">Running architecture review…</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="space-y-6">
        <h2 className="page-title">Review results</h2>
        <EmptyState
          title="Review failed"
          guidance={error ?? "No results returned. Try again or start a new review."}
          action={
            <Button asChild>
              <Link href="/review/new">Start new review</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const riskVariant = result.riskScore === "Low" ? "success" : result.riskScore === "Medium" ? "warning" : "failure";

  return (
    <div className="space-y-8">
      {/* Product summary */}
      <section className="card">
        <h2 className="section-title">Product summary</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-medium text-slate-600">Product name</dt>
            <dd className="mt-0.5 text-slate-900">{result.productName}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Data classification</dt>
            <dd className="mt-0.5 text-slate-900">{result.dataClassification}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Cloud</dt>
            <dd className="mt-0.5 text-slate-900">{result.cloud}</dd>
          </div>
        </dl>
      </section>

      {/* Overall risk score */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-slate-800">Overall risk score</h3>
        <p className="mt-1 text-sm text-slate-600">
          Derived from the architecture review rules engine.
        </p>
        <div className="mt-4">
          <Badge variant={riskVariant} className="px-4 py-2 text-sm font-semibold">
            {result.riskScore}
          </Badge>
        </div>
      </section>

      {/* Mermaid: Input → Rules Engine → Findings → TAD */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-slate-800">Results flow</h3>
        <MermaidResultsFlow />
      </section>

      {/* Passed controls */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-medium text-slate-800">Passed controls</h3>
          <p className="mt-1 text-sm text-slate-600">
            Controls that passed the rules engine.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Control ID</TableHead>
              <TableHead className="text-slate-700">Control</TableHead>
              <TableHead className="text-slate-700">Statement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.passedControls.length === 0 ? (
              <TableRow className="border-slate-100">
                <TableCell colSpan={3} className="py-8 text-center text-slate-500">
                  No passed controls to display.
                </TableCell>
              </TableRow>
            ) : (
              result.passedControls.map((c) => (
                <TableRow key={c.id} className="border-slate-100">
                  <TableCell className="font-mono text-sm font-medium text-slate-900">
                    {c.id}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                  <TableCell className="text-slate-700">{c.statement}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Failed controls with remediation */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-medium text-slate-800">Failed controls</h3>
          <p className="mt-1 text-sm text-slate-600">
            Controls that failed with remediation guidance.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="text-slate-700">Control ID</TableHead>
              <TableHead className="text-slate-700">Control</TableHead>
              <TableHead className="text-slate-700">Remediation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.failedControls.length === 0 ? (
              <TableRow className="border-slate-100">
                <TableCell colSpan={3} className="py-8 text-center text-slate-500">
                  No failed controls.
                </TableCell>
              </TableRow>
            ) : (
              result.failedControls.map((c) => (
                <TableRow key={c.id} className="border-slate-100">
                  <TableCell className="font-mono text-sm font-medium text-slate-900">
                    {c.id}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{c.name}</TableCell>
                  <TableCell className="text-slate-700">{c.remediation}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/review/tad?reviewId=REV-001">View Generated Architecture Document</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/review/new">Submit another review</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
