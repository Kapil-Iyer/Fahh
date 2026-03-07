"use client";

/**
 * =============================================================================
 * PROFILE OVERLAY CONTEXT - API INTEGRATION REFERENCE
 * =============================================================================
 * Manages: which user profile is shown in the profile overlay modal.
 *
 * CURRENT: Uses getOrCreateProfile() from mockData (mockUserProfiles lookup).
 *
 * API INTEGRATION: openProfile(name, avatar) should fetch user via
 *   GET /api/users/by-username/:name or similar. Replace getOrCreateProfile.
 * =============================================================================
 */

import { createContext, useContext, useState, useCallback } from "react";
import { getOrCreateProfile, type UserProfile } from "@/lib/mockData";

type ProfileOverlayContextValue = {
  isOpen: boolean;
  selectedProfile: UserProfile | null;
  openProfile: (name: string, avatar?: string) => void;
  closeProfile: () => void;
};

const ProfileOverlayContext = createContext<ProfileOverlayContextValue | null>(null);

export function ProfileOverlayProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const openProfile = useCallback((name: string, avatar?: string) => {
    setSelectedProfile(getOrCreateProfile(name, avatar));
  }, []);

  const closeProfile = useCallback(() => setSelectedProfile(null), []);

  return (
    <ProfileOverlayContext.Provider
      value={{
        isOpen: selectedProfile != null,
        selectedProfile,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </ProfileOverlayContext.Provider>
  );
}

export function useProfileOverlay() {
  const ctx = useContext(ProfileOverlayContext);
  return ctx;
}
