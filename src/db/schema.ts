import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const MAX_HEARTS = 5;
export const HEARTS_TO_REFILL = 5;
export const POINTS_TO_REFILL_HEARTS = 50;

export const skillTracks = [
  "coding",
  "system-design",
  "kubernetes",
  "cloud",
  "ai-infra",
  "behavioral",
] as const;
export type SkillTrack = (typeof skillTracks)[number];

export const challengeTypes = ["SELECT", "FILL_IN", "ORDER", "FREE_TEXT"] as const;
export type ChallengeType = (typeof challengeTypes)[number];

export const difficulties = ["foundation", "intermediate", "advanced"] as const;
export type Difficulty = (typeof difficulties)[number];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  hearts: integer("hearts").notNull().default(MAX_HEARTS),
  points: integer("points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  resumeScore: integer("resume_score").notNull().default(85),
  activeUnitId: integer("active_unit_id"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  activeUnit: one(units, {
    fields: [userProgress.activeUnitId],
    references: [units.id],
  }),
}));

export const skillProgress = sqliteTable(
  "skill_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    track: text("track").$type<SkillTrack>().notNull(),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    challengesCompleted: integer("challenges_completed").notNull().default(0),
  },
  (t) => [unique().on(t.userId, t.track)]
);

export const units = sqliteTable("units", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  iconEmoji: text("icon_emoji").notNull().default("📚"),
  color: text("color").notNull().default("#58cc02"),
  prerequisiteUnitId: integer("prerequisite_unit_id"),
  capstoneProject: text("capstone_project"),
  capstoneResumeBullet: text("capstone_resume_bullet"),
  resumeScoreBonus: integer("resume_score_bonus").notNull().default(2),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  lessons: many(lessons),
  prerequisiteUnit: one(units, {
    fields: [units.prerequisiteUnitId],
    references: [units.id],
  }),
}));

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  sourceRepo: text("source_repo"),
  sourceUrl: text("source_url"),
  estimatedMinutes: integer("estimated_minutes").default(10),
  xpReward: integer("xp_reward").notNull().default(50),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").$type<ChallengeType>().notNull(),
  skillTrack: text("skill_track").$type<SkillTrack>().notNull(),
  difficulty: text("difficulty").$type<Difficulty>().notNull().default("foundation"),
  question: text("question").notNull(),
  content: text("content"),
  order: integer("order").notNull(),
  xpReward: integer("xp_reward").notNull().default(10),
  modelAnswer: text("model_answer"),
  explanation: text("explanation"),
  codeLanguage: text("code_language"),
  sourceRepo: text("source_repo"),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = sqliteTable("challenge_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  order: integer("order"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengeProgress = sqliteTable(
  "challenge_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: integer("challenge_id")
      .references(() => challenges.id, { onDelete: "cascade" })
      .notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    xpEarned: integer("xp_earned").default(0),
    selfGrade: integer("self_grade"),
    userAnswer: text("user_answer"),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [unique().on(t.userId, t.challengeId)]
);

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const unitProgress = sqliteTable(
  "unit_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    unitId: integer("unit_id")
      .references(() => units.id, { onDelete: "cascade" })
      .notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    capstoneCompleted: integer("capstone_completed", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [unique().on(t.userId, t.unitId)]
);

export const resumeBullets = sqliteTable("resume_bullets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bullet: text("bullet").notNull(),
  skillTrack: text("skill_track").$type<SkillTrack>().notNull(),
  earnedAt: integer("earned_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  fromUnitId: integer("from_unit_id").references(() => units.id),
});
