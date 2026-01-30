import { NextResponse } from "next/server";
import type { ProductInput } from "@/lib/types/review";
import { runReview } from "@/lib/review/runReview";
import { saveReview, DEFAULT_REVIEW_ID } from "@/lib/storage/reviewStore";
import {
  readReviews,
  writeReviews,
  readApprovals,
  writeApprovals,
  appendAuditLog,
} from "@/lib/api-data";

/**
 * POST /api/review/run
 * Accepts ProductInput JSON, runs review, generates and persists TAD, returns ReviewResult.
 * Logs: "System ran architecture review".
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const input: ProductInput = {
      productName: typeof body.productName === "string" ? body.productName : "Unnamed",
      description: typeof body.description === "string" ? body.description : undefined,
      dataClassification:
        body.dataClassification === "Public" ||
        body.dataClassification === "Internal" ||
        body.dataClassification === "Confidential"
          ? body.dataClassification
          : "Internal",
      cloud: body.cloud === "AWS" || body.cloud === "Azure" || body.cloud === "GCP" ? body.cloud : "AWS",
      internetFacing: body.internetFacing === "Yes" || body.internetFacing === "No" ? body.internetFacing : "No",
      usesAi: body.usesAi === "Yes" || body.usesAi === "No" ? body.usesAi : "No",
    };

    const result = runReview(input);

    await saveReview(DEFAULT_REVIEW_ID, result);

    const now = new Date().toISOString();
    await appendAuditLog({
      timestamp: now,
      reviewId: DEFAULT_REVIEW_ID,
      action: "System ran architecture review",
      actor: "system",
      details: { productName: input.productName },
    });

    const reviews = await readReviews();
    reviews[DEFAULT_REVIEW_ID] = { createdAt: now, productName: input.productName };
    await writeReviews(reviews);

    const approvals = await readApprovals();
    if (!approvals[DEFAULT_REVIEW_ID]) {
      approvals[DEFAULT_REVIEW_ID] = { state: "draft", updatedAt: now };
      await writeApprovals(approvals);
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
