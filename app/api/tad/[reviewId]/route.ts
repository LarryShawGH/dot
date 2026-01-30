import { NextResponse } from "next/server";
import { getReview, getTAD } from "@/lib/storage/reviewStore";

/**
 * GET /api/tad/[reviewId]
 * Requires review to exist (data/reviews/{reviewId}.json). Then loads TAD from data/tads/{reviewId}.json.
 * Returns 404 with friendly message if review or TAD not found.
 */
export async function GET(
  _request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    if (!reviewId) {
      return NextResponse.json({ error: "reviewId required" }, { status: 400 });
    }

    const review = await getReview(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: "Review not found. Run an architecture review from the dashboard first." },
        { status: 404 }
      );
    }

    const tad = await getTAD(reviewId);
    if (!tad) {
      return NextResponse.json(
        { error: "TAD not found for this review. Run the review again to generate the document." },
        { status: 404 }
      );
    }

    return NextResponse.json(tad);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
