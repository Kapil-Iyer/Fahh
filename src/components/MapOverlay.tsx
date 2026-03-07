"use client";

/**
 * MAP OVERLAY - Activities on map, Join Bubble
 * -----------------------------------------------------------------------------
 * DATA: mockBubbles (lib/mockData.ts) - bubbles with lat/lng
 * ON JOIN: addBubbleConversation(bubble) → ConversationsContext
 * API: Replace mockBubbles with GET /api/bubbles?nearby=...
 *      Join → POST /api/bubbles/:id/join (bubble_members)
 * Google Maps: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * -----------------------------------------------------------------------------
 */

import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import { GoogleMap, useJsApiLoader, OverlayView, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { mockBubbles, type Bubble } from "@/lib/mockData";
import { useConversations } from "@/contexts/ConversationsContext";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const { addBubbleConversation } = useConversations();

  const handleJoin = useCallback((id: string) => {
    const bubble = mockBubbles.find((b) => b.id === id);
    if (bubble) addBubbleConversation(bubble);
    setJoinedIds((prev) => new Set(prev).add(id));
    setHoveredId(null);
  }, [addBubbleConversation]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const bubblesWithCoords = useMemo(
    () => mockBubbles.filter((b): b is Bubble & { lat: number; lng: number } => b.lat != null && b.lng != null),
    []
  );

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
            {mockBubbles.map((bubble) => (
              <button
                key={bubble.id}
                type="button"
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
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{bubble.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
