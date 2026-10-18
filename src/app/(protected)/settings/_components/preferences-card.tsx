"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getTutorProfile, updateTutorTimezone } from "@/actions/admin-actions";
import Skeleton from "react-loading-skeleton";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TIMEZONES: string[] = (Intl as any).supportedValuesOf?.("timeZone") ?? [];

/** Current UTC offset of a timezone, in minutes. */
function getOffsetMinutes(tz: string): number {
  try {
    const name =
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    const match = name.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    const hours = parseInt(match[2], 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + mins);
  } catch {
    return 0;
  }
}

/** Extract a readable city name from an IANA timezone string. */
function timezoneLabel(tz: string): string {
  return tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
}

/** Render an offset in minutes as "GMT", "GMT+1", "GMT-5:30". */
function offsetLabel(minutes: number): string {
  if (minutes === 0) return "GMT";
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

// Group timezones by their current UTC offset, sorted from west to east,
// and alphabetically within each group.
const TIMEZONE_GROUPS: { label: string; zones: string[] }[] = (() => {
  const byOffset = new Map<number, string[]>();
  for (const tz of TIMEZONES) {
    const offset = getOffsetMinutes(tz);
    const zones = byOffset.get(offset) ?? [];
    zones.push(tz);
    byOffset.set(offset, zones);
  }
  return [...byOffset.entries()]
    .sort(([a], [b]) => a - b)
    .map(([offset, zones]) => ({
      label: offsetLabel(offset),
      zones: zones.sort((a, b) => timezoneLabel(a).localeCompare(timezoneLabel(b))),
    }));
})();

const PreferencesCard = () => {
  const [timezone, setTimezone] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getTutorProfile().then((res) => {
      if (res.status === 200 && res.data) {
        setTimezone(
          res.data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      }
      setIsLoaded(true);
    });
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTutorTimezone(timezone);
      if (result.status === 200) {
        toast.success("Preferences saved.");
      } else {
        toast.error("Failed to save preferences.");
      }
    });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-5">
        <h2 className="text-sm font-semibold">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure defaults used across scheduling and sessions.
        </p>
      </div>

      <Separator />

      <div className="px-6 py-5 space-y-1.5">
        <p className="text-sm font-medium">Timezone</p>
        <p className="text-xs text-muted-foreground">
          All sessions, schedules, and events will use this timezone.
        </p>
        <div className="pt-1">
          {isLoaded ? (
            <div className="relative w-72">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={cn(
                  "w-full h-9 appearance-none rounded-md border border-input bg-transparent",
                  "py-2 pl-3 pr-9 text-sm transition-colors outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:bg-input/30 dark:hover:bg-input/50"
                )}
              >
                {TIMEZONE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.zones.map((tz) => (
                      <option key={tz} value={tz}>
                        {timezoneLabel(tz)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronsUpDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          ) : (
            <Skeleton
              height={36}
              width={288}
              containerClassName="block leading-none"
              style={{ borderRadius: "var(--radius-md)" }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-end px-6 py-3.5 border-t border-border bg-muted/40">
        <Button size="sm" onClick={handleSave} disabled={isPending || !isLoaded}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesCard;
