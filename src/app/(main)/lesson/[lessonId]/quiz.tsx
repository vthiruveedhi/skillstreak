"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { ResultCard } from "./result-card";
import { upsertChallengeProgress, reduceHearts } from "@/actions/challenge-progress";

type ChallengeOption = {
  id: number;
  text: string;
  correct: boolean;
  order: number | null;
};

type ChallengeData = {
  id: number;
  type: "SELECT" | "FILL_IN" | "ORDER" | "FREE_TEXT";
  question: string;
  content: string | null;
  order: number;
  xpReward: number;
  modelAnswer: string | null;
  explanation: string | null;
  challengeOptions: ChallengeOption[];
  completed: boolean;
  skillTrack: string;
  sourceRepo: string | null;
};

type Props = {
  initialLessonId: number;
  initialLessonChallenges: ChallengeData[];
  initialHearts: number;
  initialPercentage: number;
  lessonTitle: string;
  unitTitle: string;
};

export const Quiz = ({
  initialLessonId,
  initialLessonChallenges,
  initialHearts,
  initialPercentage,
  lessonTitle,
  unitTitle,
}: Props) => {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [pending, startTransition] = useTransition();

  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex((c) => !c.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });
  const [selectedOption, setSelectedOption] = useState<number>();
  const [userAnswer, setUserAnswer] = useState("");
  const [status, setStatus] = useState<"correct" | "wrong" | "none" | "completed">(
    "none"
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions || [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!challenge) return;

    if (status === "completed") {
      router.push("/learn");
      return;
    }

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      setUserAnswer("");
      setShowExplanation(false);
      return;
    }

    if (status === "correct") {
      setStatus("none");
      setSelectedOption(undefined);
      setUserAnswer("");
      setShowExplanation(false);

      if (activeIndex === challenges.length - 1) {
        setStatus("completed");
      } else {
        onNext();
      }
      return;
    }

    if (challenge.type === "SELECT") {
      if (!selectedOption) return;

      const correctOption = options.find((option) => option.correct);

      if (correctOption && correctOption.id === selectedOption) {
        startTransition(() => {
          upsertChallengeProgress(challenge.id, challenge.xpReward)
            .then((response) => {
              if (response?.error === "hearts") {
                toast.error("No hearts left!");
                return;
              }

              setStatus("correct");
              setPercentage((prev) => prev + 100 / challenges.length);
            })
            .catch(() => toast.error("Something went wrong"));
        });
      } else {
        startTransition(() => {
          reduceHearts(challenge.id)
            .then((response) => {
              if (response?.error === "hearts") {
                toast.error("No hearts left!");
                return;
              }

              setStatus("wrong");
              if (hearts > 0) {
                setHearts((prev) => Math.max(prev - 1, 0));
              }
            })
            .catch(() => toast.error("Something went wrong"));
        });
      }
    } else if (challenge.type === "FREE_TEXT") {
      startTransition(() => {
        upsertChallengeProgress(challenge.id, challenge.xpReward, userAnswer)
          .then((response) => {
            if (response?.error === "hearts") {
              toast.error("No hearts left!");
              return;
            }

            setStatus("correct");
            setShowExplanation(true);
            setPercentage((prev) => prev + 100 / challenges.length);
          })
          .catch(() => toast.error("Something went wrong"));
      });
    }
  };

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>No challenges found</p>
      </div>
    );
  }

  const title =
    challenge.type === "SELECT"
      ? "Select the correct answer"
      : challenge.type === "FREE_TEXT"
      ? "Write your answer"
      : challenge.question;

  return (
    <>
      {status === "completed" && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
      )}

      <Header
        hearts={hearts}
        percentage={percentage}
        lessonTitle={lessonTitle}
      />

      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>

            <div>
              {challenge.type === "SELECT" && (
                <>
                  <QuestionBubble
                    question={challenge.question}
                    content={challenge.content}
                    sourceRepo={challenge.sourceRepo}
                  />
                  <Challenge
                    options={options}
                    onSelect={onSelect}
                    status={status}
                    selectedOption={selectedOption}
                    disabled={pending}
                    type={challenge.type}
                  />
                </>
              )}

              {challenge.type === "FREE_TEXT" && (
                <>
                  <QuestionBubble
                    question={challenge.question}
                    content={challenge.content}
                    sourceRepo={challenge.sourceRepo}
                  />
                  <div className="mt-6">
                    <textarea
                      className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      placeholder="Write your answer here..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={pending || status !== "none"}
                    />
                  </div>
                </>
              )}

              {showExplanation && challenge.modelAnswer && (
                <ResultCard
                  status="correct"
                  modelAnswer={challenge.modelAnswer}
                  explanation={challenge.explanation}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={
          pending ||
          (challenge.type === "SELECT" && !selectedOption) ||
          (challenge.type === "FREE_TEXT" && !userAnswer.trim())
        }
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
