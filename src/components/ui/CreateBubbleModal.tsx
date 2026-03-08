"use client";

/**
 * CREATE BUBBLE MODAL - Start new activity
 * -----------------------------------------------------------------------------
 * Schema: activity, zone, start_time, duration_minutes, max_members, description
 * API: POST /api/bubbles with payload. No submit→API yet.
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

const activityOptions = ["Basketball", "Study", "Gaming", "Coffee", "Volleyball", "Soccer", "Swimming", "LeetCode", "Hike", "Board Games", "Open Mic"];
const zoneOptions = ["PAC", "DC", "SLC", "EV3", "MC", "Columbia Fields", "Laurel Creek"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateBubbleModal({ open, onClose }: Props) {
  const [activity, setActivity] = useState("");
  const [zone, setZone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Payload shape for backend:
    // { activity, zone, start_time: ISO string, duration_minutes: number, max_members: number, description }
    // TODO: POST /api/bubbles
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">Start Something</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Activity</Label>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setActivity(activity === a ? "" : a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activity === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type custom activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="h-11 rounded-xl mt-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Zone</Label>
            <div className="flex flex-wrap gap-2">
              {zoneOptions.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZone(zone === z ? "" : z)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    zone === z ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-11 rounded-xl mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="60"
                min={15}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Members</Label>
            <Input
              type="number"
              placeholder="6"
              min={2}
              max={50}
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className="h-11 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What's the plan?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
            Create Bubble 🫧
          </Button>
        </form>
      </div>
    </div>
  );
}
