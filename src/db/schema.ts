import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  decimal,
  // pgEnum,
  jsonb, pgEnum,
} from "drizzle-orm/pg-core";

// export const sessionStatus = pgEnum("session_status", [
//   "available",
//   "booked",
//   "cancelled",
//   "completed",
//   "no-show",
// ]);

type Localized = {
  ru: string;
  en: string;
  it: string;
  sl: string;
};

export const tutorLevelEnum = pgEnum("tutor_level", ["junior", "senior"]);
export const courseLevelEnum = pgEnum("course_level", ["A1", "A2", "B1", "B2", "C1"]);
export const courseStatusEnum = pgEnum("course_status", ["upcoming", "active", "deleted"]);
export const exerciseTypeEnum = pgEnum("exercise_type", [
  "multiple_choice",
  "sort",
  "match",
  "speak",
]);
export const moduleItemTypeEnum = pgEnum("module_item_type", [
  "video",
  "pdf",
  "test",
  "text",
  "link",
]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "expired",
  "refunded",
]);
export const enrollmentSourceEnum = pgEnum("enrollment_source", [
  "free",
  "stripe",
  "admin",
]);

/**
 * Type-specific payload for an interactive-test exercise, stored in
 * `exercises.data` (JSONB). Mirrors the shapes consumed by the exercise engine
 * in `src/lib/course-exercises.ts`. Instruction/label strings are i18n keys
 * (resolved under the `courses.test` namespace); Slovene target material
 * (words, transcriptions, greetings) is stored verbatim.
 */
export type MultipleChoiceData = {
  /** Optional big Slovene word shown above the options. */
  word?: string;
  options: { id: string; text: string }[];
  /** Id of the correct option. */
  correctAnswer: string;
};
export type SortData = {
  buckets: [{ id: string; labelKey: string }, { id: string; labelKey: string }];
  /** Each item's `bucket` is the id of the bucket it belongs in. */
  items: { id: string; text: string; bucket: string }[];
};
export type MatchData = {
  /** Left column prompts (situations); `promptKey` is an i18n key. */
  left: { id: string; promptKey: string }[];
  /** Right column fixed Slovene options. */
  right: { id: string; text: string }[];
  /** Correct pairing: left id → right id. */
  solution: Record<string, string>;
};
export type SpeakData = {
  /** The fixed Slovene word/phrase to pronounce. */
  word: string;
  /** Accepted transcriptions; diacritics are folded on compare. */
  accept: string[];
};
export type ExerciseData = MultipleChoiceData | SortData | MatchData | SpeakData;

/**
 * Type-specific payload for a module content item, stored in
 * `module_items.data` (JSONB). The `type` column selects the variant. Display
 * text uses i18n keys (`module_items.titleKey`, `TextItemData.bodyKey`); URLs
 * and asset ids are stored verbatim.
 */
export type VideoItemData = { url: string; provider?: string; durationSec?: number };
export type PdfItemData = { assetId: string }; // resolved + watermarked via the secure API route
export type TestItemData = { testId: number }; // → course_tests.id
export type TextItemData = { bodyKey: string }; // i18n key (markdown allowed)
export type LinkItemData = { url: string };
export type ModuleItemData =
  | VideoItemData
  | PdfItemData
  | TestItemData
  | TextItemData
  | LinkItemData;

/** Per-exercise result stored on a test attempt (`test_attempts.answers`). */
export type TestAttemptAnswers = {
  exerciseSlug: string;
  correct: boolean;
  given: unknown; // the learner's raw answer (shape depends on exercise type)
}[];

export const langClubTable = pgTable("lang_club", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tutor: varchar({length: 255}).notNull(),
  date: timestamp({withTimezone: true}).notNull(),
  theme: varchar({length: 255}).notNull(),
  description: text(),
  level: text(),
  location: text().notNull(),
  peopleBooked: integer().notNull().default(0),
  maxBooked: integer().notNull().default(0),
  duration: integer(),
  price: decimal({precision: 10, scale: 2}).notNull().default("0"),
  stripeProductId: varchar({length: 255}),
  stripePriceId: varchar({length: 255}),
});

export const langClubBookingsTable = pgTable("lang_club_bookings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer()
    .notNull()
    .references(() => langClubTable.id),
  userId: varchar({length: 255}).notNull(),
  stripeSessionId: varchar({length: 255}),
  stripePaymentIntentId: varchar({length: 255}),
  status: varchar({length: 50}).notNull().default("pending"), // pending, paid, cancelled, refunded
  amount: decimal({precision: 10, scale: 2}).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const timeblocksTable = pgTable("timeblocks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tutorId: integer()
    .notNull()
    .references(() => tutorsTable.id),
  startTime: timestamp({withTimezone: true}).notNull(),
  duration: integer().notNull(),
  status: varchar({length: 255}).notNull(),
  sessionType: varchar({length: 255}).notNull(),
  location: varchar({length: 255}).notNull(),
  studentId: varchar({length: 128}).notNull(),
  updatedAt: timestamp().notNull().defaultNow(),
  videoCallUrl: varchar({length: 255}),
});

export const tutorsTable = pgTable("tutors", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({length: 255}).notNull(),
  email: varchar({length: 255}).notNull().unique(),
  phone: varchar({length: 255}).notNull(),
  bio: jsonb().notNull().$type<Localized>(),
  avatar: varchar({length: 255}).notNull(),
  color: varchar({length: 255}).notNull(),
  clerkId: varchar({length: 255}).notNull().unique(),
  level: tutorLevelEnum().notNull().default("junior"),
  timezone: varchar({length: 100}), // IANA name, e.g. 'Europe/Ljubljana'
});

export const schedulesTable = pgTable("schedules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ownerId: varchar({length: 255}).notNull(),
  schedule: jsonb().notNull(),
  timezone: varchar({length: 100}).notNull(), // IANA name, e.g. 'America/Los_Angeles'
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const regularInvitationsTable = pgTable("regular_invitations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  token: varchar({length: 255}).notNull().unique(),
  tutorId: integer()
    .notNull()
    .references(() => tutorsTable.id),
  studentEmail: varchar({length: 255}).notNull(),
  studentClerkId: varchar({length: 255}),
  status: varchar({length: 50}).notNull().default("pending"),
  dayOfWeek: integer().notNull(),
  startTime: varchar({length: 10}).notNull(), // wall-clock HH:mm in `timezone`
  duration: integer().notNull(),
  location: varchar({length: 255}).notNull(),
  description: text(),
  pricePerSession: decimal({precision: 10, scale: 2}),
  timezone: varchar({length: 100}), // IANA name, e.g. 'America/Los_Angeles'
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
  confirmedAt: timestamp({withTimezone: true}),
  updatedAt: timestamp({withTimezone: true}).notNull().defaultNow(),
});

export const cancelledRegularSessionsTable = pgTable("cancelled_regular_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  invitationId: integer()
    .notNull()
    .references(() => regularInvitationsTable.id),
  cancelledDate: timestamp({withTimezone: true}).notNull(),
  reason: text(),
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
});

export const availableSlotsTable = pgTable("available_slots", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tutorId: integer()
    .notNull()
    .references(() => tutorsTable.id),
  startTime: timestamp({withTimezone: true}).notNull(),
  duration: integer().notNull(),
  sessionType: varchar({length: 255}).notNull(),
  location: varchar({length: 255}).notNull(),
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
  videoCallUrl: varchar({length: 255}),
});

export const coursesTable = pgTable("courses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({length: 128}).notNull().unique(),       // URL segment
  titleKey: varchar({length: 255}).notNull(),            // i18n key (courses.content.*)
  descriptionKey: varchar({length: 255}),                // i18n key
  thumbnail: varchar({length: 255}).notNull().default("https://www.slovenscinakzk.com/meta-image-link.jpg"),
  level: courseLevelEnum().notNull().default("A1"),
  order: integer().notNull().default(0),
  status: courseStatusEnum().notNull().default("upcoming"),
});

export const modulesTable = pgTable("modules", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({length: 128}).notNull(),                // URL segment (unique within course)
  titleKey: varchar({length: 255}).notNull(),            // i18n key
  descriptionKey: varchar({length: 255}),                // i18n key
  courseId: integer().notNull().references(() => coursesTable.id),
  order: integer().notNull().default(0),
})

/**
 * An interactive test (Duolingo-style) belonging to a module. A module may have
 * several; `slug` is the URL id used at
 * /courses/[courseId]/[sectionId]/test/[testId].
 */
export const courseTestsTable = pgTable("course_tests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // The module this test belongs to. ACTIVE: test lookup (getTestBySlug,
  // resolveTestId) and seeding resolve a test by (moduleId, slug). A `test`
  // module_items row additionally points here via data.testId for the launcher.
  moduleId: integer().notNull().references(() => modulesTable.id),
  slug: varchar({length: 128}).notNull(),
  titleKey: varchar({length: 255}).notNull(), // i18n key under courses.test
  passThreshold: integer(),                   // % correct to "pass" (null = no gate)
  order: integer().notNull().default(0),
})

export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  testId: integer().notNull().references(() => courseTestsTable.id),
  slug: varchar({length: 128}).notNull(), // stable string id within a test
  type: exerciseTypeEnum().notNull(),
  promptKey: varchar({length: 255}).notNull(), // i18n key under courses.test
  data: jsonb().notNull().$type<ExerciseData>(),
  order: integer().notNull().default(0),
})

/**
 * Flexible, ordered content inside a module: videos, PDFs, tests, text, links.
 * `data` holds the type-specific payload (see ModuleItemData).
 */
export const moduleItemsTable = pgTable("module_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  moduleId: integer().notNull().references(() => modulesTable.id),
  type: moduleItemTypeEnum().notNull(),
  titleKey: varchar({length: 255}),           // optional per-item heading (i18n key)
  data: jsonb().notNull().$type<ModuleItemData>(),
  order: integer().notNull().default(0),
})

/** Per-user completion + video resume position, one row per (user, item). */
export const moduleItemProgressTable = pgTable("module_item_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({length: 255}).notNull(),   // Clerk id
  moduleItemId: integer().notNull().references(() => moduleItemsTable.id),
  completed: boolean().notNull().default(false),
  completedAt: timestamp({withTimezone: true}),
  lastPositionSec: integer(),                  // video resume
  updatedAt: timestamp({withTimezone: true}).notNull().defaultNow(),
})

/** One row per test attempt, graded server-side, with per-exercise results. */
export const testAttemptsTable = pgTable("test_attempts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({length: 255}).notNull(),
  testId: integer().notNull().references(() => courseTestsTable.id),
  score: integer().notNull(),                  // # correct
  total: integer().notNull(),
  passed: boolean().notNull(),
  answers: jsonb().notNull().$type<TestAttemptAnswers>(),
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
})

/**
 * Future-ready access control (paywall). Defined now so the schema is stable;
 * enforcement is deferred — see docs/future-asset-security.md.
 */
export const courseEnrollmentsTable = pgTable("course_enrollments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({length: 255}).notNull(),
  courseId: integer().notNull().references(() => coursesTable.id),
  status: enrollmentStatusEnum().notNull().default("active"),
  source: enrollmentSourceEnum().notNull().default("free"),
  stripeSessionId: varchar({length: 255}),
  stripePaymentIntentId: varchar({length: 255}),
  createdAt: timestamp({withTimezone: true}).notNull().defaultNow(),
  expiresAt: timestamp({withTimezone: true}),
})

export const coursesRelations = relations(coursesTable, ({ many }) => ({
  modules: many(modulesTable),
  enrollments: many(courseEnrollmentsTable),
}));

export const modulesRelations = relations(modulesTable, ({ one, many }) => ({
  course: one(coursesTable, { fields: [modulesTable.courseId], references: [coursesTable.id] }),
  tests: many(courseTestsTable),
  items: many(moduleItemsTable),
}));

export const courseTestsRelations = relations(courseTestsTable, ({ one, many }) => ({
  module: one(modulesTable, { fields: [courseTestsTable.moduleId], references: [modulesTable.id] }),
  exercises: many(exercisesTable),
}));

export const exercisesRelations = relations(exercisesTable, ({ one }) => ({
  test: one(courseTestsTable, { fields: [exercisesTable.testId], references: [courseTestsTable.id] }),
}));

export const moduleItemsRelations = relations(moduleItemsTable, ({ one, many }) => ({
  module: one(modulesTable, { fields: [moduleItemsTable.moduleId], references: [modulesTable.id] }),
  progress: many(moduleItemProgressTable),
}));

export const moduleItemProgressRelations = relations(moduleItemProgressTable, ({ one }) => ({
  item: one(moduleItemsTable, { fields: [moduleItemProgressTable.moduleItemId], references: [moduleItemsTable.id] }),
}));

export const testAttemptsRelations = relations(testAttemptsTable, ({ one }) => ({
  test: one(courseTestsTable, { fields: [testAttemptsTable.testId], references: [courseTestsTable.id] }),
}));

export const courseEnrollmentsRelations = relations(courseEnrollmentsTable, ({ one }) => ({
  course: one(coursesTable, { fields: [courseEnrollmentsTable.courseId], references: [coursesTable.id] }),
}));
