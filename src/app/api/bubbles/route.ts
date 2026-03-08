import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/bubbles
 * Create a bubble and auto-join the creator.
 * Body: { activity, zone, start_time, duration_minutes, max_members?, description? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      activity,
      zone,
      start_time,
      duration_minutes,
      max_members,
      description,
    } = body ?? {};

    if (!activity || !zone || start_time == null || duration_minutes == null) {
      return NextResponse.json(
        { success: false, error: "activity, zone, start_time, duration_minutes required" },
        { status: 400 }
      );
    }

    if (new Date(start_time) < new Date()) {
      return NextResponse.json(
        { success: false, error: "start_time cannot be in the past" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(
      new Date(start_time).getTime() + duration_minutes * 60_000
    );
    const duration = Number(duration_minutes);
    const time_window = duration >= 60 ? `${Math.floor(duration / 60)} hr` : `${duration} min`;

    const admin = getSupabaseAdmin();

    const { data: bubble, error: insertError } = await admin
      .from("bubbles")
      .insert({
        creator_id: user.id,
        activity: String(activity).trim(),
        zone: String(zone).trim(),
        time_window,
        start_time: new Date(start_time).toISOString(),
        duration_minutes: duration,
        max_members: max_members != null ? Number(max_members) : null,
        expires_at: expiresAt.toISOString(),
        status: "open",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 400 }
      );
    }

    const { error: memberError } = await admin.from("bubble_members").insert({
      bubble_id: bubble.id,
      user_id: user.id,
    });

    if (memberError) {
      return NextResponse.json(
        { success: false, error: "Failed to add creator to bubble" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bubble,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
