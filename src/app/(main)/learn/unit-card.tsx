"use client";

import Link from "next/link";
import { Lock, CheckCircle, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Lesson = {
  id: number;
  title: string;
  completed: boolean;
};

type Unit = {
  id: number;
  title: string;
  description: string;
  iconEmoji: string;
  color: string;
  lessons: Lesson[];
  completed: boolean;
  capstoneProject?: string | null;
};

type Props = {
  unit: Unit;
  isLocked: boolean;
  isActive: boolean;
};

export const UnitCard = ({ unit, isLocked, isActive }: Props) => {
  const completedLessons = unit.lessons.filter((l) => l.completed).length;
  const totalLessons = unit.lessons.length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const nextLesson = unit.lessons.find((l) => !l.completed);

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isLocked
          ? "border-slate-200 bg-slate-50 dark:bg-slate-800/50 opacity-70"
          : isActive
          ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
          : "border-slate-200 bg-white dark:bg-slate-800 hover:border-sky-300"
      }`}
    >
      <div
        className="h-2"
        style={{ backgroundColor: isLocked ? "#94a3b8" : unit.color }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
              isLocked
                ? "bg-slate-200 dark:bg-slate-700"
                : "bg-white dark:bg-slate-700 shadow-md"
            }`}
            style={{
              borderColor: isLocked ? undefined : unit.color,
              borderWidth: isLocked ? 0 : 2,
            }}
          >
            {isLocked ? <Lock className="w-6 h-6 text-slate-400" /> : unit.iconEmoji}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{unit.title}</h3>
              {unit.completed && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {unit.description}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">
              {completedLessons} / {totalLessons} lessons
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {unit.capstoneProject && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Capstone: {unit.capstoneProject}</span>
            </div>
          </div>
        )}

        {!isLocked && (
          <div className="mt-4 flex flex-wrap gap-2">
            {nextLesson ? (
              <Button asChild variant="primary" className="flex-1">
                <Link href={`/lesson/${nextLesson.id}`}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            ) : unit.completed ? (
              <Button variant="secondary" className="flex-1" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </Button>
            ) : (
              <Button asChild variant="primary" className="flex-1">
                <Link href={`/lesson/${unit.lessons[0]?.id}`}>
                  Start Unit
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {isLocked && (
          <p className="mt-4 text-center text-sm text-slate-400 italic">
            Complete the previous unit to unlock
          </p>
        )}
      </div>
    </div>
  );
};
