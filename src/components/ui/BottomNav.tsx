"use client";

/**
 * BOTTOM NAV - Sidebar (desktop) + bottom bar (mobile)
 * -----------------------------------------------------------------------------
 * Connected friends: useConnections().getConnectedFriends()
 * Replaces: mockConnectedFriends. Updates in real time when connections change.
 * -----------------------------------------------------------------------------
 */

import { useState, useEffect } from "react";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../components/ui/assets/logo.jpg";
import { ProfileLink } from "@/components/ProfileLink";
import { useConnections } from "@/contexts/ConnectionsContext";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Compass, label: "My Bubbles", path: "/my-bubbles" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { getConnectedFriends } = useConnections();
  const connectedFriends = getConnectedFriends();

  // Use pathname for "active" only after mount to avoid server/client hydration mismatch
  const activePath = mounted ? pathname : null;

  return (
    <>
      {/* Desktop sidebar (left) */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border bg-background/60">
            <Image
              src={logo}
              alt="Wanderers logo"
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="text-lg font-extrabold text-foreground">
            <span className="text-primary">W</span>anderers
          </span>
        </div>
        <div className="py-4 flex flex-col min-h-0">
          <div className="flex flex-col gap-1 px-2">
            {tabs.map((tab) => {
              const active = activePath === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-4 mt-2 px-3 border-t border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Connected</p>
            <div className="space-y-1.5">
              {connectedFriends.slice(0, 9).map((friend) => (
                <div key={friend.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground shrink-0">
                    {friend.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <ProfileLink name={friend.name} avatar={friend.avatar} className="text-xs font-medium text-foreground truncate block">
                      {friend.name}
                    </ProfileLink>
                    {friend.currentEvent && (
                      <p className="text-[10px] text-primary truncate">{friend.currentEvent}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
        <div className="max-w-3xl mx-auto flex">
          {tabs.map((tab) => {
            const active = activePath === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
