import { useMemo, useState } from "react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  CopyBlock,
  ConceptCard,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
  PracticePanel,
  Warning,
} from "@/components/module-ui";

const m = moduleByNumber(10)!;

const SECURE_PROMPT = `현재 앱에 생성형 AI 피드백 기능을 추가해줘.

중요한 보안 조건:
- API 키를 프론트엔드 코드, 브라우저, localStorage에 노출하지 마.
- 비밀 키는 Lovable Cloud secret 또는 Supabase secret에 저장하고 서버 함수/Edge Function에서만 사용해.
- 사용자 입력을 서버 함수가 받아 생성형 AI API를 호출한 뒤 결과만 프론트엔드로 반환해.

AI의 역할:
- 교사가 입력한 교과, 학년, 학습 주제, 학생 답변, 도달 수준을 분석한다.
- 결과는 반드시 JSON 형식으로 반환한다.
- 필드는 encouragement, strength, improvement, nextAction 네 개다.
- 학생을 단정하거나 진단하지 않는다.
- 관찰 가능한 내용과 다음 학습 행동을 중심으로 쓴다.
- 입력 내용에 개인정보가 포함된 것으로 보이면 생성을 중단하고 경고를 반환한다.

앱 동작:
- 생성 중 로딩 상태를 보여준다.
- 실패하면 이해하기 쉬운 한국어 오류 메시지와 다시 시도 버튼을 보여준다.
- 빈 응답이나 형식 오류를 처리한다.
- 결과를 화면에 표시하기 전에 JSON 구조를 검증한다.
- 기존 UI와 모의 응답 기능은 삭제하지 말고, API 실패 시 대체 흐름으로 사용한다.

먼저 구현 계획과 필요한 secret 이름을 설명한 뒤 구현하고, 마지막에 정상 흐름과 실패 흐름을 테스트해줘.`;

export default function Mod10() {
  // mini designer
  const [inputType, setInputType] = useState("");
  const [task, setTask] = useState("");
  const [format, setFormat] = useState("");
  const [forbidden, setForbidden] = useState("");
  const [onFail, setOnFail] = useState("");

  const generated = useMemo(() => {
    if (!inputType && !task) return "";
    return `다음 AI 기능을 현재 앱에 추가해줘. 비밀 키는 서버 secret에만 두고 서버 함수에서 호출해.

[입력]
${inputType || "(정의 필요)"}

[AI에게 시키는 일]
${task || "(정의 필요)"}

[출력 형식]
${format || "(정의 필요)"}

[금지 사항]
${forbidden || "학생 개인정보·민감 정보 포함 금지"}

[실패 시 동작]
${onFail || "이해하기 쉬운 한국어 오류와 다시 시도 버튼"}

먼저 흐름을 설명한 뒤 구현하고, 정상/실패 흐름을 모두 테스트해줘.`;
  }, [inputType, task, format, forbidden, onFail]);

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "생성형 API의 역할을 설명할 수 있다.",
          "API 키를 안전하게 보관해야 하는 이유를 이해할 수 있다.",
          "AI 기능을 입력·지시·출력 형식으로 설계할 수 있다.",
          "AI가 실패했을 때의 대체 흐름을 생각할 수 있다.",
        ]}
      />

      <KeyMessage>
        API는 두 프로그램 사이에서 요청과 응답을 전달하는 통역사이자 연결
        통로입니다.
      </KeyMessage>

      <Section title="5단계 흐름">
        <ol className="grid sm:grid-cols-5 gap-2">
          {[
            "사용자 입력",
            "앱 → 서버 함수 요청",
            "서버 함수 → 비밀 키로 AI 호출",
            "AI 정해진 형식으로 응답",
            "결과 표시 + 교사 검토",
          ].map((s, i) => (
            <li key={s} className="bg-surface-soft rounded-lg p-3 text-center">
              <div className="serif text-xl text-coral mb-1">{i + 1}</div>
              <p className="text-xs text-body-strong leading-snug">{s}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="흔히 쓰는 모델 제공자">
        <Warning>모델·정책·요금은 변경될 수 있습니다. 항상 공식 문서에서 최신 정보를 확인하세요.</Warning>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {[
            ["Google Gemini", "텍스트·멀티모달 처리, 학습 도구에 활용"],
            ["OpenAI", "범용 텍스트·코드·이미지 모델 다수"],
            ["Anthropic Claude", "장문 텍스트·안전한 응답 설계에 강점"],
          ].map(([n, d]) => (
            <ConceptCard key={n} title={n}>
              <p className="mb-2">{d}</p>
              <p className="text-xs text-muted-text">공식 문서 확인 필요 · 모델과 정책은 변경될 수 있음</p>
            </ConceptCard>
          ))}
        </div>
        <p className="text-sm text-body mt-4">
          오늘은 <strong>Google Gemini</strong>를 기본 예시로 사용하지만, 구조는 어떤
          제공자와도 동일합니다.
        </p>
      </Section>

      <Section title="안전한 구현 프롬프트">
        <CopyBlock label="보안·구현 프롬프트" text={SECURE_PROMPT} />
      </Section>

      <Section title="좋은 AI 기능 설계 6요소">
        <ul className="grid sm:grid-cols-2 gap-3">
          {[
            "입력이 분명한가?",
            "AI의 역할이 한정되어 있는가?",
            "출력 형식이 고정되어 있는가?",
            "개인정보를 막는가?",
            "실패 시 대체 흐름이 있는가?",
            "최종 검토자가 교사인가?",
          ].map((t, i) => (
            <li key={t} className="bg-surface-card rounded-lg p-4">
              <span className="serif text-2xl text-coral mr-2">{i + 1}</span>
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <PracticePanel title="직접 해보기 — 미니 AI 기능 설계">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="입력 유형 (예: 학생의 짧은 답변)" value={inputType} onChange={setInputType} />
          <Field label="AI에게 시키는 일 (예: 4영역 피드백 생성)" value={task} onChange={setTask} />
          <Field label="출력 형식 (예: JSON {encouragement, strength, improvement, nextAction})" value={format} onChange={setFormat} />
          <Field label="금지 사항 (예: 학생 실명·진단 표현 금지)" value={forbidden} onChange={setForbidden} />
        </div>
        <Field label="실패 시 동작 (예: 모의 응답으로 대체 + 다시 시도)" value={onFail} onChange={setOnFail} />

        {generated && (
          <div className="mt-4">
            <CopyBlock label="생성된 프롬프트" text={generated} />
          </div>
        )}
      </PracticePanel>

      <InstructorTip>
        “비밀 키는 어디 두나요?”라는 질문에 “브라우저는 절대 아닙니다”로 답하는
        것을 반복합니다.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod10:check"
        items={[
          "5단계 AI 호출 흐름을 그릴 수 있다.",
          "API 키를 브라우저에 두지 않는 이유를 설명할 수 있다.",
          "AI 기능 설계 6요소를 적용해 미니 기능을 한 개 설계했다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block mb-2">
      <span className="block text-xs font-medium text-ink mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas focus:border-coral outline-none text-sm"
      />
    </label>
  );
}
