import BottomNav from "@/components/ui/BottomNav";
import BubbleCard from "@/components/ui/BubbleCard";
import { mockBubbles } from "@/lib/mockData";

export default function MyBubbles() {
  const myBubbles = mockBubbles.filter((_, i) => i % 2 === 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-foreground">My Bubbles</h1>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {myBubbles.length > 0 ? (
          myBubbles.map((b) => <BubbleCard key={b.id} bubble={b} />)
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No bubbles yet</p>
            <p className="text-sm mt-1">Join or create one from the home page!</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
