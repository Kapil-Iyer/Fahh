"use client";

/**
 * MESSAGES PAGE
 * Shows only bubbles you’ve actually joined (from the map). No preset/fake chats.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { useConversations } from "@/contexts/ConversationsContext";

export default function MessagesPage() {
  const router = useRouter();
  const { conversations } = useConversations();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">Messages</h1>
        </div>
      </header>
      <div className="max-w-3xl mx-auto">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
              Join a bubble from the Map to start chatting. Create one from Home if the map is empty.
            </p>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              Open Map
            </Link>
          </div>
        ) : (
        conversations.map((convo) => (
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
        ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
