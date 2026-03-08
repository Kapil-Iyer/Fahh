import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const WATERLOO_EMAIL_SUFFIX = "@uwaterloo.ca";

/**
 * POST /api/auth/signup
 * Accept { email }. Only @uwaterloo.ca. Send OTP via Supabase.
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
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.endsWith(WATERLOO_EMAIL_SUFFIX)) {
      return NextResponse.json(
        { success: false, error: "Only @uwaterloo.ca emails are allowed" },
        { status: 400 }
      );
    }

    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (host ? `${proto}://${host}` : "http://localhost:3000");
    const redirectTo = `${siteUrl.replace(/\/$/, "")}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email: emailTrimmed,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error("[auth/signup] Supabase signInWithOtp error:", {
        message: error.message,
        name: error.name,
        status: error.status,
      });
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
