"use client";

/**
 * PROFILE LINK - Clickable username that opens ProfileOverlay
 * -----------------------------------------------------------------------------
 * Calls ProfileOverlayContext.openProfile(name, avatar) → getOrCreateProfile
 * Used in: BubbleCard, FeedPost, BottomNav, Chat, Connection requests
 * -----------------------------------------------------------------------------
 */

import { useProfileOverlay } from "@/contexts/ProfileOverlayContext";

type ProfileLinkProps = {
  name: string;
  avatar?: string;
  children: React.ReactNode;
  className?: string;
};

export function ProfileLink({ name, avatar, children, className = "" }: ProfileLinkProps) {
  const profileOverlay = useProfileOverlay();
  if (!profileOverlay || name === "you" || name === "You") {
    return <span className={className}>{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        profileOverlay.openProfile(name, avatar);
      }}
      className={`hover:underline hover:text-primary transition-colors cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
