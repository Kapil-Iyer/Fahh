"use client";

import { Home, Compass, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Compass, label: "My Bubbles", path: "/my-bubbles" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
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
  );
}
