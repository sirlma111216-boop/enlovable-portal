import { useState } from "react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  ConceptCard,
  PracticePanel,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
} from "@/components/module-ui";
import { Check, X, RotateCw } from "lucide-react";

const m = moduleByNumber(1)!;

type Item = { text: string; answer: "teacher" | "ai" };
const items: Item[] = [
  { text: "수업 문제를 정의한다.", answer: "teacher" },
  { text: "초안 코드를 생성한다.", answer: "ai" },
  { text: "교육적 타당성을 판단한다.", answer: "teacher" },
  { text: "화면 구성을 제안한다.", answer: "ai" },
  { text: "학생에게 안전한지 확인한다.", answer: "teacher" },
  { text: "오류 수정안을 제안한다.", answer: "ai" },
];

export default function Mod01() {
  const [picks, setPicks] = useState<Record<number, "teacher" | "ai" | null>>({});
  const pick = (i: number, v: "teacher" | "ai") =>
    setPicks((p) => ({ ...p, [i]: v }));
  const reset = () => setPicks({});
  const correctCount = items.reduce(
    (n, it, i) => (picks[i] === it.answer ? n + 1 : n),
    0,
  );
  const answered = Object.values(picks).filter(Boolean).length;

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "바이브코딩을 한 문장으로 설명할 수 있다.",
          "기존 코딩과 바이브코딩의 차이를 구분할 수 있다.",
          "바이브코딩에서 교사와 AI의 역할을 구분할 수 있다.",
        ]}
      />

      <KeyMessage>코드를 작성하는 시대에서, 문제를 설명하는 시대로.</KeyMessage>

      <Section title="세 단계로 보는 바이브코딩">
        <ol className="grid md:grid-cols-3 gap-4">
          {[
            "교사가 문제와 의도를 설명한다.",
            "AI가 화면과 기능, 코드를 제안한다.",
            "교사가 실행·검증·수정 방향을 결정한다.",
          ].map((s, i) => (
            <li key={i} className="bg-surface-card rounded-lg p-6">
              <div className="serif text-5xl text-coral mb-3">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-body-strong leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="타이핑 시대 vs 디렉팅 시대">
        <div className="grid md:grid-cols-2 gap-4">
          <ConceptCard title="타이핑 시대" tone="soft">
            <ul className="space-y-2 list-disc list-inside text-body">
              <li>문법을 외운다.</li>
              <li>코드를 직접 작성한다.</li>
              <li>오류를 코드에서 찾는다.</li>
            </ul>
          </ConceptCard>
          <ConceptCard title="디렉팅 시대" tone="dark">
            <ul className="space-y-2 list-disc list-inside text-on-dark">
              <li>상황과 목적을 설명한다.</li>
              <li>AI가 구현안을 만든다.</li>
              <li>사람은 결과를 검토하고 지시한다.</li>
            </ul>
          </ConceptCard>
        </div>
      </Section>

      <Section title="교실로 옮겨 보면">
        <div className="bg-coral/5 border-l-4 border-coral rounded-r-lg p-6 text-body-strong leading-relaxed">
          바이브코딩은 학생에게 “알아서 해”라고 말하는 것이 아니라, 학습
          목표·조건·결과물 기준을 분명히 제시하고 중간 피드백을 주는 과정과
          비슷합니다.
        </div>
      </Section>

      <PracticePanel>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="serif text-xl">교사의 역할 vs AI의 역할</h3>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-ink"
          >
            <RotateCw className="w-3.5 h-3.5" /> 다시
          </button>
        </div>
        <p className="text-sm text-body mb-4">
          아래 여섯 문장을 보고 누가 해야 하는 일인지 골라 보세요.
        </p>
        <ul className="space-y-3">
          {items.map((it, i) => {
            const chosen = picks[i];
            const correct = chosen && chosen === it.answer;
            return (
              <li
                key={i}
                className="flex flex-wrap items-center gap-3 p-3 rounded-md bg-canvas border border-hairline"
              >
                <span className="flex-1 min-w-[200px] text-body-strong">
                  {it.text}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => pick(i, "teacher")}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      chosen === "teacher"
                        ? "bg-coral text-white border-coral"
                        : "border-hairline hover:bg-surface-card"
                    }`}
                  >
                    교사
                  </button>
                  <button
                    onClick={() => pick(i, "ai")}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                      chosen === "ai"
                        ? "bg-ink text-white border-ink"
                        : "border-hairline hover:bg-surface-card"
                    }`}
                  >
                    AI
                  </button>
                </div>
                {chosen && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      correct ? "text-success" : "text-error"
                    }`}
                  >
                    {correct ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> 정답
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" /> {it.answer === "teacher" ? "교사의 역할" : "AI의 역할"}
                      </>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {answered > 0 && (
          <p className="mt-4 text-sm text-body">
            {answered} / {items.length} 응답 · 정답 {correctCount}개
          </p>
        )}
      </PracticePanel>

      <InstructorTip>
        <ul className="list-disc list-inside space-y-2">
          <li>교사 다수가 “코드를 짜야 한다”는 부담을 안고 입장합니다. 첫 문장으로 그 부담을 내려놓게 합니다.</li>
          <li>역할 분류 활동에서 정답보다 “왜 그렇게 생각했는가”를 더 길게 이야기하게 합니다.</li>
          <li>다음 모듈로 넘어가기 전 “교사는 교육 문제 해결자다”를 반복 강조합니다.</li>
        </ul>
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod01:check"
        items={[
          "바이브코딩을 한 문장으로 말할 수 있다.",
          "타이핑 시대와 디렉팅 시대의 차이를 설명할 수 있다.",
          "교사와 AI 각각의 역할 예시를 두 개 이상 들 수 있다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}
