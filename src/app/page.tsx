"use client";

/**
 * LANDING PAGE - Auth (login/signup)
 * -----------------------------------------------------------------------------
 * AuthModal handles login/signup. API: /api/auth/login, /api/auth/signup
 * Supabase Auth recommended. Redirect to /home or /onboarding after auth.
 * -----------------------------------------------------------------------------
 */

import AuthModal from "@/components/ui/AuthModal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050a0f] relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] rounded-full bg-teal-500/15 blur-[120px] animate-float" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-cyan-400/5 blur-[150px] animate-pulse-glow" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Center gradient vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(5,10,15,0.6) 100%)",
        }}
      />

      <div className="relative z-20 w-full flex items-center justify-center px-4 py-12">
        <AuthModal />
      </div>
    </div>
  );
}
