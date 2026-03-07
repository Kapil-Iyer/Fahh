import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * Accepts { name, email, password } and returns success (mock for now).
 * Connect your real auth/database later.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email and password required" },
        { status: 400 }
      );
    }
    // Mock: always succeed. Replace with real signup (e.g. create user in DB).
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
