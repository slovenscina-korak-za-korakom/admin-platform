"use client";

import {useEffect, useState} from "react";
import {getPreferredTimezone} from "@/actions/admin-actions";

/**
 * Resolves the tutor's preferred IANA timezone (set in Settings → Preferences).
 *
 * Starts from the browser's timezone so there is a sensible value on first
 * render, then swaps in the stored preference once it loads. When no preference
 * has been set, the browser timezone remains the fallback.
 */
export function usePreferredTimezone(): string {
  const [timezone, setTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    let cancelled = false;
    getPreferredTimezone().then((tz) => {
      if (!cancelled && tz) setTimezone(tz);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return timezone;
}
