import { cache } from "react";
import { eq, and, asc } from "drizzle-orm";
import db from "./drizzle";
import {
  users,
  userProgress,
  skillProgress,
  units,
  lessons,
  challenges,
  challengeProgress,
  challengeOptions,
  unitProgress,
  resumeBullets,
  MAX_HEARTS,
} from "./schema";
import { getUserId } from "@/lib/auth";

export const getUserProgress = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  return data;
});

export const getSkillProgress = cache(async () => {
  const userId = await getUserId();
  if (!userId) return [];

  const data = await db.query.skillProgress.findMany({
    where: eq(skillProgress.userId, userId),
  });

  return data;
});

export const getUnits = cache(async () => {
  const userId = await getUserId();
  if (!userId) return [];

  const data = await db.query.units.findMany({
    orderBy: [asc(units.order)],
    with: {
      lessons: {
        orderBy: [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: [asc(challenges.order)],
            with: {
              challengeProgress: userId
                ? {
                    where: eq(challengeProgress.userId, userId),
                  }
                : undefined,
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    const unitCompleted =
      lessonsWithCompletedStatus.length > 0 &&
      lessonsWithCompletedStatus.every((lesson) => lesson.completed);

    return { ...unit, lessons: lessonsWithCompletedStatus, completed: unitCompleted };
  });

  return normalizedData;
});

export const getUnitById = cache(async (unitId: number) => {
  const data = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      lessons: {
        orderBy: [asc(lessons.order)],
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;

  const unitsData = await getUnits();

  const firstUncompletedLesson = unitsData
    .flatMap((unit) => unit.lessons)
    .find((lesson) => !lesson.completed);

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const userId = await getUserId();
  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: true,
      challenges: {
        orderBy: [asc(challenges.order)],
        with: {
          challengeOptions: {
            orderBy: [asc(challengeOptions.order)],
          },
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) return null;

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson || lesson.challenges.length === 0) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getResumeBullets = cache(async () => {
  const userId = await getUserId();
  if (!userId) return [];

  const data = await db.query.resumeBullets.findMany({
    where: eq(resumeBullets.userId, userId),
    orderBy: [asc(resumeBullets.earnedAt)],
  });

  return data;
});

export const getResumeScore = cache(async () => {
  const progress = await getUserProgress();
  return progress?.resumeScore || 85;
});

export const getTotalXP = cache(async () => {
  const progress = await getUserProgress();
  return progress?.points || 0;
});

export const getStreak = cache(async () => {
  const progress = await getUserProgress();
  return {
    current: progress?.currentStreak || 0,
    longest: progress?.longestStreak || 0,
  };
});
