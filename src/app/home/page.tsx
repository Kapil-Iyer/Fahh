"use client";

/**
 * HOME PAGE - API INTEGRATION REFERENCE
 * -----------------------------------------------------------------------------
 * DATA SOURCES (replace with API):
 * - mockBubbles, filterChips, mockFeedPosts → lib/mockData.ts
 * - connectionRequests, acceptRequest, rejectRequest → ConnectionsContext
 * - joinedBubbles → ConversationsContext (bubbles user joined from map)
 * -----------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Plus, UserPlus, Check, X, Calendar } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import BubbleCard from "@/components/ui/BubbleCard";
import CreateBubbleModal from "@/components/ui/CreateBubbleModal";
import { mockBubbles, filterChips, mockFeedPosts } from "@/lib/mockData";
import FeedPost from "@/components/FeedPost";
import { useConnections } from "@/contexts/ConnectionsContext";
import { useConversations } from "@/contexts/ConversationsContext";
import { ProfileLink } from "@/components/ProfileLink";

type UpcomingBubble = {
  id: string;
  emoji: string;
  title: string;
  startingIn: string;
  joined: number;
  maxPeople: number;
  recommendationReason?: string;
};

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("Happening Now");
  const [createOpen, setCreateOpen] = useState(false);
  const [upcomingForYou, setUpcomingForYou] = useState<UpcomingBubble[]>(mockBubbles.slice(0, 6).map((b) => ({ ...b, recommendationReason: "Loading..." })));

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((data: UpcomingBubble[]) => {
        if (Array.isArray(data) && data.length > 0) setUpcomingForYou(data);
      })
      .catch(() => {});
  }, []);
  const router = useRouter();
  const { filteredConnectionRequests, acceptRequest, rejectRequest } = useConnections();
  const { joinedBubbles } = useConversations();

  const filteredBubbles = useMemo(() => {
    if (activeFilter === "Happening Now") {
      return mockBubbles.filter((b) => b.startingIn.includes("min"));
    }
    if (activeFilter === "Starting Soon") {
      return mockBubbles.filter((b) => b.startingIn.includes("hr"));
    }
    return mockBubbles.filter((b) => b.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border w-full">
        <div className="w-full flex items-center justify-end px-4 h-14">
          <button
            onClick={() => router.push("/profile")}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
          >
            JD
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row lg:pl-64 lg:pr-6">
      <div className="flex-1 min-w-0 max-w-4xl mx-auto lg:mx-0 px-4 w-full lg:max-w-none">
        <button className="flex items-center gap-1.5 mt-3 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          University of Waterloo
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Upcoming for you - ML recommendations */}
        <div className="mt-4 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming for you</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {upcomingForYou.map((b) => (
              <div
                key={b.id}
                className="min-w-[180px] flex-shrink-0 bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                <div className="h-24 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center text-3xl">
                  {b.emoji}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{b.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{b.recommendationReason || "For you"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.startingIn} • {b.joined}/{b.maxPeople}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === chip
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-foreground mt-4 mb-3">Active Nearby</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {filteredBubbles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No bubbles match this filter</p>
          ) : (
          filteredBubbles.map((bubble) => (
            <div key={bubble.id} className="flex-shrink-0 w-[280px]">
              <BubbleCard bubble={bubble} />
            </div>
          )))}
        </div>

        <div className="mt-8 -mx-2 border-t border-border">
          <h2 className="text-sm font-semibold text-foreground mb-3 px-4 sm:px-0 pt-4">Recent Moments</h2>
          <div className="space-y-0">
            {mockFeedPosts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>

        {/* Connection requests - separate panel on desktop */}
      <aside className="hidden lg:block lg:w-[36rem] lg:shrink-0 lg:self-start lg:sticky lg:top-14 lg:mt-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Connection Requests
          </h3>
          {filteredConnectionRequests.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {filteredConnectionRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground shrink-0">
                    {req.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <ProfileLink name={req.name} avatar={req.avatar} className="text-sm font-medium text-foreground truncate block">
                      {req.name}
                    </ProfileLink>
                    <p className="text-[10px] text-muted-foreground">Wants to connect</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors"
                      aria-label="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
                      aria-label="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Confirmed to attend
            </h3>
            {joinedBubbles.length === 0 ? (
              <p className="text-xs text-muted-foreground">No bubbles yet</p>
            ) : (
              <div className="space-y-2">
                {joinedBubbles.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border"
                  >
                    <span className="text-lg">{b.avatar}</span>
                    <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
      </div>

      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-4 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-3xl sm:w-[calc(100%-2rem)] bg-primary text-primary-foreground h-12 px-6 rounded-full font-semibold shadow-float flex items-center justify-center gap-2 hover:shadow-glow transition-shadow z-40"
      >
        <Plus className="w-5 h-5" /> Start Something
      </button>

      <CreateBubbleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BottomNav />
    </div>
  );
}
