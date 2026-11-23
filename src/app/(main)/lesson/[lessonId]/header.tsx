"use client";

import { useRouter } from "next/navigation";
import { X, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Props = {
  hearts: number;
  percentage: number;
  lessonTitle: string;
};

export const Header = ({ hearts, percentage, lessonTitle }: Props) => {
  const router = useRouter();

  return (
    <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
      <button onClick={() => router.push("/learn")} aria-label="Close lesson">
        <X className="text-slate-500 hover:opacity-75 transition" />
      </button>

      <div className="flex-1 flex flex-col items-center gap-1">
        <Progress value={percentage} className="h-3" />
        <span className="text-xs text-slate-500">{lessonTitle}</span>
      </div>

      <div className="text-rose-500 flex items-center font-bold">
        <Heart className="w-6 h-6 mr-2 fill-rose-500" />
        {hearts}
      </div>
    </header>
  );
};
