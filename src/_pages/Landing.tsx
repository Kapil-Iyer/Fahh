import AuthModal from "@/components/ui/AuthModal";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Center gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background md:from-background/40 md:via-background/90 md:to-background/40 z-10" />
      <div className="relative z-20">
        <AuthModal />
      </div>
    </div>
  );
}
