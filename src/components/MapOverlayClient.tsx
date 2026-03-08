"use client";

import dynamic from "next/dynamic";
import { useMapOverlay } from "@/contexts/MapOverlayContext";

const MapOverlay = dynamic(() => import("./MapOverlay"), { ssr: false });

export default function MapOverlayClient() {
  const ctx = useMapOverlay();
  if (!ctx || !ctx.isOpen) return null;
  return <MapOverlay onClose={ctx.closeMap} />;
}
