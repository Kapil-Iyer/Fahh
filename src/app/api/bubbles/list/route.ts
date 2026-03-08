import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * GET /api/bubbles/list
 * List open/active bubbles that have not expired. Includes member count.
 */
export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: bubbles, error } = await admin
      .from("bubbles")
      .select("id, activity, zone, start_time, duration_minutes, max_members, status, expires_at")
      .in("status", ["open", "active"])
      .gt("expires_at", now)
      .order("start_time", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const withCount = await Promise.all(
      (bubbles ?? []).map(async (b) => {
        const { count } = await admin
          .from("bubble_members")
          .select("user_id", { count: "exact", head: true })
          .eq("bubble_id", b.id);
        return {
          ...b,
          members_count: count ?? 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: withCount,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
