"use client";

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
    if (!name || !email || !password) return;
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
    <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          <span className="text-primary">W</span>anderers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Find your people. Start something.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {mode === "choice" && (
        <div className="space-y-3">
          <Button onClick={() => { setMode("signup"); setError(null); }} className="w-full h-12 text-base font-semibold rounded-xl">
            Sign Up
          </Button>
          <Button onClick={() => { setMode("login"); setError(null); }} variant="outline" className="w-full h-12 text-base font-semibold rounded-xl">
            Log In
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-muted-foreground">or</span></div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl gap-2"
            onClick={() => router.push("/home")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
        </div>
      )}

      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" name="name" placeholder="Your first name" className="pl-10 h-11 rounded-xl" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@email.com" className="pl-10 h-11 rounded-xl" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-11 rounded-xl" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="confirm" type="password" placeholder="••••••••" className="pl-10 h-11 rounded-xl" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </Button>
          <button type="button" onClick={() => setMode("choice")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        </form>
      )}

      {mode === "verify" && (
        <form onSubmit={handleVerify} className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-2">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground">We sent a 6-digit code to your email</p>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl font-mono"
          />
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={otp.length < 6}>
            Verify
          </Button>
          <button type="button" onClick={() => router.push("/onboarding")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
            Skip for now →
          </button>
          <button type="button" onClick={() => setMode("signup")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        </form>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginEmail">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="loginEmail" name="loginEmail" type="email" placeholder="you@email.com" className="pl-10 h-11 rounded-xl" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginPassword">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="loginPassword" name="loginPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-11 rounded-xl" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full h-12 rounded-xl gap-2"
            onClick={() => router.push("/home")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
          <button type="button" onClick={() => setMode("choice")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        </form>
      )}
    </div>
  );
}