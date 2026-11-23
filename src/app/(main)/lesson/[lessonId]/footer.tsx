"use client";

import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  disabled?: boolean;
  status: "correct" | "wrong" | "none" | "completed";
  onCheck: () => void;
};

export const Footer = ({ disabled, status, onCheck }: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "lg:h-[140px] h-[100px] border-t-2",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100",
        status === "completed" && "border-transparent bg-sky-100"
      )}
    >
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="text-green-500 font-bold text-base lg:text-2xl flex items-center">
            <CheckCircle className="w-6 h-6 lg:w-10 lg:h-10 mr-4" />
            Correct!
          </div>
        )}

        {status === "wrong" && (
          <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
            <XCircle className="w-6 h-6 lg:w-10 lg:h-10 mr-4" />
            Try again
          </div>
        )}

        {status === "completed" && (
          <div className="text-sky-500 font-bold text-base lg:text-2xl flex items-center">
            <Trophy className="w-6 h-6 lg:w-10 lg:h-10 mr-4" />
            Lesson Complete!
          </div>
        )}

        {status === "none" && <div />}

        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : status === "completed" ? "super" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Continue"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Finish"}
        </Button>
      </div>
    </footer>
  );
};
