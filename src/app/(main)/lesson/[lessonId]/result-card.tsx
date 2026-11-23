import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

type Props = {
  status: "correct" | "wrong";
  modelAnswer?: string | null;
  explanation?: string | null;
};

export const ResultCard = ({ status, modelAnswer, explanation }: Props) => {
  return (
    <div
      className={cn(
        "mt-6 p-4 rounded-xl border-2",
        status === "correct"
          ? "bg-green-50 border-green-200"
          : "bg-rose-50 border-rose-200"
      )}
    >
      {modelAnswer && (
        <div className="mb-4">
          <h4 className="font-bold text-sm mb-2 text-slate-700">Model Answer:</h4>
          <div className="p-3 bg-white rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {modelAnswer}
          </div>
        </div>
      )}

      {explanation && (
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1 text-slate-700">Explanation:</h4>
            <p className="text-sm text-slate-600">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};
