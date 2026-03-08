"use client";

/**
 * BUBBLE CARD - Activity/event card
 * -----------------------------------------------------------------------------
 * Props: bubble (from mockBubbles or API). View Map → MapOverlayContext.
 * API: Bubble data from GET /api/bubbles
 * -----------------------------------------------------------------------------
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Bubble } from "@/lib/mockData";
import { useMapOverlay } from "@/contexts/MapOverlayContext";
import { ProfileLink } from "@/components/ProfileLink";

export default function BubbleCard({ bubble }: { bubble: Bubble }) {
  const mapOverlay = useMapOverlay();

  const zone = bubble.zone ?? bubble.distance;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow border border-border">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{bubble.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base">{bubble.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {zone} | {bubble.joined}/{bubble.maxPeople} people | Starts in {bubble.startingIn}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bubble.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            {bubble.creatorAvatar}
          </div>
          <ProfileLink name={bubble.creator} avatar={bubble.creatorAvatar} className="text-xs text-muted-foreground">
            {bubble.creator}
          </ProfileLink>
        </div>
        {mapOverlay ? (
          <Button size="sm" className="rounded-xl text-xs h-8 px-4 font-semibold" onClick={() => mapOverlay.openMap()}>
            View Map
          </Button>
        ) : (
          <Button size="sm" className="rounded-xl text-xs h-8 px-4 font-semibold" asChild>
            <Link href="/map">View Map</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
