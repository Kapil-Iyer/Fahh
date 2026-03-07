"use client";

/**
 * PROFILE OVERLAY - User profile modal (Connect/Disconnect)
 * -----------------------------------------------------------------------------
 * Receives profile from ProfileOverlayContext (getOrCreateProfile).
 * Uses ConnectionsContext: isConnected, addConnection, removeConnection
 * API: Profile from GET /api/users/:id; connect → POST /api/connections
 * -----------------------------------------------------------------------------
 */

import { ArrowLeft, UserPlus, UserMinus, Clock } from "lucide-react";
import type { UserProfile } from "@/lib/mockData";
import { useConnections } from "@/contexts/ConnectionsContext";
import { Button } from "@/components/ui/button";

type ProfileOverlayProps = {
  profile: UserProfile;
  onClose: () => void;
};

export default function ProfileOverlay({ profile, onClose }: ProfileOverlayProps) {
  const { isConnected, isPending, addPendingRequest, acceptRequestByProfileId, hasIncomingRequest, removeConnection } = useConnections();
  const connected = isConnected(profile.id);
  const pending = isPending(profile.id);

  const handleConnect = () => {
    if (hasIncomingRequest(profile.id)) {
      acceptRequestByProfileId(profile.id);
    } else {
      addPendingRequest(profile.id);
    }
  };

  const handleDisconnect = () => {
    removeConnection(profile.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-[2px] bg-background/5"
        onClick={onClose}
        aria-label="Close profile"
      />
      <div
        className="relative z-10 w-full max-w-md max-h-[85vh] rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 px-4 lg:px-6 h-14 border-b border-border shrink-0">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {profile.avatar}
            </div>
            <h2 className="text-lg font-bold text-foreground mt-3">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">University of Waterloo</p>
            <div className="mt-4">
              {connected ? (
                <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 rounded-xl">
                  <UserMinus className="w-4 h-4" /> Disconnect
                </Button>
              ) : pending ? (
                <Button variant="outline" size="sm" disabled className="gap-2 rounded-xl text-muted-foreground">
                  <Clock className="w-4 h-4" /> Pending
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnect} className="gap-2 rounded-xl">
                  <UserPlus className="w-4 h-4" /> Connect
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-background/50 border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.connections + (connected ? 1 : 0)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Connections</p>
            </div>
            <div className="bg-background/50 border border-border rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{profile.eventsAttended}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Events Attended</p>
            </div>
          </div>

          {profile.personalityTraits.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Personality Traits</h3>
              <div className="flex flex-wrap gap-2">
                {profile.personalityTraits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.pastBubbles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Past Bubbles</h3>
              <div className="space-y-2">
                {profile.pastBubbles.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background/50 border border-border rounded-xl p-3">
                    <span className="text-xl">{b.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
