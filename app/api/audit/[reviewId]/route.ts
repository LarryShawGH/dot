import { NextResponse } from "next/server";
import { readAuditLog } from "@/lib/api-data";

export async function GET(
  _request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId required" },
        { status: 400 }
      );
    }

    const entries = await readAuditLog(reviewId);
    return NextResponse.json({
      reviewId,
      entries,
      count: entries.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
