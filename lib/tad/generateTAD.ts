/**
 * TAD generator: ReviewResult → TechnicalArchitectureDocument.
 * Fixed template, no LLMs, no randomness.
 * Diagram is returned as Mermaid syntax.
 */

import type {
  ReviewResult,
  TechnicalArchitectureDocument,
  ControlMapping,
  TechStackItem,
  CostEstimateItem,
} from "@/lib/types/review";

/** Fixed Mermaid diagram (AWS-based): User → ALB → ECS → Bedrock, RDS, Secrets Manager. */
const MERMAID_DIAGRAM = `flowchart LR
  User --> ALB[ALB]
  ALB --> ECS[ECS]
  ECS --> Bedrock[Bedrock]
  ECS --> RDS[RDS]
  ECS --> SM[Secrets Manager]`;

/** Recommended tech stack (fixed). */
const RECOMMENDED_TECH_STACK: TechStackItem[] = [
  { category: "Compute", items: "Amazon ECS (Fargate)" },
  { category: "Load balancing", items: "Application Load Balancer (ALB)" },
  { category: "Database", items: "Amazon RDS (PostgreSQL or MySQL)" },
  { category: "AI/ML", items: "Amazon Bedrock" },
  { category: "Secrets", items: "AWS Secrets Manager" },
  { category: "Networking", items: "VPC, private subnets, NAT Gateway" },
];

/** Monthly cost estimate (hardcoded). */
const COST_ESTIMATE: CostEstimateItem[] = [
  { item: "ECS Fargate (2 tasks)", monthly: "$120", notes: "0.5 vCPU, 1 GB per task" },
  { item: "Application Load Balancer", monthly: "$25", notes: "Standard" },
  { item: "RDS (db.t3.micro)", monthly: "$15", notes: "Single-AZ" },
  { item: "Bedrock (usage-based)", monthly: "~$50", notes: "Estimated inference" },
  { item: "Secrets Manager", monthly: "$2", notes: "Per secret" },
  { item: "Data transfer / other", monthly: "~$30", notes: "Estimate" },
];

/** Deterministic control order for the mapping table. */
const CONTROL_ORDER = ["EN-01", "AU-01", "NS-01", "IA-01", "AI-1", "SC-7"];

/**
 * Generates a Technical Architecture Document from a review result.
 * Executive summary is derived from product fields; diagram, tech stack, and cost are fixed.
 */
export function generateTAD(result: ReviewResult): TechnicalArchitectureDocument {
  const summary = buildExecutiveSummary(result);
  const controls = buildControlMapping(result);
  return {
    summary,
    diagram: MERMAID_DIAGRAM,
    controls,
    techStack: [...RECOMMENDED_TECH_STACK],
    cost: [...COST_ESTIMATE],
  };
}

function buildExecutiveSummary(result: ReviewResult): string {
  const { productName, dataClassification, cloud, riskScore } = result;
  const passedCount = result.passedControls.length;
  const failedCount = result.failedControls.length;

  const parts: string[] = [
    `This Technical Architecture Document (TAD) describes the proposed architecture for "${productName}".`,
    `The product is classified as ${dataClassification} and targets ${cloud}.`,
    `The design uses a standard web tier (User → ALB → ECS) with backend services including Amazon Bedrock for AI/ML, Amazon RDS for persistent data, and AWS Secrets Manager for credentials.`,
    `Security controls have been evaluated against the defined framework: ${passedCount} control(s) passed and ${failedCount} control(s) failed. Overall risk score: ${riskScore}.`,
  ];

  if (failedCount > 0) {
    parts.push(
      `Failed controls should be addressed via remediation (e.g. private endpoints, network segmentation) before production.`
    );
  }

  parts.push(
    `The estimated monthly cost for the baseline configuration is provided below and is intended for planning only.`
  );

  return parts.join(" ");
}

function buildControlMapping(result: ReviewResult): ControlMapping[] {
  const passedById = new Map(
    result.passedControls.map((c) => [c.id, { controlId: c.id, controlName: c.name, result: "PASS" as const }])
  );
  const failedById = new Map(
    result.failedControls.map((c) => [c.id, { controlId: c.id, controlName: c.name, result: "FAIL" as const }])
  );

  const mappings: ControlMapping[] = [];
  for (const id of CONTROL_ORDER) {
    const passed = passedById.get(id);
    const failed = failedById.get(id);
    if (passed) {
      mappings.push(passed);
    } else if (failed) {
      mappings.push(failed);
    }
  }

  return mappings;
}
