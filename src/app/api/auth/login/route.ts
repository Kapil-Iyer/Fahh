import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Accepts { email, password } and returns success (mock for now).
 * Connect your real auth (e.g. NextAuth, Clerk) later.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }
    // Mock: always succeed. Replace with real auth (e.g. verify credentials).
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
