"use client";

/**
 * CREATE BUBBLE MODAL - Start new activity
 * -----------------------------------------------------------------------------
 * Smart input: POST /api/ai/parse-intent → fill form. Manual form below.
 * Submit: POST /api/bubbles (auth required).
 * -----------------------------------------------------------------------------
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const activityOptions = ["Basketball", "Study", "Gaming", "Coffee", "Volleyball", "Soccer", "Swimming", "LeetCode", "Hike", "Board Games", "Open Mic"];
const zoneOptions = ["PAC", "DC", "SLC", "EV3", "MC", "Columbia Fields", "Laurel Creek"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateBubbleModal({ open, onClose, onCreated }: Props) {
  const [smartInput, setSmartInput] = useState("");
  const [activity, setActivity] = useState("");
  const [zone, setZone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [description, setDescription] = useState("");
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleParseIntent = async () => {
    const text = smartInput.trim();
    if (!text) {
      toast.error("Type something first (e.g. coffee near SLC tonight)");
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("/api/ai/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Could not parse");
        return;
      }
      const d = data.data;
      if (d.activity) setActivity(d.activity);
      if (d.zone) setZone(d.zone);
      if (d.start_time) {
        const date = new Date(d.start_time);
        if (!isNaN(date.getTime())) {
          const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, "0"), day = String(date.getDate()).padStart(2, "0"), h = String(date.getHours()).padStart(2, "0"), min = String(date.getMinutes()).padStart(2, "0");
          setStartTime(`${y}-${m}-${day}T${h}:${min}`);
        }
      }
      if (d.duration_minutes) setDurationMinutes(String(d.duration_minutes));
      if (d.max_members) setMaxMembers(String(d.max_members));
      if (d.description) setDescription(d.description);
      toast.success("Form filled from your message");
    } catch {
      toast.error("Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !zone.trim() || !startTime || !durationMinutes) {
      toast.error("Activity, zone, start time and duration are required");
      return;
    }
    const start = new Date(startTime);
    if (isNaN(start.getTime()) || start < new Date()) {
      toast.error("Start time must be in the future");
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      toast.error("Sign in to create a bubble");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bubbles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity: activity.trim(),
          zone: zone.trim(),
          start_time: start.toISOString(),
          duration_minutes: Number(durationMinutes) || 60,
          max_members: maxMembers ? Number(maxMembers) : undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Failed to create bubble");
        return;
      }
      toast.success("Bubble created!");
      onClose();
      onCreated?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
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
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              What do you want to do?
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. coffee near SLC tonight"
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                className="h-11 rounded-xl flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleParseIntent}
                disabled={parsing}
                className="rounded-xl shrink-0"
              >
                {parsing ? "…" : "Fill form"}
              </Button>
            </div>
          </div>
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
            <Label>Max Members (optional)</Label>
            <Input
              type="number"
              placeholder="6"
              min={2}
              max={50}
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className="h-11 rounded-xl"
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
          <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl text-base font-semibold">
            {submitting ? "Creating…" : "Create Bubble 🫧"}
          </Button>
        </form>
      </div>
    </div>
  );
}
