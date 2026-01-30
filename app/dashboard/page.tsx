import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";
import { MermaidWorkflow } from "@/components/dashboard/mermaid-workflow";
import reviewsData from "@/data/mock-reviews.json";
import { cn } from "@/lib/utils";

type Review = {
  reviewId: string;
  productName: string;
  status: string;
  lastUpdated: string;
};

const reviews: Review[] = reviewsData as Review[];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Approved"
      ? "approved"
      : status === "In Review" || status === "Pending Approval"
        ? "review"
        : status === "Provisioning"
          ? "provisioning"
          : status === "Draft"
            ? "draft"
            : "default";
  return <Badge variant={variant}>{status}</Badge>;
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="card p-8">
        <h1 className="page-title text-2xl sm:text-3xl">
          Automated Architecture Reviews for Government & Enterprise
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Streamline architecture review requests, approvals, and provisioning in one platform.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/review/new" className="inline-flex items-center gap-2">
              Start New Architecture Review
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Mermaid workflow */}
      <section>
        <h2 className="section-title mb-3">Review workflow</h2>
        <p className="section-subtitle mb-4">Idea → Review → Approval → Provisioning</p>
        <MermaidWorkflow />
      </section>

      {/* Recent reviews table */}
      <section>
        <h2 className="section-title mb-1">Recent reviews</h2>
        <p className="section-subtitle mb-4">Latest architecture review requests and status</p>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="text-slate-700">Review ID</TableHead>
                <TableHead className="text-slate-700">Product Name</TableHead>
                <TableHead className="text-slate-700">Status</TableHead>
                <TableHead className="text-slate-700">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((row) => (
                <TableRow key={row.reviewId} className="border-slate-100">
                  <TableCell className="font-medium text-slate-900">
                    {row.reviewId}
                  </TableCell>
                  <TableCell className="text-slate-700">{row.productName}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(row.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
