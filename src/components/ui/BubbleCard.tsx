"use client";

import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users } from "lucide-react";
import type { Bubble } from "@/lib/mockData";

export default function BubbleCard({ bubble }: { bubble: Bubble }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow border border-border">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{bubble.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base">{bubble.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {bubble.joined}/{bubble.maxPeople}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {bubble.startingIn}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {bubble.distance}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{bubble.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            {bubble.creatorAvatar}
          </div>
          <span className="text-xs text-muted-foreground">{bubble.creator}</span>
        </div>
        <Button size="sm" className="rounded-xl text-xs h-8 px-4 font-semibold">Join Bubble</Button>
      </div>
    </div>
  );
}
