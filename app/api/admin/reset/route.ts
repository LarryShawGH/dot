import { NextResponse } from "next/server";
import { resetDemoData } from "@/lib/api-data";

/**
 * POST /api/admin/reset
 * Clears all API-written JSON and audit log under /data. Admin-only (caller responsible for auth).
 */
export async function POST() {
  try {
    await resetDemoData();
    return NextResponse.json({
      success: true,
      message: "Demo data reset. Clear localStorage and reload to complete.",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
