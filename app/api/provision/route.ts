import { NextResponse } from "next/server";
import {
  readApprovals,
  readProvisioning,
  writeProvisioning,
  appendAuditLog,
} from "@/lib/api-data";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reviewId = body.reviewId as string;
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "reviewId required" },
        { status: 400 }
      );
    }

    const approvals = await readApprovals();
    const approval = approvals[reviewId];
    if (approval?.state !== "approved") {
      return NextResponse.json(
        { success: false, error: "Review must be approved before provisioning." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const provisioning = await readProvisioning();
    provisioning[reviewId] = { status: "completed", completedAt: now };
    await writeProvisioning(provisioning);

    await appendAuditLog({
      timestamp: now,
      reviewId,
      action: "provision",
      actor: (body.actor as string) ?? "system",
      details: { status: "completed" },
    });

    return NextResponse.json({
      success: true,
      reviewId,
      status: "completed",
      message: "Provisioning completed (mock).",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
