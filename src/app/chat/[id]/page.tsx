"use client";

/**
 * CHAT PAGE - API INTEGRATION REFERENCE
 * -----------------------------------------------------------------------------
 * DATA SOURCES:
 * - conversations → useConversations() (convo list)
 * - mockMessages → lib/mockData.ts (MOCK messages for this chat)
 * Replace mockMessages with: GET /api/conversations/:id/messages
 * Message send → POST /api/conversations/:id/messages
 * -----------------------------------------------------------------------------
 */

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockMessages } from "@/lib/mockData";
import { useConversations } from "@/contexts/ConversationsContext";
import { ProfileLink } from "@/components/ProfileLink";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { conversations } = useConversations();
  const convo = conversations.find((c) => c.id === id);
  const isBubbleChat = id.startsWith("bubble-");
  const memberNames = isBubbleChat && convo && "memberNames" in convo ? (convo as { memberNames?: string[] }).memberNames : undefined;
  const joined = isBubbleChat && convo && "joined" in convo ? (convo as { joined?: number }).joined : undefined;
  const chatUnlocked = !isBubbleChat || (joined !== undefined && joined >= 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.push("/messages")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm">
            {(convo?.avatar?.length ?? 0) <= 2 ? (
              <span className="text-[10px] font-bold text-accent-foreground">{convo?.avatar}</span>
            ) : (
              convo?.avatar
            )}
          </div>
          <span className="font-semibold text-sm text-foreground">{convo?.name}</span>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 overflow-y-auto flex flex-col">
        {isBubbleChat && !chatUnlocked ? (
          <div className="flex justify-center pt-4">
            <p className="text-xs text-muted-foreground text-center max-w-[280px]">
              Chat opens when one more person joins the bubble.
            </p>
          </div>
        ) : isBubbleChat && memberNames ? (
          <div className="flex justify-center pt-4">
            <p className="text-xs text-muted-foreground text-center max-w-[280px]">
              Group chat with{" "}
              {memberNames.map((name, i) => (
                <span key={name}>
                  {i > 0 && ", "}
                  {name === "You" ? (
                    <span className="text-foreground font-medium">You</span>
                  ) : (
                    <ProfileLink name={name} className="text-foreground font-medium">
                      {name}
                    </ProfileLink>
                  )}
                </span>
              ))}
            </p>
          </div>
        ) : null}
        {chatUnlocked && (
          <div className="space-y-3">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {!chatUnlocked && <div className="flex-1" />}
      </div>

      {chatUnlocked && (
      <div className="glass-strong border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-full"
          />
          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
