"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import db from "@/db/drizzle";
import { getUserId } from "@/lib/auth";
import {
  challengeProgress,
  challenges,
  userProgress,
  skillProgress,
  MAX_HEARTS,
} from "@/db/schema";

export const upsertChallengeProgress = async (
  challengeId: number,
  xpReward: number,
  userAnswer?: string
) => {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  if (existingProgress?.completed) {
    return { completed: true, error: undefined };
  }

  if (existingProgress) {
    await db
      .update(challengeProgress)
      .set({
        completed: true,
        xpEarned: xpReward,
        userAnswer: userAnswer || null,
        completedAt: new Date(),
      })
      .where(eq(challengeProgress.id, existingProgress.id));
  } else {
    await db.insert(challengeProgress).values({
      userId,
      challengeId,
      completed: true,
      xpEarned: xpReward,
      userAnswer: userAnswer || null,
      completedAt: new Date(),
    });
  }

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + xpReward,
    })
    .where(eq(userProgress.userId, userId));

  const currentSkillProgress = await db.query.skillProgress.findFirst({
    where: and(
      eq(skillProgress.userId, userId),
      eq(skillProgress.track, challenge.skillTrack)
    ),
  });

  if (currentSkillProgress) {
    const newXp = currentSkillProgress.xp + xpReward;
    const newLevel = Math.floor(newXp / 500) + 1;

    await db
      .update(skillProgress)
      .set({
        xp: newXp,
        level: newLevel,
        challengesCompleted: currentSkillProgress.challengesCompleted + 1,
      })
      .where(eq(skillProgress.id, currentSkillProgress.id));
  }

  const today = new Date().toISOString().split("T")[0];
  if (currentUserProgress.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const isConsecutive = currentUserProgress.lastActiveDate === yesterday;

    const newStreak = isConsecutive ? currentUserProgress.currentStreak + 1 : 1;

    await db
      .update(userProgress)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, currentUserProgress.longestStreak),
        lastActiveDate: today,
      })
      .where(eq(userProgress.userId, userId));
  }

  revalidatePath("/learn");
  revalidatePath(`/lesson/${challengeId}`);

  return { completed: true, error: undefined };
};

export const reduceHearts = async (challengeId: number) => {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const existingProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  if (existingProgress?.completed) {
    return { error: "practice" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
  revalidatePath(`/lesson/${challengeId}`);

  return {};
};

export const refillHearts = async () => {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.hearts === MAX_HEARTS) {
    return { error: "full" };
  }

  if (currentUserProgress.points < 50) {
    return { error: "points" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: MAX_HEARTS,
      points: currentUserProgress.points - 50,
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");

  return {};
};
