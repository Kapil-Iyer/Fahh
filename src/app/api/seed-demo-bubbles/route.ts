import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureUserInPublic } from "@/lib/ensureUser";

/**
 * POST /api/seed-demo-bubbles
 * Creates 3 real bubbles (so the map has joinable content). Auth required.
 * Current user is the creator and is auto-added to each bubble.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to create sample bubbles" }, { status: 401 });
    }
    const admin = getSupabaseAdmin();

    const { error: ensureError } = await ensureUserInPublic(admin, user);
    if (ensureError) {
      return NextResponse.json(
        { success: false, error: `Could not ensure user: ${ensureError}` },
        { status: 500 }
      );
    }

    const { data: existing } = await admin
      .from("bubble_members")
      .select("bubble_id")
      .eq("user_id", user.id);
    const existingIds = (existing ?? []).map((r) => r.bubble_id);
    if (existingIds.length >= 5) {
      return NextResponse.json({ success: true, bubble_ids: existingIds.slice(0, 5), message: "Using your existing bubbles." });
    }

    const now = new Date();
    const in1hr = new Date(now.getTime() + 60 * 60 * 1000);
    const in2hr = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const seedBubbles = [
      { activity: "3v3 Basketball at PAC", zone: "PAC", start_time: in1hr.toISOString(), duration_minutes: 60, max_members: 6 },
      { activity: "CS 341 Study - DC Library", zone: "DC", start_time: in1hr.toISOString(), duration_minutes: 120, max_members: 8 },
      { activity: "Coffee & Chat - SLC", zone: "SLC", start_time: in2hr.toISOString(), duration_minutes: 60, max_members: 5 },
      { activity: "Smash Bros at PAC Lounge", zone: "PAC", start_time: in1hr.toISOString(), duration_minutes: 120, max_members: 8 },
      { activity: "Evening Run - Columbia Fields", zone: "Columbia Fields", start_time: in2hr.toISOString(), duration_minutes: 60, max_members: 6 },
    ];

    const bubbleIds: string[] = [];
    let lastError: string | null = null;
    for (const b of seedBubbles) {
      const expiresAt = new Date(new Date(b.start_time).getTime() + b.duration_minutes * 60 * 1000);
      const timeWindow = b.duration_minutes >= 60 ? `${Math.floor(b.duration_minutes / 60)} hr` : `${b.duration_minutes} min`;
      const { data: bubble, error: ins } = await admin
        .from("bubbles")
        .insert({
          creator_id: user.id,
          activity: b.activity,
          zone: b.zone,
          time_window: timeWindow,
          start_time: b.start_time,
          duration_minutes: b.duration_minutes,
          max_members: b.max_members,
          expires_at: expiresAt.toISOString(),
          status: "open",
        })
        .select("id")
        .single();
      if (ins) {
        lastError = ins.message;
        continue;
      }
      if (!bubble) continue;
      const { error: memberErr } = await admin.from("bubble_members").insert({ bubble_id: bubble.id, user_id: user.id });
      if (memberErr) {
        lastError = memberErr.message;
        continue;
      }
      bubbleIds.push(bubble.id);
    }

    if (bubbleIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: lastError
            ? `Could not create bubbles: ${lastError}`
            : "Could not create any bubbles. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bubble_ids: bubbleIds, message: "Sample bubbles created." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to create sample bubbles" }, { status: 500 });
  }
}
