import { describe, it, expect } from "vitest";
import { wallClockToUtc, convertWeeklyWallClock } from "@/lib/schedule-time";

/**
 * These tests pin down the conversion a tutor relies on: the wall-clock time
 * they enter (in their own timezone) must map to the correct absolute UTC
 * instant that gets stored and later displayed. Assertions use ISO UTC strings
 * so they are independent of the machine's local timezone.
 */
describe("wallClockToUtc", () => {
  it("applies a positive offset (Europe/Ljubljana, winter = UTC+1)", () => {
    const utc = wallClockToUtc("2026-01-15", "09:00", "Europe/Ljubljana");
    expect(utc.toISOString()).toBe("2026-01-15T08:00:00.000Z");
  });

  it("accounts for daylight saving (Europe/Ljubljana, summer = UTC+2)", () => {
    const utc = wallClockToUtc("2026-07-15", "09:00", "Europe/Ljubljana");
    expect(utc.toISOString()).toBe("2026-07-15T07:00:00.000Z");
  });

  it("applies a negative offset (America/New_York, winter = UTC-5)", () => {
    const utc = wallClockToUtc("2026-01-15", "09:00", "America/New_York");
    expect(utc.toISOString()).toBe("2026-01-15T14:00:00.000Z");
  });

  it("accounts for DST in a negative-offset zone (America/New_York, summer = UTC-4)", () => {
    const utc = wallClockToUtc("2026-07-15", "09:00", "America/New_York");
    expect(utc.toISOString()).toBe("2026-07-15T13:00:00.000Z");
  });

  it("handles half-hour offsets (Asia/Kolkata = UTC+5:30)", () => {
    const utc = wallClockToUtc("2026-01-15", "09:00", "Asia/Kolkata");
    expect(utc.toISOString()).toBe("2026-01-15T03:30:00.000Z");
  });

  it("is a no-op for UTC itself", () => {
    const utc = wallClockToUtc("2026-01-15", "09:00", "UTC");
    expect(utc.toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("rolls the date back when the local time is early and the offset is positive", () => {
    // 00:30 in Ljubljana (UTC+1) is the previous day at 23:30 UTC.
    const utc = wallClockToUtc("2026-03-10", "00:30", "Europe/Ljubljana");
    expect(utc.toISOString()).toBe("2026-03-09T23:30:00.000Z");
  });

  it("preserves the local interval between two slots on the same day", () => {
    const first = wallClockToUtc("2026-01-15", "09:00", "Europe/Ljubljana");
    const second = wallClockToUtc("2026-01-15", "10:30", "Europe/Ljubljana");
    const diffMinutes = (second.getTime() - first.getTime()) / 60000;
    expect(diffMinutes).toBe(90);
  });

  it("maps the same wall-clock time to different instants across timezones", () => {
    const ljubljana = wallClockToUtc("2026-01-15", "09:00", "Europe/Ljubljana");
    const newYork = wallClockToUtc("2026-01-15", "09:00", "America/New_York");
    // 09:00 in New York happens 6 hours after 09:00 in Ljubljana (1 + 5).
    const diffHours = (newYork.getTime() - ljubljana.getTime()) / 3_600_000;
    expect(diffHours).toBe(6);
  });
});

/**
 * Re-expressing a weekly slot in another timezone must keep the real-world
 * moment while shifting the local wall-clock (and rolling the day when a slot
 * crosses midnight). A fixed reference week (Jan 2026) pins DST deterministically.
 */
describe("convertWeeklyWallClock", () => {
  // Noon, Thursday 15 Jan 2026 — constructed in local time so the weekday is
  // stable on any machine; mid-day keeps day math away from midnight edges.
  const ref = new Date(2026, 0, 15, 12, 0, 0);

  it("is a no-op when the zones match", () => {
    expect(
      convertWeeklyWallClock(1, "09:00", "Europe/Ljubljana", "Europe/Ljubljana", ref)
    ).toEqual({ dayOfWeek: 1, startTime: "09:00" });
  });

  it("is a no-op when a zone is missing", () => {
    expect(convertWeeklyWallClock(3, "14:00", "", "Europe/London", ref)).toEqual({
      dayOfWeek: 3,
      startTime: "14:00",
    });
  });

  it("shifts the wall-clock west (Ljubljana → London, winter = -1h)", () => {
    expect(
      convertWeeklyWallClock(1, "09:00", "Europe/Ljubljana", "Europe/London", ref)
    ).toEqual({ dayOfWeek: 1, startTime: "08:00" });
  });

  it("rolls back to the previous day when crossing midnight west", () => {
    // Monday 00:30 in Ljubljana (UTC+1) is Sunday 23:30 in London.
    expect(
      convertWeeklyWallClock(1, "00:30", "Europe/Ljubljana", "Europe/London", ref)
    ).toEqual({ dayOfWeek: 0, startTime: "23:30" });
  });

  it("rolls forward to the next day when crossing midnight east", () => {
    // Sunday 23:30 in London is Monday 00:30 in Ljubljana (UTC+1).
    expect(
      convertWeeklyWallClock(0, "23:30", "Europe/London", "Europe/Ljubljana", ref)
    ).toEqual({ dayOfWeek: 1, startTime: "00:30" });
  });

  it("handles a large offset (Ljubljana → New York, winter = -6h)", () => {
    expect(
      convertWeeklyWallClock(1, "09:00", "Europe/Ljubljana", "America/New_York", ref)
    ).toEqual({ dayOfWeek: 1, startTime: "03:00" });
  });
});
