"use client";

/**
 * MY BUBBLES PAGE - API INTEGRATION REFERENCE
 * -----------------------------------------------------------------------------
 * CURRENT: mockBubbles.filter(i % 2 === 0) - fake "my bubbles"
 * Replace with: GET /api/users/me/bubbles or bubble_members join
 * -----------------------------------------------------------------------------
 */

import { useMemo, useState } from "react";
import BottomNav from "@/components/ui/BottomNav";
import BubbleCard from "@/components/ui/BubbleCard";
import { mockBubbles, filterChips } from "@/lib/mockData";

export default function MyBubblesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const myBubbles = useMemo(() => mockBubbles.filter((_, i) => i % 2 === 0), []);

  const filteredBubbles = useMemo(() => {
    if (activeFilter === "All") return myBubbles;
    if (activeFilter === "Happening Now") {
      return myBubbles.filter((b) => b.startingIn.includes("min"));
    }
    if (activeFilter === "Starting Soon") {
      return myBubbles.filter((b) => b.startingIn.includes("hr"));
    }
    return myBubbles.filter((b) => b.category === activeFilter);
  }, [activeFilter, myBubbles]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">My Bubbles</h1>
        </div>
      </header>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-4 scrollbar-hide justify-center max-w-3xl mx-auto">
        <button
          onClick={() => setActiveFilter("All")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            activeFilter === "All" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          All
        </button>
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === chip ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <div className="max-w-3xl mx-auto px-4 mt-4 space-y-3">
        {filteredBubbles.length > 0 ? (
          filteredBubbles.map((b) => <BubbleCard key={b.id} bubble={b} />)
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">{myBubbles.length === 0 ? "No bubbles yet" : "No bubbles match this filter"}</p>
            <p className="text-sm mt-1">{myBubbles.length === 0 ? "Join or create one from the home page!" : "Try a different filter."}</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
