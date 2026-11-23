import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getResumeBullets, getUserProgress, getSkillProgress } from "@/db/queries";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "../learn/header";
import { FileText, Target, TrendingUp, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [bullets, userProgress, skillProgressData] = await Promise.all([
    getResumeBullets(),
    getUserProgress(),
    getSkillProgress(),
  ]);

  const resumeScore = userProgress?.resumeScore || 85;
  const totalXP = userProgress?.points || 0;

  const skillLabels: Record<string, string> = {
    coding: "Coding & DSA",
    "system-design": "System Design",
    kubernetes: "Kubernetes & CKA",
    cloud: "Cloud & Infrastructure",
    "ai-infra": "AI Infrastructure",
    behavioral: "Behavioral & Leadership",
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Resume Builder" />

        <div className="space-y-6 pb-10">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold">{resumeScore}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Resume Readiness Score</h2>
                <p className="text-green-100 mt-1">
                  {resumeScore >= 95
                    ? "Excellent! You're ready for top-tier interviews."
                    : resumeScore >= 90
                    ? "Great progress! Almost there."
                    : "Keep learning to boost your score!"}
                </p>
              </div>
            </div>

            <div className="mt-4 bg-white/20 rounded-full h-3">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${resumeScore}%` }}
              />
            </div>

            <div className="mt-4 flex justify-between text-sm text-green-100">
              <span>Starting: 85%</span>
              <span>Goal: 100%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-amber-500" />
              <h3 className="font-bold text-lg">Earned Resume Bullets</h3>
            </div>

            {bullets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Complete unit capstones to earn resume bullets!</p>
                <Button asChild variant="primary" className="mt-4">
                  <Link href="/learn">Start Learning</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {bullets.map((bullet) => (
                  <li
                    key={bullet.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm">{bullet.bullet}</p>
                      <span className="text-xs text-slate-500 capitalize">
                        {bullet.skillTrack.replace("-", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-sky-500" />
              <h3 className="font-bold text-lg">Skills Summary</h3>
            </div>

            <div className="grid gap-4">
              {skillProgressData.map((skill) => (
                <div
                  key={skill.track}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getSkillEmoji(skill.track)}</span>
                    <span className="font-medium">
                      {skillLabels[skill.track] || skill.track}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">Level {skill.level}</div>
                    <div className="text-xs text-slate-500">{skill.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-bold text-lg mb-3 text-blue-800 dark:text-blue-300">
              How to Boost Your Score
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Complete unit capstones (+2-5% each)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Finish hands-on projects (gpuqueue, K8s operator)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Complete the CKA certification track
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Build AI infra projects (vLLM deployment, GPU scheduler)
              </li>
            </ul>
          </div>
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Total XP</span>
              <span className="font-bold">{totalXP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bullets Earned</span>
              <span className="font-bold">{bullets.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Companies</span>
              <span className="font-bold">FAANG+</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4">Resources</h3>
          <div className="space-y-3">
            <a
              href="https://github.com/donnemartin/system-design-primer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              System Design Primer
            </a>
            <a
              href="https://github.com/walidshaari/Kubernetes-Certified-Administrator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              CKA Study Resources
            </a>
            <a
              href="https://github.com/vllm-project/vllm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-sky-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              vLLM Documentation
            </a>
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
