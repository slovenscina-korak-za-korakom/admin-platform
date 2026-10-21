import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Convert a wall-clock calendar date + time, as observed in the given IANA
 * timezone, into the equivalent absolute UTC instant.
 *
 * This is the canonical conversion used when a tutor sets up a schedule or a
 * one-off slot: the tutor enters a local date/time (e.g. "2026-01-15" at
 * "09:00") together with their timezone, and we persist the corresponding
 * UTC `Date`. Daylight-saving transitions are handled by `date-fns-tz`.
 *
 * The result is independent of the machine's local timezone, so it behaves
 * identically on a developer's laptop and in CI.
 *
 * @param date      Calendar date as "YYYY-MM-DD"
 * @param startTime Wall-clock time as "HH:mm"
 * @param timezone  IANA timezone name, e.g. "Europe/Ljubljana"
 */
export function wallClockToUtc(
  date: string,
  startTime: string,
  timezone: string
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [h, m] = startTime.split(":").map(Number);
  return fromZonedTime(new Date(year, month - 1, day, h, m, 0, 0), timezone);
}

/**
 * Re-express a weekly recurring slot (day-of-week + wall-clock time) from one
 * timezone into another, preserving the absolute real-world moment.
 *
 * A slot stored as "Monday 09:00" in `fromTz` is the same instant as, say,
 * "Monday 08:00" in a zone one hour to the west — and crossing midnight can
 * roll the slot onto an adjacent day. We anchor the conversion to a concrete
 * calendar date in `reference`'s week so daylight-saving offsets resolve the
 * way they do "around now".
 *
 * Returns the equivalent `{ dayOfWeek, startTime }` in `toTz`. When the zones
 * match (or either is empty) the slot is returned unchanged.
 *
 * @param dayOfWeek 0 = Sunday … 6 = Saturday
 * @param startTime Wall-clock time as "HH:mm"
 * @param fromTz    IANA timezone the slot is currently expressed in
 * @param toTz      IANA timezone to re-express the slot in
 * @param reference Any date in the week used to anchor DST offsets (defaults to now)
 */
export function convertWeeklyWallClock(
  dayOfWeek: number,
  startTime: string,
  fromTz: string,
  toTz: string,
  reference: Date = new Date()
): { dayOfWeek: number; startTime: string } {
  if (!fromTz || !toTz || fromTz === toTz) {
    return { dayOfWeek, startTime };
  }

  // Pick the date in the reference week that falls on `dayOfWeek` (week starts
  // Monday) so we have a real calendar date to anchor the zone offsets to.
  const monday = new Date(reference);
  const dow = monday.getDay();
  monday.setDate(monday.getDate() - dow + (dow === 0 ? -6 : 1));
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const slotDate = new Date(monday);
  slotDate.setDate(slotDate.getDate() + offset);

  const y = slotDate.getFullYear();
  const mo = String(slotDate.getMonth() + 1).padStart(2, "0");
  const d = String(slotDate.getDate()).padStart(2, "0");

  // Interpret the wall-clock in fromTz → absolute instant → wall-clock in toTz.
  const instant = fromZonedTime(`${y}-${mo}-${d}T${startTime}:00`, fromTz);
  const isoDay = Number(formatInTimeZone(instant, toTz, "i")); // 1 = Mon … 7 = Sun
  return {
    dayOfWeek: isoDay % 7, // back to 0 = Sunday … 6 = Saturday
    startTime: formatInTimeZone(instant, toTz, "HH:mm"),
  };
}
