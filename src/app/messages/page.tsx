"use client";

import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import { mockConversations } from "@/lib/mockData";

export default function MessagesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">Messages</h1>
        </div>
      </header>
      <div className="max-w-lg mx-auto">
        {mockConversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => router.push(`/chat/${convo.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors border-b border-border"
          >
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-lg shrink-0">
              {convo.avatar.length <= 2 ? (
                <span className="text-xs font-bold text-accent-foreground">{convo.avatar}</span>
              ) : (
                convo.avatar
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{convo.name}</span>
                <span className="text-[10px] text-muted-foreground">{convo.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.lastMessage}</p>
            </div>
            {convo.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">{convo.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
