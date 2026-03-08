"use client";

/**
 * Auth callback - Magic link landing.
 * Supabase redirects here after the user clicks the link in the email.
 * We exchange the hash for a session, ensure public.users, then redirect.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!session?.access_token) {
          setStatus("error");
          setMessage("Could not sign in. Try the link again or use the code.");
          return;
        }
        await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (cancelled) return;
        setStatus("done");
        setMessage("Success! Redirecting…");
        router.replace("/home");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Something went wrong. Try again.");
        }
      }
    }

    handleCallback();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050a0f] flex items-center justify-center p-4">
      <div className="text-center text-white/90">
        {status === "loading" && <p className="text-lg">{message}</p>}
        {status === "done" && <p className="text-lg text-green-400">{message}</p>}
        {status === "error" && (
          <>
            <p className="text-lg text-red-400">{message}</p>
            <a href="/" className="mt-4 inline-block text-cyan-400 hover:underline">
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
