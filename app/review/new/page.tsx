"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DATA_CLASSIFICATIONS = ["Public", "Internal", "Confidential"] as const;
const CLOUD_PREFERENCES = ["AWS", "Azure", "GCP"] as const;
const YES_NO = ["Yes", "No"] as const;

type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];
type CloudPreference = (typeof CLOUD_PREFERENCES)[number];
type YesNo = (typeof YES_NO)[number];

export type ReviewFormData = {
  productName: string;
  description: string;
  dataClassification: DataClassification;
  cloudPreference: CloudPreference;
  internetFacing: YesNo;
  usesAi: YesNo;
};

const STORAGE_KEY = "arch-review-poc:latest-review";

const defaultForm: ReviewFormData = {
  productName: "",
  description: "",
  dataClassification: "Internal",
  cloudPreference: "AWS",
  internetFacing: "No",
  usesAi: "No",
};

function formatYamlValue(value: string): string {
  if (value === "") return '""';
  if (/[\n#:\[\]{}|>*&!%@"'`,\s]/.test(value)) return JSON.stringify(value);
  return value;
}

function formToYaml(data: ReviewFormData): string {
  const lines = [
    "productName: " + formatYamlValue(data.productName),
    "description: " + formatYamlValue(data.description),
    "dataClassification: " + data.dataClassification,
    "cloudPreference: " + data.cloudPreference,
    "internetFacing: " + data.internetFacing,
    "usesAi: " + data.usesAi,
  ];
  return lines.join("\n");
}

const inputClass =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400";
const labelClass = "block text-sm font-medium text-slate-700";

export default function NewReviewPage() {
  const router = useRouter();
  const [form, setForm] = useState<ReviewFormData>(defaultForm);

  const update = useCallback(<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const yamlPreview = useMemo(() => formToYaml(form), [form]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      } catch (_) {
        // ignore storage errors
      }
      router.push("/review/results");
    },
    [form, router]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="page-title">New Architecture Review</h2>
        <p className="section-subtitle">
          Submit a new architecture review request. Data is saved locally and shown in the results page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-800">Review details</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label htmlFor="productName" className={labelClass}>
                Product Name
              </label>
              <input
                id="productName"
                type="text"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                className={cn(inputClass, "mt-1")}
                placeholder="e.g. Customer Portal API"
                required
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className={cn(inputClass, "mt-1 resize-y")}
                placeholder="Brief description of the product or service"
              />
            </div>
            <div>
              <label htmlFor="dataClassification" className={labelClass}>
                Data Classification
              </label>
              <select
                id="dataClassification"
                value={form.dataClassification}
                onChange={(e) => update("dataClassification", e.target.value as DataClassification)}
                className={cn(inputClass, "mt-1")}
              >
                {DATA_CLASSIFICATIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cloudPreference" className={labelClass}>
                Cloud Preference
              </label>
              <select
                id="cloudPreference"
                value={form.cloudPreference}
                onChange={(e) => update("cloudPreference", e.target.value as CloudPreference)}
                className={cn(inputClass, "mt-1")}
              >
                {CLOUD_PREFERENCES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="internetFacing" className={labelClass}>
                Internet Facing
              </label>
              <select
                id="internetFacing"
                value={form.internetFacing}
                onChange={(e) => update("internetFacing", e.target.value as YesNo)}
                className={cn(inputClass, "mt-1")}
              >
                {YES_NO.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="usesAi" className={labelClass}>
                Uses AI
              </label>
              <select
                id="usesAi"
                value={form.usesAi}
                onChange={(e) => update("usesAi", e.target.value as YesNo)}
                className={cn(inputClass, "mt-1")}
              >
                {YES_NO.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-800">Preview (YAML)</h3>
          <p className="mt-1 text-sm text-slate-600">
            Live preview of the data that will be submitted.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">
            <code>{yamlPreview || "# Enter values above"}</code>
          </pre>
        </section>

        <div className="flex gap-3">
          <Button type="submit">Submit review</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm(defaultForm)}
            className="border-slate-300 text-slate-700"
          >
            Reset form
          </Button>
        </div>
      </form>
    </div>
  );
}
