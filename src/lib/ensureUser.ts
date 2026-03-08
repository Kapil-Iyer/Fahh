import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures the auth user has a row in public.users (for FK from bubble_members, bubbles.creator_id).
 * Uses a unique placeholder email for anonymous users so UNIQUE(email) doesn't conflict.
 */
export async function ensureUserInPublic(admin: SupabaseClient, user: User): Promise<{ error: string | null }> {
  const isAnonymous = (user as User & { is_anonymous?: boolean }).is_anonymous === true;
  const email =
    user.email && !isAnonymous
      ? user.email
      : `anon-${user.id}@placeholder.local`;

  const { error } = await admin
    .from("users")
    .upsert(
      {
        id: user.id,
        email,
        name: user.user_metadata?.name ?? null,
        campus_verified: false,
      },
      { onConflict: "id" }
    );

  return { error: error?.message ?? null };
}
