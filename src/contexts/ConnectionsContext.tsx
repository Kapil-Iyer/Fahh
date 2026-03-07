"use client";

/**
 * =============================================================================
 * CONNECTIONS CONTEXT - API INTEGRATION REFERENCE
 * =============================================================================
 * Manages: connected users, connection requests, accept/reject.
 *
 * CURRENT: Uses mockData (mockConnectedFriends, mockConnectionRequests).
 *
 * API INTEGRATION POINTS:
 * - connectedIds        → Sync with GET/POST /api/connections
 * - connectionRequests  → Replace with GET /api/connection-requests
 * - addConnection()     → POST /api/connections
 * - removeConnection()  → DELETE /api/connections/:id
 * - acceptRequest()     → POST /api/connection-requests/:id/accept
 * - rejectRequest()     → POST /api/connection-requests/:id/reject
 * - getConnectedFriends() → Merge with GET /api/connections for live status
 * =============================================================================
 */

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  mockConnectedFriends,
  mockConnectionRequests,
  getProfileByName,
  getProfileById,
  getOrCreateProfile,
  type ConnectionRequest,
} from "@/lib/mockData";

type ConnectedFriendEntry = {
  id: string;
  name: string;
  avatar: string;
  currentEvent?: string;
};

type ConnectionsContextValue = {
  connectedIds: Set<string>;
  pendingIds: Set<string>;
  connectionRequests: ConnectionRequest[];
  filteredConnectionRequests: ConnectionRequest[];
  connectionsCount: number;
  isConnected: (profileId: string) => boolean;
  isPending: (profileId: string) => boolean;
  addConnection: (profileId: string) => void;
  removeConnection: (profileId: string) => void;
  addPendingRequest: (profileId: string) => void;
  removePendingRequest: (profileId: string) => void;
  acceptRequest: (requestId: string) => void;
  acceptRequestByProfileId: (profileId: string) => void;
  hasIncomingRequest: (profileId: string) => boolean;
  rejectRequest: (requestId: string) => void;
  getConnectedFriends: () => ConnectedFriendEntry[];
};

const ConnectionsContext = createContext<ConnectionsContextValue | null>(null);

const initialConnectedIds = new Set(
  mockConnectedFriends
    .map((f) => getProfileByName(f.name, f.avatar)?.id)
    .filter((id): id is string => !!id)
);

function getCurrentEvent(name: string): string | undefined {
  const n = name.toLowerCase().replace(/[.\s]/g, " ").trim();
  const found = mockConnectedFriends.find(
    (f) => f.currentEvent && f.name.toLowerCase().replace(/[.\s]/g, " ").trim() === n
  );
  return found?.currentEvent;
}

export function ConnectionsProvider({ children }: { children: React.ReactNode }) {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(initialConnectedIds);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(mockConnectionRequests);
  const [extraProfiles, setExtraProfiles] = useState<Map<string, { name: string; avatar: string }>>(new Map());

  const connectionsCount = connectedIds.size;

  const isConnected = useCallback(
    (profileId: string) => connectedIds.has(profileId),
    [connectedIds]
  );

  const isPending = useCallback(
    (profileId: string) => pendingIds.has(profileId),
    [pendingIds]
  );

  const addConnection = useCallback((profileId: string) => {
    setConnectedIds((prev) => new Set(prev).add(profileId));
  }, []);

  const removeConnection = useCallback((profileId: string) => {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
  }, []);

  const addPendingRequest = useCallback((profileId: string) => {
    setPendingIds((prev) => new Set(prev).add(profileId));
  }, []);

  const removePendingRequest = useCallback((profileId: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(profileId);
      return next;
    });
  }, []);

  const acceptRequest = useCallback((requestId: string) => {
    const req = connectionRequests.find((r) => r.id === requestId);
    if (req) {
      const profile = getProfileByName(req.name, req.avatar) ?? getOrCreateProfile(req.name, req.avatar);
      setConnectedIds((prev) => new Set(prev).add(profile.id));
      if (!getProfileById(profile.id)) {
        setExtraProfiles((prev) => new Map(prev).set(profile.id, { name: profile.name, avatar: profile.avatar }));
      }
      setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  }, [connectionRequests]);

  const rejectRequest = useCallback((requestId: string) => {
    setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const findRequestForProfile = useCallback(
    (profileId: string): ConnectionRequest | null => {
      return connectionRequests.find((req) => {
        const p = getProfileByName(req.name, req.avatar) ?? getOrCreateProfile(req.name, req.avatar);
        return p.id === profileId;
      }) ?? null;
    },
    [connectionRequests]
  );

  const hasIncomingRequest = useCallback(
    (profileId: string) => !!findRequestForProfile(profileId),
    [findRequestForProfile]
  );

  const acceptRequestByProfileId = useCallback(
    (profileId: string) => {
      const req = findRequestForProfile(profileId);
      if (req) {
        const profile = getProfileByName(req.name, req.avatar) ?? getOrCreateProfile(req.name, req.avatar);
        setConnectedIds((prev) => new Set(prev).add(profile.id));
        if (!getProfileById(profile.id)) {
          setExtraProfiles((prev) => new Map(prev).set(profile.id, { name: profile.name, avatar: profile.avatar }));
        }
        setConnectionRequests((prev) => prev.filter((r) => r.id !== req.id));
      }
    },
    [findRequestForProfile]
  );

  const filteredConnectionRequests = useMemo(
    () =>
      connectionRequests.filter((req) => {
        const p = getProfileByName(req.name, req.avatar) ?? getOrCreateProfile(req.name, req.avatar);
        return !connectedIds.has(p.id);
      }),
    [connectionRequests, connectedIds]
  );

  const getConnectedFriends = useCallback((): ConnectedFriendEntry[] => {
    return Array.from(connectedIds)
      .map((id) => {
        const p = getProfileById(id) ?? extraProfiles.get(id);
        if (!p) return null;
        const name = p.name;
        const avatar = p.avatar;
        const currentEvent = getCurrentEvent(name);
        return { id, name, avatar, currentEvent };
      })
      .filter((x): x is ConnectedFriendEntry => x != null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [connectedIds, extraProfiles]);

  const value = useMemo(
    () => ({
      connectedIds,
      pendingIds,
      connectionRequests,
      filteredConnectionRequests,
      connectionsCount,
      isConnected,
      isPending,
      addConnection,
      removeConnection,
      addPendingRequest,
      removePendingRequest,
      acceptRequest,
      acceptRequestByProfileId,
      hasIncomingRequest,
      rejectRequest,
      getConnectedFriends,
    }),
    [
      connectedIds,
      pendingIds,
      connectionRequests,
      filteredConnectionRequests,
      connectionsCount,
      isConnected,
      isPending,
      addConnection,
      removeConnection,
      addPendingRequest,
      removePendingRequest,
      acceptRequest,
      acceptRequestByProfileId,
      hasIncomingRequest,
      rejectRequest,
      getConnectedFriends,
    ]
  );

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) {
    throw new Error("useConnections must be used within ConnectionsProvider");
  }
  return ctx;
}
