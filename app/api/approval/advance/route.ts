import { NextResponse } from "next/server";
import {
  readApprovals,
  writeApprovals,
  appendAuditLog,
} from "@/lib/api-data";

const STATE_ORDER = ["draft", "architecture_review", "security_review", "approved"] as const;

function nextState(current: string): string {
  const i = STATE_ORDER.indexOf(current as (typeof STATE_ORDER)[number]);
  if (i < 0 || i >= STATE_ORDER.length - 1) return current;
  return STATE_ORDER[i + 1];
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reviewId = body.reviewId as string;
    const actor = (body.actor as string) ?? "system";
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: "reviewId required" },
        { status: 400 }
      );
    }

    const approvals = await readApprovals();
    const current = approvals[reviewId]?.state ?? "draft";
    const newState = nextState(current);
    const now = new Date().toISOString();

    approvals[reviewId] = { state: newState, updatedAt: now };
    await writeApprovals(approvals);

    await appendAuditLog({
      timestamp: now,
      reviewId,
      action: "approval_advance",
      actor,
      details: { from: current, to: newState },
    });

    return NextResponse.json({
      success: true,
      reviewId,
      previousState: current,
      newState,
      message: "Approval advanced (mock).",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
