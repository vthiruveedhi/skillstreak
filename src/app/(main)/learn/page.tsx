import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUnits, getUserProgress, getSkillProgress, getCourseProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { UnitCard } from "./unit-card";
import { Header } from "./header";

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [units, userProgress, skillProgressData, courseProgress] = await Promise.all([
    getUnits(),
    getUserProgress(),
    getSkillProgress(),
    getCourseProgress(),
  ]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Learning Path" />
        <div className="space-y-4 pb-10">
          {units.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p className="text-lg">No units available yet.</p>
              <p className="text-sm mt-2">Run the seed script to load curriculum.</p>
            </div>
          ) : (
            units.map((unit, index) => {
              const isLocked = index > 0 && !units[index - 1].completed;
              const isActive = courseProgress?.activeLesson?.unitId === unit.id;

              return (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  isLocked={isLocked}
                  isActive={isActive}
                />
              );
            })
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <UserProgress
          hearts={userProgress?.hearts || 5}
          points={userProgress?.points || 0}
          streak={userProgress?.currentStreak || 0}
          resumeScore={userProgress?.resumeScore || 85}
        />
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-lg mb-3">Skill Progress</h3>
          <div className="space-y-3">
            {skillProgressData.map((skill) => (
              <div key={skill.track} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-slate-100 dark:bg-slate-700">
                  {getSkillEmoji(skill.track)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{skill.track.replace("-", " ")}</span>
                    <span className="text-slate-500">Lv {skill.level}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full mt-1">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${(skill.xp % 500) / 5}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </StickyWrapper>
    </div>
  );
}

function getSkillEmoji(track: string): string {
  const emojis: Record<string, string> = {
    coding: "💻",
    "system-design": "🏗️",
    kubernetes: "☸️",
    cloud: "☁️",
    "ai-infra": "🤖",
    behavioral: "🎯",
  };
  return emojis[track] || "📚";
}
