import { useMemo, useState } from "react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  ConceptCard,
  CopyBlock,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
  PracticePanel,
  Warning,
} from "@/components/module-ui";
import lovableInterface from "@/assets/lovable-interface-annotated.png.asset.json";
import lovableDashboard from "@/assets/lovable-dashboard-annotated.png.asset.json";

const m = moduleByNumber(6)!;




const pipeline = [
  "문제 정의",
  "PRD와 첫 프롬프트",
  "프로토타입 확인",
  "기능별 수정",
  "테스트와 디버깅",
  "배포와 공유",
];

const tips = [
  "첫 요청에 대상, 문제, 입력, 출력, 핵심 기능을 쓴다.",
  "한 번에 한 기능씩 추가한다.",
  "이미 잘 되는 부분은 `변경하지 말 것`이라고 적는다.",
  "실제 버튼 문구와 예시 데이터를 준다.",
  "오류가 나면 화면 캡처와 재현 순서를 함께 준다.",
  "큰 수정 전에는 현재 버전을 확인한다.",
  "디자인 수정과 기능 수정을 분리한다.",
  "구현 후에는 반드시 사용자 흐름을 직접 테스트한다.",
];

const checklist = [
  { key: "audience", label: "대상" },
  { key: "context", label: "수업 맥락" },
  { key: "problem", label: "해결할 문제" },
  { key: "input", label: "입력" },
  { key: "process", label: "처리" },
  { key: "output", label: "출력" },
  { key: "constraint", label: "제한 조건" },
];

export default function Mod06() {
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);
  const filledCount = Object.values(filled).filter(Boolean).length;
  const readiness = Math.round((filledCount / checklist.length) * 100);

  const promptText = useMemo(() => {
    const lines: string[] = ["나쁜 프롬프트: 형성평가 앱 만들어줘.", "", "수정된 프롬프트:"];
    if (filled.audience) lines.push("- 대상: 중학교 1학년 과학 교사");
    if (filled.context) lines.push("- 수업 맥락: 산과 염기 단원 형성평가 직후");
    if (filled.problem) lines.push("- 문제: 학생 개별 피드백 작성 시간이 부족");
    if (filled.input) lines.push("- 입력: 정답률, 주요 오답 유형, 학생 수준");
    if (filled.process) lines.push("- 처리: 규칙 기반 피드백 문장 조합");
    if (filled.output) lines.push("- 출력: 격려·잘한 점·개선할 점 3문장 피드백");
    if (filled.constraint) lines.push("- 제한: 학생 실명 입력 금지, 모바일 친화");
    return lines.join("\n");
  }, [filled]);

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "러버블의 기본 제작 흐름을 설명할 수 있다.",
          "프롬프트 수정과 시각적 수정의 차이를 이해할 수 있다.",
          "버전 기록, 프로젝트 지식, 미리보기, 테스트를 활용할 수 있다.",
        ]}
      />

      <KeyMessage>
        모든 메뉴를 외우지 마세요. 흐름을 외우면 메뉴는 따라옵니다.
      </KeyMessage>

      <Section title="기능 영역 한눈에">
        <Warning>인터페이스 명칭과 위치는 시간에 따라 바뀔 수 있습니다. 흐름과 역할만 익혀 두세요.</Warning>
        <div className="mt-4 space-y-8">
          <figure>
            <button
              type="button"
              onClick={() => setZoomed({ src: lovableDashboard.url, alt: "러버블 대시보드 주요 기능 안내" })}
              className="block w-full group cursor-zoom-in"
              aria-label="러버블 대시보드 이미지 확대 보기"
            >
              <img
                src={lovableDashboard.url}
                alt="러버블 대시보드 주요 기능 안내"
                className="w-full h-auto rounded-lg border border-hairline transition-opacity group-hover:opacity-90"
              />
            </button>
            <figcaption className="text-xs text-muted-text mt-2 text-center">
              러버블 대시보드 — 새 프로젝트를 만들고 기존 작업으로 돌아오는 시작 화면 (클릭하면 확대됩니다)
            </figcaption>
          </figure>
          <figure>
            <button
              type="button"
              onClick={() => setZoomed({ src: lovableInterface.url, alt: "러버블 작업 인터페이스 안내" })}
              className="block w-full group cursor-zoom-in"
              aria-label="러버블 작업 인터페이스 이미지 확대 보기"
            >
              <img
                src={lovableInterface.url}
                alt="러버블 작업 인터페이스 안내"
                className="w-full h-auto rounded-lg border border-hairline transition-opacity group-hover:opacity-90"
              />
            </button>
            <figcaption className="text-xs text-muted-text mt-2 text-center">
              러버블 작업 인터페이스 — 대화로 앱을 만들고, 결과를 즉시 미리보기 (클릭하면 확대됩니다)
            </figcaption>
          </figure>
        </div>
      </Section>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.alt}
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomed(null); }}
            aria-label="닫기"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
          >
            ✕
          </button>
          <img
            src={zoomed.src}
            alt={zoomed.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-default"
          />
        </div>
      )}



      <Section title="6단계 제작 파이프라인">
        <ol className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipeline.map((s, i) => (
            <li key={s} className="bg-surface-soft rounded-lg p-4 text-center">
              <div className="serif text-3xl text-coral leading-none mb-2">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-sm text-body-strong">{s}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="초보자를 위한 8가지 사용 팁">
        <ol className="space-y-2">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-3 p-3 bg-canvas border border-hairline rounded-md">
              <span className="shrink-0 w-7 h-7 rounded-full bg-ink text-canvas text-xs font-medium inline-flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-body-strong leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="프롬프트 비교">
        <div className="grid md:grid-cols-2 gap-4">
          <ConceptCard title="❌ 나쁜 예" tone="soft">
            <p className="font-mono text-sm">형성평가 앱 만들어줘.</p>
          </ConceptCard>
          <ConceptCard title="✓ 좋은 예">
            <p className="text-sm leading-relaxed">
              중학교 1학년 과학 교사가 산과 염기 단원 형성평가 후 학생 개별
              피드백을 작성하는 웹앱을 만들어줘. 교사는 정답률, 주요 오답 유형,
              학생 수준을 입력한다. 앱은 격려 1문장, 잘한 점 1문장, 개선할 점
              1문장으로 총 3문장 피드백을 출력한다. 학생 실명은 입력하지 않는다.
            </p>
          </ConceptCard>
        </div>
      </Section>

      <PracticePanel title="직접 해보기 — 프롬프트 준비도 측정">
        <p className="text-sm text-body mb-4">
          필요한 요소를 체크하면 좋은 프롬프트로 즉시 변환됩니다. (실제 AI를
          호출하지 않습니다 — 규칙 기반 데모입니다.)
        </p>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {checklist.map((c) => (
            <label key={c.key} className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-card cursor-pointer">
              <input
                type="checkbox"
                checked={!!filled[c.key]}
                onChange={(e) => setFilled({ ...filled, [c.key]: e.target.checked })}
                className="accent-coral"
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 bg-hairline rounded-full overflow-hidden">
            <div className="h-full bg-coral transition-all" style={{ width: `${readiness}%` }} />
          </div>
          <span className="serif text-xl text-coral">{readiness}%</span>
        </div>
        <CopyBlock label="프롬프트 미리보기" text={promptText} />
      </PracticePanel>

      <InstructorTip>
        “디자인 수정과 기능 수정을 분리한다”와 “큰 수정 전 버전 확인”은 실습 중
        실제 문제 상황과 함께 짚어 주세요.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod06:check"
        items={[
          "러버블 6단계 파이프라인을 순서대로 말할 수 있다.",
          "좋은 프롬프트의 7가지 요소를 들 수 있다.",
          "버전 기록과 시각적 수정이 언제 유용한지 안다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}
