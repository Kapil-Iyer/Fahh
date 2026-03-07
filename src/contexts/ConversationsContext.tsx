"use client";

/**
 * =============================================================================
 * CONVERSATIONS CONTEXT - API INTEGRATION REFERENCE
 * =============================================================================
 * Manages: chat conversations list, joined bubbles (when user joins from map).
 *
 * CURRENT: Uses mockConversations + local joinedConversations state.
 *
 * API INTEGRATION POINTS:
 * - conversations       → GET /api/conversations or Supabase messages
 * - joinedBubbles       → GET /api/users/me/bubbles or bubble_members
 * - addBubbleConversation() → POST /api/bubbles/:id/join (bubble_members)
 * - mockConversations   → Replace with real conversation/chat API
 * =============================================================================
 */

import { createContext, useContext, useState, useCallback } from "react";
import { mockConversations } from "@/lib/mockData";
import type { Conversation } from "@/lib/mockData";
import type { Bubble } from "@/lib/mockData";

export type BubbleConversation = Conversation & { memberNames?: string[] };

type ConversationsContextValue = {
  conversations: BubbleConversation[];
  joinedBubbles: BubbleConversation[];
  addBubbleConversation: (bubble: Bubble) => void;
};

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

function getMemberNames(bubble: Bubble): string[] {
  const names = bubble.participants?.length
    ? bubble.participants.map((p) => p.name)
    : [bubble.creator];
  return ["You", ...names];
}

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [joinedConversations, setJoinedConversations] = useState<BubbleConversation[]>([]);

  const addBubbleConversation = useCallback((bubble: Bubble) => {
    const id = `bubble-${bubble.id}`;
    setJoinedConversations((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          name: bubble.title,
          avatar: bubble.emoji,
          lastMessage: "You joined the group!",
          time: "Just now",
          unread: 0,
          memberNames: getMemberNames(bubble),
        },
      ];
    });
  }, []);

  const conversations: BubbleConversation[] = [...joinedConversations, ...mockConversations];
  const joinedBubbles = joinedConversations;

  return (
    <ConversationsContext.Provider value={{ conversations, joinedBubbles, addBubbleConversation }}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error("useConversations must be used within ConversationsProvider");
  }
  return ctx;
}
