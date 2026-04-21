"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Mail, Lock, UserCog, Settings2 } from "lucide-react";

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "email", label: "Email", icon: Mail },
  { id: "password", label: "Password", icon: Lock },
  { id: "tutor-profile", label: "Tutor Profile", icon: UserCog },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];

export function SettingsNav({ activeSection }: { activeSection: string }) {
  const router = useRouter();

  return (
    <nav className="md:w-44 md:shrink-0">
      {/* Mobile: horizontal scrollable pill row */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => router.push(`?section=${id}`)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0",
              activeSection === id
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon size={13} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: vertical list */}
      <ul className="hidden md:block space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              onClick={() => router.push(`?section=${id}`)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left cursor-pointer",
                activeSection === id
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}