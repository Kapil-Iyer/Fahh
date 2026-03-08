import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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

    const { error } = await getSupabaseAdmin()
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.name ?? null,
          campus_verified: false,
        },
        { onConflict: "id" }
      );

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
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
