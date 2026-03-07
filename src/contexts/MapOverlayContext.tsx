"use client";

/**
 * =============================================================================
 * MAP OVERLAY CONTEXT
 * =============================================================================
 * Manages: whether the map overlay (activities on map) is open/closed.
 * No API integration needed - pure UI state.
 * =============================================================================
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type MapOverlayContextValue = {
  isOpen: boolean;
  openMap: () => void;
  closeMap: () => void;
};

const MapOverlayContext = createContext<MapOverlayContextValue | null>(null);

export function MapOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMap = useCallback(() => setIsOpen(true), []);
  const closeMap = useCallback(() => setIsOpen(false), []);

  return (
    <MapOverlayContext.Provider value={{ isOpen, openMap, closeMap }}>
      {children}
    </MapOverlayContext.Provider>
  );
}

export function useMapOverlay(): MapOverlayContextValue | null {
  return useContext(MapOverlayContext);
}
