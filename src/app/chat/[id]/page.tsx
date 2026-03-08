"use client";

/**
 * CHAT PAGE
 * -----------------------------------------------------------------------------
 * - Bubble chats: GET /api/bubbles/[id]/messages, POST to send. Real messages from DB.
 * - Non-bubble: mock messages (conversation list from useConversations).
 * -----------------------------------------------------------------------------
 */

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockMessages } from "@/lib/mockData";
import { useConversations } from "@/contexts/ConversationsContext";
import { ProfileLink } from "@/components/ProfileLink";
import { supabase } from "@/lib/supabase";

type ApiMessage = { id: string; user_id: string; content: string; created_at: string };

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [bubbleInfo, setBubbleInfo] = useState<{ activity: string; members_count: number } | null>(null);
  const { conversations } = useConversations();
  const convo = conversations.find((c) => c.id === id);
  const isBubbleChat = id.startsWith("bubble-");
  const bubbleId = isBubbleChat ? id.replace(/^bubble-/, "") : "";
  const memberNames = isBubbleChat && convo && "memberNames" in convo ? (convo as { memberNames?: string[] }).memberNames : undefined;
  const joined = isBubbleChat && convo && "joined" in convo ? (convo as { joined?: number }).joined : (bubbleInfo?.members_count ?? undefined);
  // Unlock when: not a bubble, or we don't have convo (opened from Home), or 2+ members
  const chatUnlocked = !isBubbleChat || joined === undefined || joined >= 2;

  useEffect(() => {
    if (!isBubbleChat || !bubbleId || convo) return;
    fetch(`/api/bubbles/${bubbleId}`)
      .then((r) => r.json())
      .then((d: { success?: boolean; data?: { activity: string; members_count: number } }) => {
        if (d?.success && d.data) setBubbleInfo({ activity: d.data.activity, members_count: d.data.members_count });
      })
      .catch(() => {});
  }, [isBubbleChat, bubbleId, convo]);

  useEffect(() => {
    if (!isBubbleChat || !bubbleId || !chatUnlocked) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id ?? null;
      if (cancelled) return;
      setCurrentUserId(uid);
      if (!uid) return;
      const token = data.session?.access_token;
      fetch(`/api/bubbles/${bubbleId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d: { success?: boolean; data?: ApiMessage[] }) => {
          if (cancelled) return;
          if (d?.success && Array.isArray(d.data)) setApiMessages(d.data);
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [isBubbleChat, bubbleId, chatUnlocked]);

  const handleSend = async () => {
    const content = message.trim();
    if (!content || !isBubbleChat || !bubbleId) return;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) return;
    setSending(true);
    try {
      const res = await fetch(`/api/bubbles/${bubbleId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok && data?.data) {
        setApiMessages((prev) => [...prev, data.data]);
        setMessage("");
      }
    } finally {
      setSending(false);
    }
  };

  const messagesToShow = isBubbleChat && chatUnlocked && apiMessages.length > 0
    ? apiMessages.map((m) => ({
        id: m.id,
        text: m.content,
        sender: (m.user_id === currentUserId ? "me" : "other") as "me" | "other",
        time: new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      }))
    : chatUnlocked && !isBubbleChat
      ? mockMessages
      : chatUnlocked && isBubbleChat
        ? [] // bubble chat unlocked but no API messages yet (loading or empty)
        : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.push("/messages")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm">
            {(convo?.avatar?.length ?? 0) <= 2 ? (
              <span className="text-[10px] font-bold text-accent-foreground">{convo?.avatar ?? "🫧"}</span>
            ) : (
              convo?.avatar ?? "🫧"
            )}
          </div>
          <span className="font-semibold text-sm text-foreground">{convo?.name ?? bubbleInfo?.activity ?? "Group chat"}</span>
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
            {messagesToShow.length === 0 && isBubbleChat ? (
              <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Say hi!</p>
            ) : (
              messagesToShow.map((msg) => (
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
              ))
            )}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && isBubbleChat) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-full"
          />
          <button
            type="button"
            onClick={isBubbleChat ? handleSend : undefined}
            disabled={sending || (isBubbleChat && !message.trim())}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
