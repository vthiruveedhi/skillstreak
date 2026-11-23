import { ExternalLink } from "lucide-react";

type Props = {
  question: string;
  content?: string | null;
  sourceRepo?: string | null;
};

export const QuestionBubble = ({ question, content, sourceRepo }: Props) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative py-4 px-5 border-2 rounded-xl bg-white dark:bg-slate-800">
        <p className="text-base lg:text-lg">{question}</p>

        {content && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
            {content}
          </div>
        )}

        {sourceRepo && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <a
              href={`https://github.com/${sourceRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sky-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Source: {sourceRepo}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
