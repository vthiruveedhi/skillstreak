import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

export const MAX_HEARTS = 5;
export const HEARTS_TO_REFILL = 5;
export const POINTS_TO_REFILL_HEARTS = 50;

export const skillTrackEnum = pgEnum("skill_track", [
  "coding",
  "system-design",
  "kubernetes",
  "cloud",
  "ai-infra",
  "behavioral",
]);

export const challengeTypeEnum = pgEnum("challenge_type", [
  "SELECT",
  "FILL_IN",
  "ORDER",
  "FREE_TEXT",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "foundation",
  "intermediate",
  "advanced",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
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

export const skillProgress = pgTable(
  "skill_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    track: skillTrackEnum("track").notNull(),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    challengesCompleted: integer("challenges_completed").notNull().default(0),
  },
  (t) => [unique().on(t.userId, t.track)]
);

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
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

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
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

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: challengeTypeEnum("type").notNull(),
  skillTrack: skillTrackEnum("skill_track").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("foundation"),
  question: text("question").notNull(),
  content: text("content"),
  order: integer("order").notNull(),
  xpReward: integer("xp_reward").notNull().default(10),
  modelAnswer: text("model_answer"),
  explanation: text("explanation"),
  codeLanguage: text("code_language"),
  sourceRepo: text("source_repo"),
  tags: jsonb("tags").$type<string[]>(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
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

export const challengeProgress = pgTable(
  "challenge_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: integer("challenge_id")
      .references(() => challenges.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    xpEarned: integer("xp_earned").default(0),
    selfGrade: integer("self_grade"),
    userAnswer: text("user_answer"),
    completedAt: timestamp("completed_at"),
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

export const unitProgress = pgTable(
  "unit_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    unitId: integer("unit_id")
      .references(() => units.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    capstoneCompleted: boolean("capstone_completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
  },
  (t) => [unique().on(t.userId, t.unitId)]
);

export const resumeBullets = pgTable("resume_bullets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bullet: text("bullet").notNull(),
  skillTrack: skillTrackEnum("skill_track").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  fromUnitId: integer("from_unit_id").references(() => units.id),
});
