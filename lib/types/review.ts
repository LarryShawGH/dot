/**
 * Shared types for the Architecture Review POC.
 * No business logic — definitions only.
 */

// ---------------------------------------------------------------------------
// ProductInput
// ---------------------------------------------------------------------------

export type DataClassification = "Public" | "Internal" | "Confidential";

export type CloudPreference = "AWS" | "Azure" | "GCP";

export type YesNo = "Yes" | "No";

/**
 * Input provided when creating or submitting a review (product context).
 */
export interface ProductInput {
  productName: string;
  description?: string;
  dataClassification: DataClassification;
  cloud: CloudPreference;
  internetFacing?: YesNo;
  usesAi?: YesNo;
}

// ---------------------------------------------------------------------------
// ReviewFinding, PassedControl, FailedControl
// ---------------------------------------------------------------------------

/**
 * A control that passed the review.
 */
export interface PassedControl {
  id: string;
  name: string;
  statement: string;
}

/**
 * Severity of a failed control (used for risk score calculation).
 */
export type FailureSeverity = "Critical" | "High";

/**
 * A control that failed the review, with remediation guidance.
 */
export interface FailedControl {
  id: string;
  name: string;
  remediation: string;
  severity?: FailureSeverity;
}

/**
 * A single review finding: either a passed or failed control.
 */
export type ReviewFinding =
  | (PassedControl & { status: "pass" })
  | (FailedControl & { status: "fail" });

// ---------------------------------------------------------------------------
// ReviewResult
// ---------------------------------------------------------------------------

export type RiskScore = "Low" | "Medium" | "High";

/**
 * Result of running a review: product context, controls outcome, and risk score.
 */
export interface ReviewResult {
  productName: string;
  dataClassification: DataClassification;
  cloud: CloudPreference;
  passedControls: PassedControl[];
  failedControls: FailedControl[];
  riskScore: RiskScore;
}

// ---------------------------------------------------------------------------
// TechnicalArchitectureDocument (TAD)
// ---------------------------------------------------------------------------

/**
 * A single control mapping entry (e.g. for TAD controls table).
 */
export interface ControlMapping {
  controlId: string;
  controlName: string;
  result: "PASS" | "FAIL";
}

/**
 * A tech stack category and items.
 */
export interface TechStackItem {
  category: string;
  items: string;
}

/**
 * A cost estimate line item.
 */
export interface CostEstimateItem {
  item: string;
  monthly: string;
  notes?: string;
}

/**
 * Technical Architecture Document: summary, diagram, controls, tech stack, cost.
 */
export interface TechnicalArchitectureDocument {
  summary: string;
  diagram: string;
  controls: ControlMapping[];
  techStack: TechStackItem[];
  cost: CostEstimateItem[];
}
