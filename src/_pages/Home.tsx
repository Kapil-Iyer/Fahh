"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Plus, List, Map } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import BubbleCard from "@/components/ui/BubbleCard";
import CreateBubbleModal from "@/components/ui/CreateBubbleModal";
import { mockBubbles, filterChips } from "@/lib/mockData";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Happening Now");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-extrabold text-foreground">
            <span className="text-primary">W</span>anderers
          </h1>
          <button onClick={() => router.push("/profile")} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            JD
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4">
        {/* Location selector */}
        <button className="flex items-center gap-1.5 mt-3 text-sm font-medium text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          University of Waterloo
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Filter chips */}
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

        {/* View toggle */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Active Nearby</h2>
          <div className="flex bg-secondary rounded-full p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Map
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="space-y-3">
            {mockBubbles.map((bubble) => (
              <BubbleCard key={bubble.id} bubble={bubble} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-secondary border border-border h-72 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Map View</p>
              <p className="text-xs">Connect Google Maps API to enable</p>
            </div>
          </div>
        )}

        {/* Postcards section */}
        <div className="mt-8 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Moments</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {mockBubbles.slice(0, 3).map((b) => (
              <div key={b.id} className="min-w-[200px] bg-card rounded-2xl border border-border overflow-hidden shadow-card">
                <div className="h-28 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center text-4xl">
                  {b.emoji}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.joined} attended</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg sm:w-[calc(100%-2rem)] bg-primary text-primary-foreground h-12 px-6 rounded-full font-semibold shadow-float flex items-center justify-center gap-2 hover:shadow-glow transition-shadow z-40"
      >
        <Plus className="w-5 h-5" /> Start Something
      </button>

      <CreateBubbleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BottomNav />
    </div>
  );
}
