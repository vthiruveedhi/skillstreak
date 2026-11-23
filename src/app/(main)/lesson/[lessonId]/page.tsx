import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLesson, getUserProgress } from "@/db/queries";
import { Quiz } from "./quiz";

type Props = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { lessonId } = await params;
  const lessonIdNum = parseInt(lessonId);

  if (isNaN(lessonIdNum)) {
    redirect("/learn");
  }

  const [lesson, userProgress] = await Promise.all([
    getLesson(lessonIdNum),
    getUserProgress(),
  ]);

  if (!lesson) {
    redirect("/learn");
  }

  const initialPercentage =
    lesson.challenges.length > 0
      ? (lesson.challenges.filter((c) => c.completed).length /
          lesson.challenges.length) *
        100
      : 0;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress?.hearts || 5}
      initialPercentage={initialPercentage}
      lessonTitle={lesson.title}
      unitTitle={lesson.unit?.title || ""}
    />
  );
}
