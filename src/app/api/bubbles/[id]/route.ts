import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/bubbles/[id]
 * Return one bubble's public info (for chat header when opened from Home).
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: bubble, error } = await admin
      .from("bubbles")
      .select("id, activity, zone, start_time, duration_minutes, max_members, status")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!bubble) {
      return NextResponse.json({ success: false, error: "Bubble not found" }, { status: 404 });
    }

    const { count } = await admin
      .from("bubble_members")
      .select("user_id", { count: "exact", head: true })
      .eq("bubble_id", id);

    return NextResponse.json({
      success: true,
      data: { ...bubble, members_count: count ?? 0 },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
