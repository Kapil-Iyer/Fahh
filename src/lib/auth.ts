/**
 * Server-side auth helper for API routes.
 * Gets the current user from the request using the Supabase JWT (Bearer token).
 * Use supabase.auth.getUser() with the token — do NOT use supabaseAdmin for auth.
 */

import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
