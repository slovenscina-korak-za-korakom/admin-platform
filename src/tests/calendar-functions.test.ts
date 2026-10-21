import { describe, it, expect } from "vitest";
import { getEvents } from "@/lib/calendar-functions";
import { getSessionColor } from "@/lib/session-colors";
import type {
  AvailableSlotData,
  SessionData,
  StudentInfo,
} from "@/components/calendar/types";

const baseSession = (overrides: Partial<SessionData> = {}): SessionData => ({
  id: 1,
  startTime: new Date("2026-01-01T10:00:00.000Z"),
  duration: 60,
  status: "booked",
  sessionType: "individual",
  location: "online",
  studentId: "student-1",
  tutorId: 1,
  ...overrides,
});

const baseSlot = (overrides: Partial<AvailableSlotData> = {}): AvailableSlotData => ({
  id: 1,
  startTime: new Date("2026-01-01T12:00:00.000Z"),
  duration: 60,
  sessionType: "individual",
  location: "online",
  tutorId: 1,
  ...overrides,
});

describe("getEvents", () => {
  it("computes the end time from startTime + duration", () => {
    const session = baseSession({ duration: 90 });
    const [event] = getEvents([session], []);

    expect(event.start).toEqual(session.startTime);
    expect(event.end).toEqual(new Date("2026-01-01T11:30:00.000Z"));
  });

  it("builds the booked title from the student name and session type", () => {
    const students: Record<string, StudentInfo | null> = {
      "student-1": { name: "Ana", email: "ana@example.com", image: "" },
    };
    const [event] = getEvents([baseSession()], [], students);

    expect(event.title).toBe("Ana - individual");
  });

  it("falls back to 'Unknown' when the student info is missing", () => {
    const [event] = getEvents([baseSession()], [], {});
    expect(event.title).toBe("Unknown - individual");
  });

  it("uses a capitalized type label and session color when addEventRoute is set", () => {
    const [event] = getEvents([baseSession({ sessionType: "group" })], [], true);

    expect(event.title).toBe("Group");
    expect(event.backgroundColor).toBe(getSessionColor("group"));
    expect(event.textColor).toBe("#ffffff");
  });

  it("marks booked events as not available", () => {
    const [event] = getEvents([baseSession()], []);
    expect(event.extendedProps.isAvailable).toBe(false);
  });

  it("includes available slots as separate transparent events", () => {
    const events = getEvents([], [baseSlot()]);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("available-1");
    expect(events[0].backgroundColor).toBe("transparent");
    expect(events[0].extendedProps.isAvailable).toBe(true);
  });

  it("filters out available slots that collide with a booked session", () => {
    const start = new Date("2026-01-01T10:00:00.000Z");
    const session = baseSession({ startTime: start, duration: 60, sessionType: "individual" });
    const slot = baseSlot({ startTime: start, duration: 60, sessionType: "individual" });

    const events = getEvents([session], [slot]);

    // Only the booked event should remain; the overlapping slot is dropped.
    expect(events).toHaveLength(1);
    expect(events[0].extendedProps.isAvailable).toBe(false);
  });

  it("keeps an available slot that does not collide with a booked session", () => {
    const session = baseSession({ startTime: new Date("2026-01-01T10:00:00.000Z") });
    const slot = baseSlot({ startTime: new Date("2026-01-01T14:00:00.000Z") });

    const events = getEvents([session], [slot]);
    expect(events).toHaveLength(2);
  });

  it("ignores available slots without a startTime", () => {
    const slot = baseSlot({ startTime: undefined as unknown as Date });
    const events = getEvents([], [slot]);
    expect(events).toHaveLength(0);
  });
});
