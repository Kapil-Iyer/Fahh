"use client";

/**
 * MAP OVERLAY - Activities on map, Join Bubble
 * -----------------------------------------------------------------------------
 * DATA: GET /api/bubbles/list (real bubbles); zone → coords for map placement.
 * ON JOIN: POST /api/bubbles/join → addBubbleConversation → navigate to /chat/bubble-[id]
 * Google Maps: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * -----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import { GoogleMap, useJsApiLoader, OverlayView, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Bubble } from "@/lib/mockData";
import { useConversations } from "@/contexts/ConversationsContext";

/** Sample bubbles shown on map when no real bubbles exist. Same 5 as seed API; id = demo-0 … demo-4. */
const DEMO_BUBBLES: (Bubble & { lat: number; lng: number })[] = [
  { id: "demo-0", title: "3v3 Basketball at PAC", emoji: "🏀", category: "Sports", zone: "PAC", joined: 0, maxPeople: 6, startingIn: "15 mins", duration: "1 hr", distance: "—", description: "Pickup game at the PAC gym. Tap Join to create and open group chat.", lat: 43.4722, lng: -80.5461, creator: "?", creatorAvatar: "?" },
  { id: "demo-1", title: "CS 341 Study - DC Library", emoji: "📚", category: "Study", zone: "DC", joined: 0, maxPeople: 8, startingIn: "1 hr", duration: "2 hrs", distance: "—", description: "Midterm prep in Davis Centre library. Tap Join to create and open group chat.", lat: 43.4725, lng: -80.5445, creator: "?", creatorAvatar: "?" },
  { id: "demo-2", title: "Coffee & Chat - SLC", emoji: "☕", category: "Casual", zone: "SLC", joined: 0, maxPeople: 5, startingIn: "30 mins", duration: "1 hr", distance: "—", description: "Grabbing coffee at SLC. Tap Join to create and open group chat.", lat: 43.4718, lng: -80.5455, creator: "?", creatorAvatar: "?" },
  { id: "demo-3", title: "Smash Bros at PAC Lounge", emoji: "🎮", category: "Gaming", zone: "PAC", joined: 0, maxPeople: 8, startingIn: "45 mins", duration: "2 hrs", distance: "—", description: "Casual Smash in PAC common area. Tap Join to create and open group chat.", lat: 43.4722, lng: -80.5458, creator: "?", creatorAvatar: "?" },
  { id: "demo-4", title: "Evening Run - Columbia Fields", emoji: "🥾", category: "Fitness", zone: "Columbia Fields", joined: 0, maxPeople: 6, startingIn: "1 hr", duration: "1 hr", distance: "—", description: "Easy run around the fields. Tap Join to create and open group chat.", lat: 43.474, lng: -80.548, creator: "?", creatorAvatar: "?" },
];

/** Zone name → map coordinates (UW campus). Used when API bubbles have no lat/lng. */
const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  PAC: { lat: 43.4722, lng: -80.5461 },
  DC: { lat: 43.4725, lng: -80.5445 },
  SLC: { lat: 43.4718, lng: -80.5455 },
  EV3: { lat: 43.4728, lng: -80.5438 },
  MC: { lat: 43.473, lng: -80.544 },
  "Columbia Fields": { lat: 43.474, lng: -80.548 },
  "Laurel Creek": { lat: 43.47, lng: -80.55 },
};
const CAMPUS_CENTER = { lat: 43.4723, lng: -80.5449 };

type ApiBubble = {
  id: string;
  activity: string;
  zone: string;
  start_time: string;
  duration_minutes: number;
  max_members: number | null;
  members_count: number;
};

function activityEmoji(activity: string): string {
  const a = (activity || "").toLowerCase();
  if (a.includes("basketball") || a.includes("sport")) return "🏀";
  if (a.includes("study") || a.includes("leetcode")) return "📚";
  if (a.includes("coffee") || a.includes("food")) return "☕";
  if (a.includes("game") || a.includes("gaming")) return "🎮";
  return "🫧";
}

function toBubbleForContext(b: ApiBubble, lat: number, lng: number): Bubble & { lat: number; lng: number } {
  const maxPeople = b.max_members ?? 8;
  const joined = b.members_count ?? 0;
  return {
    id: b.id,
    title: b.activity,
    emoji: activityEmoji(b.activity),
    category: "Casual",
    zone: b.zone,
    joined,
    maxPeople,
    startingIn: "Soon",
    duration: `${b.duration_minutes} min`,
    distance: "—",
    description: "",
    lat,
    lng,
    creator: "?",
    creatorAvatar: "?",
  };
}

const UW_CAMPUS_CENTER = { lat: 43.4723, lng: -80.5449 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const BUBBLE_SIZE = 150;
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  streetViewControl: false,
  mapTypeId: "satellite",
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

function MapBubble({
  bubble,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onJoin,
}: {
  bubble: Bubble & { lat: number; lng: number };
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onJoin: () => void;
}) {
  return (
    <OverlayView
      position={{ lat: bubble.lat, lng: bubble.lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -BUBBLE_SIZE / 2, y: -BUBBLE_SIZE / 2 })}
    >
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="absolute left-0 top-0 flex flex-col items-center justify-center cursor-pointer"
        style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
      >
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(147, 197, 253, 0.55)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <span className="text-4xl relative z-10 select-none">{bubble.emoji}</span>
        </div>
        {isHovered && (
          <Button
            size="sm"
            className="rounded-xl text-xs h-8 px-4 font-semibold relative z-10 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            Join Bubble
          </Button>
        )}
      </div>
    </OverlayView>
  );
}

type MapOverlayProps = {
  onClose: () => void;
};

export default function MapOverlay({ onClose }: MapOverlayProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [apiBubbles, setApiBubbles] = useState<ApiBubble[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [myBubbleIds, setMyBubbleIds] = useState<Set<string>>(new Set());
  const [refreshList, setRefreshList] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [listFetched, setListFetched] = useState(false);
  const autoSeedDone = useRef(false);

  const { addBubbleConversation } = useConversations();

  useEffect(() => {
    setListFetched(false);
    fetch("/api/bubbles/list")
      .then((r) => r.json())
      .then((d: { success?: boolean; data?: ApiBubble[] }) => {
        if (d?.success && Array.isArray(d.data)) setApiBubbles(d.data);
        setListFetched(true);
      })
      .catch(() => setListFetched(true));

    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (!token) return;
      fetch("/api/bubbles/mine", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d: { success?: boolean; data?: { id: string }[] }) => {
          if (d?.success && Array.isArray(d.data)) setMyBubbleIds(new Set(d.data.map((b) => b.id)));
        })
        .catch(() => {});
    });
  }, [refreshList]);

  // When list has been fetched and is empty and user is signed in, create sample bubbles once so they can join and open chat
  useEffect(() => {
    if (!listFetched || apiBubbles.length > 0 || autoSeedDone.current) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (cancelled || !token) return;
      autoSeedDone.current = true;
      fetch("/api/seed-demo-bubbles", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json?.success) setRefreshList((r) => r + 1);
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [listFetched, apiBubbles.length]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const bubblesWithCoords = useMemo(() => {
    const real = apiBubbles.length > 0
      ? apiBubbles
          .map((b) => {
            const coords = ZONE_COORDS[b.zone] ?? CAMPUS_CENTER;
            return { ...toBubbleForContext(b, coords.lat, coords.lng) };
          })
          .filter((b): b is Bubble & { lat: number; lng: number } => b.lat != null && b.lng != null)
      : [];
    if (real.length >= 5) return real;
    const demos = real.length === 0 ? DEMO_BUBBLES : DEMO_BUBBLES.slice(real.length, 5);
    return [...real, ...demos];
  }, [apiBubbles]);

  const handleJoin = useCallback(
    async (id: string) => {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Sign in to join a bubble");
        return;
      }

      let realBubbleId = id;
      let bubbleForContext: Bubble & { lat: number; lng: number };

      if (id.startsWith("demo-")) {
        const demoIndex = parseInt(id.replace("demo-", ""), 10);
        if (isNaN(demoIndex) || demoIndex < 0 || demoIndex > 4) return;
        const demoBubble = DEMO_BUBBLES[demoIndex];
        if (!demoBubble) return;
        setJoiningId(id);
        try {
          const seedRes = await fetch("/api/seed-demo-bubbles", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const seedJson = await seedRes.json().catch(() => ({}));
          if (!seedRes.ok || !seedJson.success || !Array.isArray(seedJson.bubble_ids)) {
            toast.error(seedJson.error ?? "Could not create bubbles");
            return;
          }
          realBubbleId = (seedJson.bubble_ids[demoIndex] ?? seedJson.bubble_ids[0]) ?? "";
          if (!realBubbleId || typeof realBubbleId !== "string") {
            toast.error("Could not create bubble. Try again.");
            return;
          }
          // Seed already added user as creator (in bubble_members), so no join call needed
          bubbleForContext = { ...demoBubble, id: realBubbleId, joined: 1 };
          addBubbleConversation(bubbleForContext);
          setHoveredId(null);
          onClose();
          router.push(`/chat/bubble-${realBubbleId}`);
        } catch {
          toast.error("Something went wrong");
        } finally {
          setJoiningId(null);
        }
        return;
      }

      const bubble = apiBubbles.find((b) => b.id === id);
      if (!bubble) return;
      setJoiningId(id);
      try {
        const res = await fetch("/api/bubbles/join", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bubble_id: id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.error ?? "Could not join");
          return;
        }
        const coords = ZONE_COORDS[bubble.zone] ?? CAMPUS_CENTER;
        bubbleForContext = toBubbleForContext(
          { ...bubble, members_count: (bubble.members_count ?? 0) + 1 },
          coords.lat,
          coords.lng
        );
        addBubbleConversation(bubbleForContext);
        setJoinedIds((prev) => new Set(prev).add(id));
        setHoveredId(null);
        onClose();
        router.push(`/chat/bubble-${id}`);
      } catch {
        toast.error("Something went wrong");
      } finally {
        setJoiningId(null);
      }
    },
    [apiBubbles, addBubbleConversation, onClose, router]
  );

  const handleOpenChat = useCallback(
    (id: string) => {
      const apiBubble = apiBubbles.find((b) => b.id === id);
      if (!apiBubble) return;
      const coords = ZONE_COORDS[apiBubble.zone] ?? CAMPUS_CENTER;
      const bubbleForContext = toBubbleForContext(apiBubble, coords.lat, coords.lng);
      addBubbleConversation(bubbleForContext);
      onClose();
      router.push(`/chat/bubble-${id}`);
    },
    [apiBubbles, addBubbleConversation, onClose, router]
  );

  const handleSeedDemo = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) {
      toast.error("Sign in to create sample bubbles");
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch("/api/seed-demo-bubbles", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        toast.error(json.error ?? "Failed to create sample bubbles");
        return;
      }
      toast.success("Sample bubbles created. Refreshing…");
      setRefreshList((r) => r + 1);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSeeding(false);
    }
  }, []);

  if (loadError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
        <div className="text-center bg-card rounded-2xl p-8 border border-border">
          <p className="text-destructive font-medium">Error loading map</p>
          <p className="text-sm text-muted-foreground mt-2">Please check your connection and try again.</p>
          <Button onClick={onClose} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="animate-pulse text-muted-foreground">Loading map…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Light blur - toolbar and nav remain visible in background */}
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-[2px] bg-background/5"
        onClick={onClose}
        aria-label="Close map"
      />

      {/* Floating card - map + list, rounded, elevated */}
      <div
        className="relative z-10 w-full max-w-6xl h-[90vh] max-h-[900px] rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full lg:w-[58%] h-[40vh] lg:h-full shrink-0">
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={UW_CAMPUS_CENTER}
            zoom={16}
            options={MAP_OPTIONS}
          >
            {bubblesWithCoords.map((bubble) =>
              joinedIds.has(bubble.id) ? (
                <Marker
                  key={bubble.id}
                  position={{ lat: bubble.lat, lng: bubble.lng }}
                  title={bubble.title}
                />
              ) : (
                <MapBubble
                  key={bubble.id}
                  bubble={bubble}
                  isHovered={hoveredId === bubble.id}
                  onMouseEnter={() => setHoveredId(bubble.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onJoin={() => handleJoin(bubble.id)}
                />
              )
            )}
          </GoogleMap>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:border-l border-border overflow-hidden">
          <header className="flex items-center gap-3 px-4 lg:px-6 h-14 border-b border-border shrink-0">
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Activities</h1>
          </header>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 space-y-3">
            {bubblesWithCoords.length === 0 ? (
              <div className="space-y-3 py-2">
                <p className="text-sm text-muted-foreground">No active bubbles. Create one from Home or add samples below.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full rounded-xl"
                  disabled={seeding}
                  onClick={handleSeedDemo}
                >
                  {seeding ? "Creating…" : "Create sample bubbles"}
                </Button>
              </div>
            ) : (
              bubblesWithCoords.map((bubble) => {
                const isJoined = joinedIds.has(bubble.id);
                const isAlreadyMember = isJoined || myBubbleIds.has(bubble.id);
                const isJoining = joiningId === bubble.id;
                return (
                  <div
                    key={bubble.id}
                    className={`w-full text-left bg-card rounded-xl p-4 border transition-colors ${
                      hoveredId === bubble.id ? "border-primary ring-1 ring-primary/20" : "border-border"
                    }`}
                    onMouseEnter={() => setHoveredId(bubble.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{bubble.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{bubble.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            0/{bubble.maxPeople}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {bubble.startingIn}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {bubble.zone || "—"}
                          </span>
                        </div>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{bubble.description || "—"}</p>
                      <Button
                        size="sm"
                        className="mt-2 rounded-xl"
                        disabled={isJoining}
                        onClick={() => (isAlreadyMember ? handleOpenChat(bubble.id) : handleJoin(bubble.id))}
                      >
                        {isJoining ? "Joining…" : "Join Bubble"}
                      </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
