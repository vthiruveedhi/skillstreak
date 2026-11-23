"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Target } from "lucide-react";

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        passphrase,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid passphrase");
      } else {
        router.push("/learn");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            SkillStreak
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Daily tech interview prep for Senior engineers
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Target className="w-5 h-5 text-sky-500" />
              <span>Coding, System Design, Kubernetes, AI Infra</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>Build your streak, earn XP, track progress</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Resume-ready skills for big tech interviews</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="passphrase"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                Enter your passphrase
              </label>
              <input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Start Learning"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Built for Vivekaditya&apos;s Senior SRE/Platform interview prep
        </p>
      </div>
    </div>
  );
}
