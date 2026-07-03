import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
} from "@/components/module-ui";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DesignPrepSection } from "./11-design-prep";
import { DeploySection } from "./11-deploy";

const m = moduleByNumber(11)!;


const stages = [
  { name: "문제 정의", time: "15분", desc: "내일 수업에서도 다시 생길 가능성이 높은 병목 하나를 정한다." },
  { name: "최소 기능과 PRD", time: "15분", desc: "핵심 기능 3개, 하지 않을 일, 입출력 흐름을 한 줄로 정한다." },
  { name: "러버블 제작", time: "30분", desc: "PRD 기반 첫 프롬프트로 화면·기능을 만든다." },
  { name: "테스트와 개선", time: "15분", desc: "정상·빈 입력·긴 입력·모바일·잘못된 입력·API 실패를 점검한다." },
  { name: "공유 준비", time: "15분", desc: "세 문장 요약을 완성하고 공유 링크를 만든다." },
];

const missions = [
  ["수업 운영 도구", "역할 배정, 토론 질문, 조별 활동 관리"],
  ["평가 지원 도구", "루브릭 기반 피드백, 서술형 코멘트, 오답 분석"],
  ["탐구·질문 생성 도구", "수준별 탐구 질문, 프로젝트 주제"],
  ["학생 자기성찰 지원", "수업 리플렉션, 자기평가 도우미"],
];

const rubricAreas = [
  ["교육 문제 정의", "실제 수업의 문제인가?"],
  ["수업·평가 연결성", "교육적 타당성이 있는가?"],
  ["AI 활용 적절성", "이 일에 왜 AI가 필요한가?"],
  ["실현 가능성", "내일 수업에 정말 쓸 수 있는가?"],
  ["최소 기능 구현", "핵심 흐름이 실제로 작동하는가?"],
];

const rubricScale = [
  "1 — 아직 부족",
  "2 — 일부 충족",
  "3 — 기대 수준",
  "4 — 우수",
];

export default function Mod11() {
  const [rubric, setRubric] = useLocalStorage<number[]>("vibecoding:mod11:rubric", rubricAreas.map(() => 0));

  return (
    <article className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "실제 수업 문제를 한 문장으로 정의할 수 있다.",
          "핵심 기능 3개 이하의 MVP를 정할 수 있다.",
          "러버블에서 프로토타입을 제작하고 테스트할 수 있다.",
          "도구가 학생 경험을 어떻게 바꿀지 설명할 수 있다.",
        ]}
      />

      <KeyMessage>좋은 앱보다 좋은 수업 문제 정의가 먼저입니다.</KeyMessage>

      <Section title="네 가지 미션 유형">
        <div className="grid sm:grid-cols-2 gap-3">
          {missions.map(([t, d], i) => (
            <div key={t} className="bg-surface-card rounded-lg p-5">
              <span className="serif text-3xl text-coral leading-none">{i + 1}</span>
              <p className="font-semibold text-ink mt-2">{t}</p>
              <p className="text-sm text-body mt-1">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <DesignPrepSection />

      <Section title="90분 프로젝트 보드">
        <ol className="space-y-2">
          {stages.map((s, i) => (
            <li key={s.name} className="flex items-start gap-3 p-4 bg-surface-soft rounded-md">
              <span className="serif text-2xl text-coral leading-none w-12 shrink-0">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className="font-semibold text-ink">{s.name}</p>
                  <span className="text-xs text-muted-text">{s.time}</span>
                </div>
                <p className="text-sm text-body mt-1">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="자기 점검 루브릭">
        <ul className="space-y-2">
          {rubricAreas.map(([area, hint], i) => (
            <li key={area} className="flex flex-wrap items-center gap-3 p-3 bg-canvas border border-hairline rounded-md">
              <div className="flex-1 min-w-[180px]">
                <p className="font-semibold text-ink">{area}</p>
                <p className="text-xs text-muted-text">{hint}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRubric(rubric.map((v, idx) => (idx === i ? n : v)))}
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      rubric[i] === n ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-card"
                    }`}
                    title={rubricScale[n - 1]}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-text mt-2">
          척도: 1 부족 · 2 일부 충족 · 3 기대 수준 · 4 우수
        </p>
      </Section>

      <Section title="강사용 핵심 질문">
        <ul className="bg-ink text-canvas rounded-lg p-6 space-y-2 list-disc list-inside leading-relaxed">
          <li>그 기능이 왜 필요한가요?</li>
          <li>이 앱은 수업의 어떤 문제를 해결하나요?</li>
          <li>교사 입장에서 실제로 쓰게 될까요?</li>
          <li>학생 경험이 어떻게 달라지나요?</li>
        </ul>
      </Section>

      <DeploySection />


      <InstructorTip>
        “세 문장 요약”을 발표하게 하세요. 발표가 안 되는 프로젝트는 아직 문제 정의가
        부족합니다.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod11:check"
        items={[
          "프로젝트 문제·사용자·핵심 기능 3개를 정했다.",
          "테스트 결과를 한 줄로 기록했다.",
          "세 문장 요약을 완성했다.",
          "Markdown 또는 프롬프트로 결과물을 내보냈다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}

