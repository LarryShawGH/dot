import type {
  ProductInput,
  ReviewResult,
  PassedControl,
  FailedControl,
  RiskScore,
  FailureSeverity,
} from "@/lib/types/review";

/**
 * All controls evaluated by the mock rules engine.
 * Controls that can fail (AI-1, SC-7) are excluded from passed when a rule fires.
 */
const ALL_CONTROLS: PassedControl[] = [
  { id: "EN-01", name: "Encryption at Rest", statement: "Data at rest is encrypted using approved algorithms." },
  { id: "AU-01", name: "Audit Logging", statement: "Security-relevant events are logged and retained." },
  { id: "NS-01", name: "Network Segmentation", statement: "Workloads are placed in appropriate network segments." },
  { id: "IA-01", name: "Identity and Access", statement: "Access is governed by identity and least privilege." },
  { id: "AI-1", name: "Private AI Endpoints", statement: "AI/ML services use private connectivity only." },
  { id: "SC-7", name: "Private Networking", statement: "Confidential data is not exposed to the public internet." },
];

const AI1_FAIL: Omit<FailedControl, "severity"> & { severity: FailureSeverity } = {
  id: "AI-1",
  name: "Private AI Endpoints",
  remediation:
    "Deploy private endpoints for all AI/ML services. Ensure no public internet exposure for confidential data. Use VPC endpoints (AWS), Private Link (Azure), or Private Google Access (GCP).",
  severity: "Critical",
};

const SC7_FAIL: Omit<FailedControl, "severity"> & { severity: FailureSeverity } = {
  id: "SC-7",
  name: "Private Networking",
  remediation:
    "Restrict confidential workloads to private networking. Use VPC, Private Link, or equivalent to avoid internet-facing exposure.",
  severity: "High",
};

/**
 * Mock rules engine: deterministic evaluation from ProductInput to ReviewResult.
 *
 * Rules:
 * - If usesAi === "Yes" AND dataClassification === "Confidential" → Fail AI-1 (Private AI Endpoints), severity Critical.
 * - If internetFacing === "Yes" AND dataClassification === "Confidential" → Fail SC-7 (Private Networking), severity High.
 * - Otherwise those controls pass.
 *
 * Risk score:
 * - Any Critical failure → High
 * - Only High failures → Medium
 * - All pass → Low
 */
export function runReview(input: ProductInput): ReviewResult {
  const failed: FailedControl[] = [];
  const usesAi = input.usesAi === "Yes";
  const internetFacing = input.internetFacing === "Yes";
  const isConfidential = input.dataClassification === "Confidential";

  if (usesAi && isConfidential) {
    failed.push(AI1_FAIL);
  }
  if (internetFacing && isConfidential) {
    failed.push(SC7_FAIL);
  }

  const failedIds = new Set(failed.map((f) => f.id));
  const passedControls: PassedControl[] = ALL_CONTROLS.filter((c) => !failedIds.has(c.id));

  const riskScore = computeRiskScore(failed);

  return {
    productName: input.productName,
    dataClassification: input.dataClassification,
    cloud: input.cloud,
    passedControls,
    failedControls: failed,
    riskScore,
  };
}

function computeRiskScore(failed: FailedControl[]): RiskScore {
  if (failed.length === 0) return "Low";
  const hasCritical = failed.some((f) => f.severity === "Critical");
  const hasHigh = failed.some((f) => f.severity === "High");
  if (hasCritical) return "High";
  if (hasHigh) return "Medium";
  return "Low";
}
