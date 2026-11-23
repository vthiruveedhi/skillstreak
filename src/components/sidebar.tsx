import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { Flame, BookOpen, FileText, Settings } from "lucide-react";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col bg-white dark:bg-slate-900",
        className
      )}
    >
      <Link href="/learn">
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-sky-600 tracking-wide">
            SkillStreak
          </h1>
        </div>
      </Link>

      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="Learn" href="/learn" Icon={BookOpen} />
        <SidebarItem label="Resume" href="/resume" Icon={FileText} />
        <SidebarItem label="Settings" href="/settings" Icon={Settings} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">V</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Vivekaditya</p>
            <p className="text-xs text-slate-500">Senior SRE Track</p>
          </div>
        </div>
      </div>
    </div>
  );
};
