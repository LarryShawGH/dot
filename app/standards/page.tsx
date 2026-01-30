"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FRAMEWORKS = [
  "NIST 800-53",
  "CIS Benchmarks",
  "Internal Policy",
] as const;

type Framework = (typeof FRAMEWORKS)[number];

type UploadedStandard = {
  id: string;
  fileName: string;
  framework: Framework;
  uploadedAt: string;
};

type Control = {
  controlId: string;
  statement: string;
  severity: string;
};

// Mock parsed controls shown after upload (no real parsing)
const MOCK_CONTROLS: Control[] = [
  { controlId: "AC-2", statement: "Account management: Create, enable, modify, disable, and remove accounts.", severity: "High" },
  { controlId: "AC-7", statement: "Unsuccessful logon attempts: Enforce limit and lockout after failed attempts.", severity: "Medium" },
  { controlId: "SC-8", statement: "Transmission confidentiality and integrity: Protect information in transit.", severity: "High" },
  { controlId: "SI-3", statement: "Malicious code protection: Deploy and maintain anti-malware mechanisms.", severity: "High" },
  { controlId: "AU-6", statement: "Audit review and analysis: Review and analyze audit records.", severity: "Medium" },
];

const ACCEPT_TYPES = ".pdf,.docx,.md";
const ACCEPT_DESCRIPTION = "PDF, DOCX, or MD";

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[severity] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {severity}
    </span>
  );
}

export default function StandardsPage() {
  const [framework, setFramework] = useState<Framework>("NIST 800-53");
  const [uploadedStandards, setUploadedStandards] = useState<UploadedStandard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const id = crypto.randomUUID?.() ?? `std-${Date.now()}`;
      setUploadedStandards((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          framework,
          uploadedAt: new Date().toISOString(),
        },
      ]);
      e.target.value = "";
    },
    [framework]
  );

  const removeUpload = useCallback((id: string) => {
    setUploadedStandards((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const hasUploads = uploadedStandards.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-title">Standards</h2>
        <p className="section-subtitle">
          Upload standards documents and map to frameworks. Controls are previewed only (no parsing).
        </p>
      </div>

      {/* Upload section */}
      <section className="card">
        <h3 className="section-title">Upload standard</h3>
        <p className="mt-1 text-sm text-slate-600">
          Select a framework and choose a file ({ACCEPT_DESCRIPTION}). A mock controls preview will appear after upload.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="framework" className="block text-sm font-medium text-slate-700">
              Framework
            </label>
            <select
              id="framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
              className="block w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {FRAMEWORKS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_TYPES}
              onChange={handleFileChange}
              className="sr-only"
              id="standards-file"
              aria-label={`Upload file (${ACCEPT_DESCRIPTION})`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose file
            </Button>
          </div>
        </div>
      </section>

      {/* Uploaded standards list */}
      {hasUploads && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-800">Uploaded standards</h3>
          <ul className="mt-3 space-y-2">
            {uploadedStandards.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{s.fileName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-600">{s.framework}</span>
                  <span className="text-slate-400">
                    {new Date(s.uploadedAt).toLocaleString()}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-700"
                  onClick={() => removeUpload(s.id)}
                  aria-label={`Remove ${s.fileName}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Parsed controls preview (mock) */}
      {hasUploads && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-sm font-medium text-slate-800">Parsed controls preview</h3>
            <p className="mt-1 text-sm text-slate-600">
              Example controls (mock data; no backend parsing).
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="text-slate-700">Control ID</TableHead>
                <TableHead className="text-slate-700">Statement</TableHead>
                <TableHead className="text-slate-700">Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CONTROLS.map((c) => (
                <TableRow key={c.controlId} className="border-slate-100">
                  <TableCell className="font-mono text-sm font-medium text-slate-900">
                    {c.controlId}
                  </TableCell>
                  <TableCell className="text-slate-700">{c.statement}</TableCell>
                  <TableCell>
                    <SeverityBadge severity={c.severity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
