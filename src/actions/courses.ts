// TODO: Rebuild course-management server actions against the new schema.
//
// The previous CRUD here operated on the old model (courses + sections + videos
// with plain title/description columns), which no longer exists. The DB is now:
//   courses → modules → module_items (video/pdf/test/text/link) → course_tests → exercises
// with display text as i18n keys (title_key / description_key / *_key),
// snake_case columns, and per-user progress (module_item_progress, test_attempts).
//
// When rebuilding, mirror the read/write patterns in the main app:
//   - reads:  slovene-step-by-step/src/actions/course-actions.ts
//   - writes: slovene-step-by-step/src/actions/progress-actions.ts
//   - shape:  slovene-step-by-step/docs/courses-schema-reference.md
//
// Intentionally left with no exports until the new actions are implemented.
export {}
