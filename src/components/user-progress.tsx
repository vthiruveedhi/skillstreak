import Link from "next/link";
import { Heart, Flame, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  hearts: number;
  points: number;
  streak: number;
  resumeScore: number;
};

export const UserProgress = ({ hearts, points, streak, resumeScore }: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border">
      <Button variant="ghost" asChild className="text-orange-500">
        <Link href="/learn" className="flex items-center gap-2">
          <Flame className="w-5 h-5" />
          <span className="font-bold">{streak}</span>
        </Link>
      </Button>

      <Button variant="ghost" asChild className="text-sky-500">
        <Link href="/learn" className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="font-bold">{points}</span>
        </Link>
      </Button>

      <Button variant="ghost" asChild className="text-rose-500">
        <Link href="/learn" className="flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500" />
          <span className="font-bold">{hearts}</span>
        </Link>
      </Button>

      <Button variant="ghost" asChild className="text-green-500">
        <Link href="/resume" className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="font-bold">{resumeScore}%</span>
        </Link>
      </Button>
    </div>
  );
};
