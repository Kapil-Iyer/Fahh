"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

const categories = ["Sports", "Casual", "Study", "Music", "Gaming", "Outdoors", "Food", "Arts"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateBubbleModal({ open, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("");

  if (!open) return null;

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
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div className="space-y-2">
            <Label>Activity Title</Label>
            <Input placeholder="e.g. Pickup Soccer" className="h-11 rounded-xl" required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Where?" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Max People</Label>
              <Input type="number" placeholder="6" min={2} max={50} className="h-11 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>When</Label>
            <Input type="datetime-local" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="What's the plan?" className="rounded-xl resize-none" rows={3} />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">Create Bubble 🫧</Button>
        </form>
      </div>
    </div>
  );
}
