import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interestOptions } from "@/lib/mockData";
import { Check, Plus } from "lucide-react";

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [customs, setCustoms] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addCustom = () => {
    if (custom.trim() && !customs.includes(custom.trim())) {
      const tag = custom.trim();
      setCustoms((prev) => [...prev, tag]);
      setSelected((prev) => [...prev, tag]);
      setCustom("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-10">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-extrabold text-foreground">What are you into?</h1>
          <p className="text-muted-foreground mt-1 text-sm">Pick your interests so we can match you with the right Bubbles.</p>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-8">
          {[...interestOptions, ...customs].map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggle(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-glow scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                {interest}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mt-6">
          <Input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Add your own..."
            className="h-10 rounded-xl flex-1"
          />
          <Button onClick={addCustom} size="icon" variant="outline" className="rounded-xl h-10 w-10 shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-10">
          <Button
            onClick={() => navigate("/home")}
            disabled={selected.length === 0}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            Confirm Interests ({selected.length})
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">You can always change these later</p>
        </div>
      </div>
    </div>
  );
}
