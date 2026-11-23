"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  options: Array<{
    id: number;
    text: string;
    correct: boolean;
  }>;
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none" | "completed";
  selectedOption?: number;
  disabled?: boolean;
  type: string;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: Props) => {
  return (
    <div className="grid gap-2">
      {options.map((option, index) => {
        const selected = selectedOption === option.id;
        const correct = option.correct;

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={cn(
              "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 p-4 lg:p-6 cursor-pointer active:border-b-2 flex items-center gap-4 transition-all",
              selected && status === "none" && "border-sky-300 bg-sky-100 hover:bg-sky-100",
              selected && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
              selected && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
              !selected && status !== "none" && correct && "border-green-300 bg-green-100",
              disabled && "pointer-events-none hover:bg-white"
            )}
          >
            <div
              className={cn(
                "lg:w-[30px] lg:h-[30px] w-[20px] h-[20px] border-2 flex items-center justify-center rounded-lg text-neutral-400 lg:text-[15px] text-xs font-semibold",
                selected && status === "none" && "border-sky-500 text-sky-500",
                selected && status === "correct" && "border-green-500 text-green-500",
                selected && status === "wrong" && "border-rose-500 text-rose-500",
                !selected && status !== "none" && correct && "border-green-500 text-green-500"
              )}
            >
              {status !== "none" && correct ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : status !== "none" && selected && !correct ? (
                <XCircle className="w-5 h-5" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </div>

            <p
              className={cn(
                "text-neutral-600 text-sm lg:text-base flex-1 text-left",
                selected && status === "none" && "text-sky-500",
                selected && status === "correct" && "text-green-500",
                selected && status === "wrong" && "text-rose-500",
                !selected && status !== "none" && correct && "text-green-500"
              )}
            >
              {option.text}
            </p>
          </button>
        );
      })}
    </div>
  );
};
