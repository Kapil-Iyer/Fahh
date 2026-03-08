import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const WATERLOO_EMAIL_SUFFIX = "@uwaterloo.ca";

/**
 * POST /api/auth/login
 * Accept { email }. Reject non @uwaterloo.ca. Send OTP via Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body ?? {};
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email required" },
        { status: 400 }
      );
    }
    if (!email.endsWith(WATERLOO_EMAIL_SUFFIX)) {
      return NextResponse.json(
        { success: false, error: "Only @uwaterloo.ca emails are allowed" },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
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
