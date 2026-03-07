"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/ui/BottomNav";
import { personalityTraits, mockBubbles, interestOptions } from "@/lib/mockData";

export default function ProfilePage() {
  const router = useRouter();
  const [editingInterests, setEditingInterests] = useState(false);
  const [userInterests, setUserInterests] = useState(interestOptions.slice(0, 6));

  const toggleInterest = (interest: string) => {
    setUserInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
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
            { label: "Connections", value: "24" },
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
            {(editingInterests ? interestOptions : userInterests).map((interest) => {
              const isSelected = userInterests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => editingInterests && toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  } ${!editingInterests ? "cursor-default" : ""}`}
                >
                  {interest}
                </button>
              );
            })}
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
