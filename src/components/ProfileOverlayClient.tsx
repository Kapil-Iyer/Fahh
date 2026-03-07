"use client";

import { useProfileOverlay } from "@/contexts/ProfileOverlayContext";
import ProfileOverlay from "./ProfileOverlay";

export default function ProfileOverlayClient() {
  const ctx = useProfileOverlay();
  if (!ctx || !ctx.selectedProfile) return null;
  return <ProfileOverlay profile={ctx.selectedProfile} onClose={ctx.closeProfile} />;
}
