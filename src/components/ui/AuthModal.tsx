"use client";

/**
 * AUTH MODAL - Auth disabled for now; skip to app (anonymous + ensure-profile).
 * When re-enabled: only @uwaterloo.ca (enforced in API + Supabase).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";

const OTP_DISABLED = false;

export default function AuthModal() {
  const [mode, setMode] = useState<"choice" | "signup" | "login" | "verify">("choice");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [pendingRedirect, setPendingRedirect] = useState<"onboarding" | "home">("onboarding");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signInAnonymouslyAndContinue = async (redirectTo: "onboarding" | "home") => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await import("@/lib/supabase").then((m) => m.supabase.auth.getSession());
      if (sessionData?.session?.access_token) {
        await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });
        router.push(redirectTo === "home" ? "/home" : "/onboarding");
        return;
      }
      const { data, error: signInError } = await import("@/lib/supabase").then((m) =>
        m.supabase.auth.signInAnonymously()
      );
      if (signInError) throw new Error(signInError.message);
      const token = data?.session?.access_token;
      if (token) {
        await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      router.push(redirectTo === "home" ? "/home" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (OTP_DISABLED) {
      await signInAnonymouslyAndContinue("onboarding");
      return;
    }
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setPendingEmail(email);
      setPendingRedirect("onboarding");
      setMode("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (OTP_DISABLED) return;
    if (!pendingEmail || otp.length < 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, token: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      const { supabase } = await import("@/lib/supabase");
      if (data.session) await supabase.auth.setSession(data.session);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (OTP_DISABLED) {
      await signInAnonymouslyAndContinue("home");
      return;
    }
    const form = e.currentTarget;
    const email = (form.elements.namedItem("loginEmail") as HTMLInputElement)?.value?.trim();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setPendingEmail(email);
      setPendingRedirect("home");
      setMode("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md animate-fade-in"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        borderRadius: "1.5rem",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        padding: "2rem",
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Wanderers
        </h1>
        <p className="text-white/50 text-sm mt-2 font-medium">Find your people. Start something.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {mode === "choice" && (
        <div className="space-y-3">
          <Button
            onClick={() => { setMode("signup"); setError(null); }}
            className="w-full h-12 text-base font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign Up
          </Button>
          <Button
            onClick={() => { setMode("login"); setError(null); }}
            variant="outline"
            className="w-full h-12 text-base font-semibold rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Log In
          </Button>
        </div>
      )}

      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70 text-sm font-medium">First Name (optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="name"
                name="name"
                placeholder="Your first name"
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@uwaterloo.ca"
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>
          {!OTP_DISABLED && <p className="text-xs text-white/50">We&apos;ll send a one-time code to your email. No password needed.</p>}
          {OTP_DISABLED && <p className="text-xs text-amber-400/90">Sign-in skipped for now. You can use the app without verifying.</p>}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            disabled={loading}
          >
            {OTP_DISABLED ? "Continue to Onboarding" : loading ? "Sending code…" : "Create Account"}
          </Button>
          <button type="button" onClick={() => setMode("choice")} className="w-full text-sm text-white/50 hover:text-white transition-colors">← Back</button>
        </form>
      )}

      {mode === "verify" && (
        <form onSubmit={handleVerify} className="space-y-5 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-sm text-white/50">We sent a 6-digit code to {pendingEmail || "your email"}</p>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl font-mono bg-white/5 border-white/10 text-white"
          />
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950 disabled:opacity-50" disabled={loading || otp.length < 6}>
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <button type="button" onClick={() => router.push("/onboarding")} className="block w-full text-sm text-white/50 hover:text-white transition-colors">
            Skip for now →
          </button>
          <button type="button" onClick={() => { setMode("choice"); setOtp(""); setPendingEmail(""); }} className="block w-full text-sm text-white/50 hover:text-white transition-colors">← Back</button>
        </form>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="loginEmail" className="text-white/70 text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="loginEmail"
                name="loginEmail"
                type="email"
                placeholder="you@uwaterloo.ca"
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>
          {!OTP_DISABLED && <p className="text-xs text-white/50">We&apos;ll send a one-time code to your email. No password needed.</p>}
          {OTP_DISABLED && <p className="text-xs text-amber-400/90">Sign-in skipped for now. You can use the app without verifying.</p>}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            disabled={loading}
          >
            {OTP_DISABLED ? "Continue to Home" : loading ? "Sending code…" : "Log In"}
          </Button>
          <button type="button" onClick={() => setMode("choice")} className="w-full text-sm text-white/50 hover:text-white transition-colors">← Back</button>
        </form>
      )}
    </div>
  );
}
