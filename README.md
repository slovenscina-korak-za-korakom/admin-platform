# Slovenščina Korak za Korakom: Admin Panel

**The internal tool that replaced the school's spreadsheets, calendars, and chat-based scheduling.**

Part of the [Slovenščina Korak za Korakom platform](<!-- TODO: link to main platform repo -->) · Live school: [slovenscinakzk.com](https://slovenscinakzk.com)

<!-- TODO: add a screenshot of the team schedule or dashboard here -->

---

## The problem

Before this panel, the school's administrator spent **5–10 hours a week** managing tutors' hours and schedules across Excel, Google Calendar, and Telegram. Hours and budgets were calculated by hand.

The admin panel moves all of that into one place. **10 staff** use it to run **80–100 lesson-hours per week**, and staff hours and budgets are calculated automatically.

## What it does

- **Dashboard:** today's sessions and events, pending actions, and alerts for anything that needs attention
- **Scheduling:** drag-and-drop calendar for one-on-one sessions with recurring events, live availability, and online or in-person locations
- **Team and budget:** every tutor's schedule, an hours breakdown, and budget tracking, replacing the manual spreadsheet
- **Language club:** group events with capacity limits, pricing, and Stripe payments
- **Course management:** uploads lesson videos to the encrypted streaming pipeline (see the [main platform README](<!-- TODO: link to main platform repo -->))
- **Access control:** role-based access, and new tutors must be activated before they can sign in

---

## Engineering highlight: the time-zone bug

**What happened:** shortly after launch, a tutor entered a session at one time, saved it, and the calendar showed it at a different time. A staff member found it, not a monitor.

**Root cause:** times were stored with a **hard-coded UTC offset**. A fixed offset is wrong for half the year in any zone with daylight saving time, and wrong all year for anyone in a different zone.

**Fix:** every schedule and time slot now stores its **IANA time zone** (for example `Europe/Ljubljana`) together with the local time, and conversions are calculated when the time is displayed (`date-fns-tz`). A session created in Ljubljana now shows the right time for a learner in Moscow all year, even though Slovenia changes its clocks for daylight saving and Russia doesn't.

**What I took from it:** store the user's intent (a local time and a zone), not a precomputed offset. I also learned I need monitoring that catches bugs before users do. That's next on the list.

## Other design decisions

- **All writes go through server actions** with authentication and role checks built in, so no mutation can skip authorization.
- **Forms are validated** with Zod schemas before anything reaches the database.
- **End-to-end tests** run in GitHub Actions on every push, and Vercel only deploys when they pass.

**Stack:** Next.js · React · TypeScript · PostgreSQL (Neon, Drizzle ORM) · Clerk · FullCalendar · dnd-kit · Stripe · Vercel

<details>
<summary>Running locally</summary>

```bash
bun install
cp .env.example .env   # fill in Clerk, database, and Stripe values
bun run dev
```

</details>
