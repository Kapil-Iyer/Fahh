"use client";

/**
 * PROFILE PAGE - API INTEGRATION REFERENCE
 * -----------------------------------------------------------------------------
 * DATA SOURCES (replace with API):
 * - connectionsCount → ConnectionsContext
 * - personalityTraits, interestOptions, mockBubbles → lib/mockData.ts
 * - userInterests (local state) → sync with PATCH /api/users/me (interests)
 * - Stats (Connections, Events) → GET /api/users/me
 * - Past Bubbles → GET /api/users/me/bubbles
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/ui/BottomNav";
import { personalityTraits, mockBubbles, interestOptions } from "@/lib/mockData";
import { useConnections } from "@/contexts/ConnectionsContext";

export default function ProfilePage() {
  const router = useRouter();
  const { connectionsCount } = useConnections();
  const [editingInterests, setEditingInterests] = useState(false);
  const [userInterests, setUserInterests] = useState(interestOptions.slice(0, 6));
  const [customInterest, setCustomInterest] = useState("");

  const toggleInterest = (interest: string) => {
    setUserInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !userInterests.includes(trimmed)) {
      setUserInterests((prev) => [...prev, trimmed]);
      setCustomInterest("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              JD
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-card">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-3">John Doe</h2>
          <p className="text-sm text-muted-foreground">University of Waterloo</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { label: "Connections", value: String(connectionsCount) },
            { label: "Events Attended", value: "12" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Personality Traits</h3>
          <div className="flex flex-wrap gap-2">
            {personalityTraits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">My Interests</h3>
            <button
              onClick={() => setEditingInterests(!editingInterests)}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> {editingInterests ? "Done" : "Edit"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => editingInterests && toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-primary text-primary-foreground ${!editingInterests ? "cursor-default" : ""}`}
              >
                {interest}
              </button>
            ))}
            {editingInterests && (
              <>
                <div className="flex gap-2 items-center w-full">
                  <Input
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                    placeholder="Type and add your own..."
                    className="h-8 flex-1 max-w-[180px] text-xs rounded-full border-border"
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {interestOptions.filter((i) => !userInterests.includes(i)).map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  >
                    {interest}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Past Bubbles</h3>
          <div className="space-y-2">
            {mockBubbles.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <span className="text-2xl">{b.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.joined} attended · {b.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-8 rounded-xl h-11"
          onClick={() => router.push("/")}
        >
          Log Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
