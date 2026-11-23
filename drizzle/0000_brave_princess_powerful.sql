CREATE TABLE `challenge_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`challenge_id` integer NOT NULL,
	`text` text NOT NULL,
	`correct` integer NOT NULL,
	`order` integer,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `challenge_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`challenge_id` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`xp_earned` integer DEFAULT 0,
	`self_grade` integer,
	`user_answer` text,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenge_progress_user_id_challenge_id_unique` ON `challenge_progress` (`user_id`,`challenge_id`);--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_id` integer NOT NULL,
	`type` text NOT NULL,
	`skill_track` text NOT NULL,
	`difficulty` text DEFAULT 'foundation' NOT NULL,
	`question` text NOT NULL,
	`content` text,
	`order` integer NOT NULL,
	`xp_reward` integer DEFAULT 10 NOT NULL,
	`model_answer` text,
	`explanation` text,
	`code_language` text,
	`source_repo` text,
	`tags` text,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unit_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`order` integer NOT NULL,
	`source_repo` text,
	`source_url` text,
	`estimated_minutes` integer DEFAULT 10,
	`xp_reward` integer DEFAULT 50 NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resume_bullets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`bullet` text NOT NULL,
	`skill_track` text NOT NULL,
	`earned_at` integer NOT NULL,
	`from_unit_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `skill_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`track` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`challenges_completed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skill_progress_user_id_track_unique` ON `skill_progress` (`user_id`,`track`);--> statement-breakpoint
CREATE TABLE `unit_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`unit_id` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`capstone_completed` integer DEFAULT false NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unit_progress_user_id_unit_id_unique` ON `unit_progress` (`user_id`,`unit_id`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`order` integer NOT NULL,
	`icon_emoji` text DEFAULT '📚' NOT NULL,
	`color` text DEFAULT '#58cc02' NOT NULL,
	`prerequisite_unit_id` integer,
	`capstone_project` text,
	`capstone_resume_bullet` text,
	`resume_score_bonus` integer DEFAULT 2 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`hearts` integer DEFAULT 5 NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`resume_score` integer DEFAULT 85 NOT NULL,
	`active_unit_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
