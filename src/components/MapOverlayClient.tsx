"use client";

import { useMapOverlay } from "@/contexts/MapOverlayContext";
import MapOverlay from "./MapOverlay";

export default function MapOverlayClient() {
  const ctx = useMapOverlay();
  if (!ctx || !ctx.isOpen) return null;
  return <MapOverlay onClose={ctx.closeMap} />;
}
