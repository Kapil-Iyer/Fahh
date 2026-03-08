import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ensureUserInPublic } from "@/lib/ensureUser";

/**
 * POST /api/auth/ensure-profile
 * Ensures the current user (from Bearer token) has a row in public.users.
 * Call after signInAnonymously() or any sign-in when OTP is disabled.
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

    const admin = getSupabaseAdmin();
    const { error } = await ensureUserInPublic(admin, user);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
