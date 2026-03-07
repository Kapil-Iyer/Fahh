"use client";

/**
 * AUTH MODAL - Login / Signup
 * -----------------------------------------------------------------------------
 * Calls: POST /api/auth/signup, POST /api/auth/login (both mock - always succeed)
 * Replace with Supabase Auth (signUp, signInWithOtp) per project rules.
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function AuthModal() {
  const [mode, setMode] = useState<"choice" | "signup" | "login" | "verify">("choice");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    const confirmPassword = (form.elements.namedItem("confirm") as HTMLInputElement)?.value;
    if (!name || !email || !password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      setMode("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/onboarding");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("loginEmail") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("loginPassword") as HTMLInputElement)?.value;
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/home");
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
            <Label htmlFor="name" className="text-white/70 text-sm font-medium">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="name"
                name="name"
                placeholder="Your first name"
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
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
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70 text-sm font-medium">Create Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-white/70 text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="confirm"
                name="confirm"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Account"}
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
          <p className="text-sm text-white/50">We sent a 6-digit code to your email</p>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl font-mono bg-white/5 border-white/10 text-white"
          />
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950" disabled={otp.length < 6}>
            Verify
          </Button>
          <button type="button" onClick={() => router.push("/onboarding")} className="block w-full text-sm text-white/50 hover:text-white transition-colors">
            Skip for now →
          </button>
          <button type="button" onClick={() => setMode("signup")} className="block w-full text-sm text-white/50 hover:text-white transition-colors">← Back</button>
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
          <div className="space-y-2">
            <Label htmlFor="loginPassword" className="text-white/70 text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                id="loginPassword"
                name="loginPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-cyan-500 hover:bg-cyan-400 text-cyan-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log In"}
          </Button>
          <button type="button" onClick={() => setMode("choice")} className="w-full text-sm text-white/50 hover:text-white transition-colors">← Back</button>
        </form>
      )}
    </div>
  );
}
