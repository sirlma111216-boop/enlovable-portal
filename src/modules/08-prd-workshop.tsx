import { useMemo, useState, useEffect } from "react";
import { Download, Copy, CheckCheck, RotateCcw, Printer, ArrowLeft, ArrowRight, Sparkles, Check, AlertCircle, Loader2, Plus, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  KeyMessage,
  ModuleNavigation,
} from "@/components/module-ui";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { upgradePrd } from "@/lib/prd.functions";

const m = moduleByNumber(8)!;

// ===== Types =====
type Module2Context = {
  repeatTime: string;
  studentStuck: string;
  toolGap: string;
};

type TeacherPrd = {
  projectName: string;
  oneLineDescription: string;
  schoolLevel: string;
  grade: string;
  subject: string;
  learningTopic: string;
  problem: string;
  desiredChange: string;
  primaryUser: string;
  mainTask: string;
  coreFeatures: string[];
  userFlow: string[];
  screens: string[];
  expectedOutput: string;
  designPreference: string;
  needsAI: "" | "yes" | "no" | "unsure";
  aiTask: string;
  storageMethod: "" | "none" | "device" | "database" | "unsure";
  cautions: string[];
};

type Store = {
  module2Imported: Module2Context;
  teacherPrd: TeacherPrd;
  upgradedPrd: string;
  step: number;
  lastSavedAt: string;
};

const emptyPrd: TeacherPrd = {
  projectName: "",
  oneLineDescription: "",
  schoolLevel: "",
  grade: "",
  subject: "",
  learningTopic: "",
  problem: "",
  desiredChange: "",
  primaryUser: "",
  mainTask: "",
  coreFeatures: ["", "", ""],
  userFlow: [""],
  screens: [],
  expectedOutput: "",
  designPreference: "",
  needsAI: "",
  aiTask: "",
  storageMethod: "",
  cautions: [
    "학생 실명과 민감한 개인정보를 입력하지 않는다.",
    "AI 결과는 교사가 최종 검토한다.",
    "모바일에서도 사용할 수 있어야 한다.",
  ],
};

const initialStore: Store = {
  module2Imported: { repeatTime: "", studentStuck: "", toolGap: "" },
  teacherPrd: emptyPrd,
  upgradedPrd: "",
  step: 1,
  lastSavedAt: "",
};

const STEPS = [
  { n: 1, label: "모듈 2 반영" },
  { n: 2, label: "PRD 작성" },
  { n: 3, label: "한 화면에 보기" },
  { n: 4, label: "AI 업그레이드" },
];

export default function Mod08() {
  const [store, setStore] = useLocalStorage<Store>("vibecoding:mod08:prd-v2", initialStore);
  const [mod02] = useLocalStorage<Module2Context>("vibecoding:mod02:bottleneck", {
    repeatTime: "", studentStuck: "", toolGap: "",
  });

  const setStep = (n: number) => setStore({ ...store, step: n });
  const setPrd = (patch: Partial<TeacherPrd>) =>
    setStore({ ...store, teacherPrd: { ...store.teacherPrd, ...patch }, lastSavedAt: new Date().toISOString() });

  const importModule2 = () => {
    const p = store.teacherPrd;
    setStore({
      ...store,
      module2Imported: { ...mod02 },
      teacherPrd: {
        ...p,
        problem: p.problem || mod02.repeatTime || mod02.studentStuck,
        desiredChange: p.desiredChange || (mod02.toolGap ? `${mod02.toolGap}을(를) 보완하고 싶다.` : ""),
      },
      lastSavedAt: new Date().toISOString(),
    });
  };

  const hasMod02 = !!(mod02.repeatTime || mod02.studentStuck || mod02.toolGap);

  const resetAll = () => {
    if (confirm("작성한 모든 PRD 내용을 초기화합니다. 계속할까요?")) {
      setStore(initialStore);
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <KeyMessage>
        질문에 답하며 내 수업의 아이디어를 Lovable이 이해하는 PRD로 만들어 봅니다.
      </KeyMessage>

      <Section title="PRD란?">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            ["P", "Product / 제품"],
            ["R", "Requirements / 요구사항"],
            ["D", "Document / 문서"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface-card rounded-lg p-6 text-center">
              <div className="serif text-6xl text-coral leading-none mb-2">{k}</div>
              <p className="text-sm text-body-strong">{v}</p>
            </div>
          ))}
        </div>
      </Section>

      <Stepper current={store.step} onJump={setStep} />

      <div className="mt-8">
        {store.step === 1 && (
          <Step1
            hasMod02={hasMod02}
            mod02={mod02}
            imported={store.module2Imported}
            prd={store.teacherPrd}
            onImport={importModule2}
            onEdit={setPrd}
            onManualEdit={(patch) =>
              setStore({ ...store, module2Imported: { ...store.module2Imported, ...patch } })
            }
            onNext={() => setStep(2)}
          />
        )}

        {store.step === 2 && (
          <Step2
            prd={store.teacherPrd}
            onEdit={setPrd}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            onReset={resetAll}
          />
        )}
        {store.step === 3 && (
          <Step3
            prd={store.teacherPrd}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {store.step === 4 && (
          <Step4
            store={store}
            onBack={() => setStep(3)}
            onSaveUpgraded={(md) => setStore({ ...store, upgradedPrd: md })}
          />
        )}
      </div>

      <ModuleNavigation module={m} />
    </article>
  );
}

// ===== Stepper =====
function Stepper({ current, onJump }: { current: number; onJump: (n: number) => void }) {
  return (
    <nav aria-label="진행 단계" className="mt-4">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const isCurrent = s.n === current;
          const isDone = s.n < current;
          return (
            <li key={s.n} className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => onJump(s.n)}
                aria-current={isCurrent ? "step" : undefined}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-pill text-xs sm:text-sm font-medium border transition-colors ${
                  isCurrent
                    ? "bg-coral text-white border-coral"
                    : isDone
                      ? "bg-coral/10 text-coral border-coral/30"
                      : "bg-surface-card text-body border-hairline hover:bg-surface-cream-strong"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                  isCurrent ? "bg-white/20" : isDone ? "bg-coral text-white" : "bg-ink/10"
                }`}>
                  {isDone ? <Check className="w-3 h-3" /> : s.n}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <span className="text-muted-soft">→</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ===== Step 1 =====
function Step1({
  hasMod02, mod02, imported, prd, onImport, onEdit, onManualEdit, onNext,
}: {
  hasMod02: boolean;
  mod02: Module2Context;
  imported: Module2Context;
  prd: TeacherPrd;
  onImport: () => void;
  onEdit: (p: Partial<TeacherPrd>) => void;
  onManualEdit: (p: Partial<Module2Context>) => void;
  onNext: () => void;
}) {

  const wasImported = !!(imported.repeatTime || imported.studentStuck || imported.toolGap);
  const [manualMode, setManualMode] = useState(false);
  const showEmpty = !hasMod02 && !wasImported && !manualMode;

  return (
    <StepShell
      title="모듈 2에서 정리한 수업 문제 가져오기"
      description="앞에서 작성한 수업의 병목과 앱 아이디어를 PRD의 출발점으로 활용합니다."
    >
      {showEmpty ? (
        <div className="bg-surface-card rounded-lg p-6 mb-6">
          <p className="text-sm text-body mb-4">
            저장된 모듈 2 내용이 없습니다. 모듈 2를 먼저 작성하거나, 이 단계에서 직접 입력할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/modules/$slug"
              params={{ slug: "02-why-teachers-need-it" }}
              className="text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
            >
              모듈 2로 이동
            </Link>
            <button onClick={() => setManualMode(true)} className="text-sm px-4 py-2 rounded-md border border-hairline hover:bg-surface-card">
              직접 작성하기
            </button>
          </div>
        </div>
      ) : (
        <>
          {hasMod02 && (
            <button
              onClick={onImport}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90 mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" /> 모듈 2 내용 불러오기
            </button>
          )}

          {wasImported && (
            <div className="bg-surface-cream-strong border border-coral/20 rounded-lg p-5 mb-6">
              <h3 className="serif text-lg mb-1">모듈 2에서 가져온 핵심 내용</h3>
              <p className="text-xs text-muted-text mb-4">
                가져온 내용은 PRD 작성을 돕는 시작 자료입니다. 이후 단계에서 자유롭게 수정할 수 있습니다.
              </p>
              <dl className="space-y-3 text-sm">
                <ImportedRow label="수업의 문제 (반복 업무)" value={imported.repeatTime} />
                <ImportedRow label="학생들이 막히는 지점" value={imported.studentStuck} />
                <ImportedRow label="기존 도구의 한계" value={imported.toolGap} />
              </dl>
            </div>
          )}

          {manualMode && !wasImported && (
            <div className="bg-surface-cream-strong border border-coral/20 rounded-lg p-5 mb-6 space-y-3">
              <h3 className="serif text-lg">수업 문제 직접 입력하기</h3>
              <p className="text-xs text-muted-text">
                모듈 2에서 다룬 세 가지 질문에 답해 보세요. 아래 PRD 작성에도 반영됩니다.
              </p>
              <Field
                label="수업에서 반복되는 업무나 부담"
                value={imported.repeatTime}
                onChange={(v) => onManualEdit({ repeatTime: v })}
                rows={2}
                hint="예: 매주 형성평가 답변에 개별 피드백을 남기는 데 오랜 시간이 걸린다."
              />
              <Field
                label="학생들이 자주 막히는 지점"
                value={imported.studentStuck}
                onChange={(v) => onManualEdit({ studentStuck: v })}
                rows={2}
                hint="예: 답을 왜 그렇게 썼는지 스스로 설명하지 못한다."
              />
              <Field
                label="기존 도구(학습지, LMS 등)의 한계"
                value={imported.toolGap}
                onChange={(v) => onManualEdit({ toolGap: v })}
                rows={2}
                hint="예: 정오만 알려주고, 다음에 무엇을 학습해야 하는지 안내가 없다."
              />
            </div>
          )}

          <div className="space-y-3">
            <Field
              label="해결하려는 문제"
              value={prd.problem}
              onChange={(v) => onEdit({ problem: v })}
              rows={2}
              hint="위 내용을 바탕으로 자신의 언어로 다듬어 보세요."
            />
            <Field
              label="기대하는 수업의 변화"
              value={prd.desiredChange}
              onChange={(v) => onEdit({ desiredChange: v })}
              rows={2}
              hint="예: 교사가 피드백 초안을 빠르게 확인하고 다음 학습 방향을 안내한다."
            />
          </div>
        </>
      )}

      <StepNav onNext={onNext} nextLabel="다음: PRD 작성" />
    </StepShell>
  );
}


function ImportedRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-text mb-0.5">{label}</dt>
      <dd className="text-body-strong">{value || <span className="text-muted-soft">(비어 있음)</span>}</dd>
    </div>
  );
}

// ===== Step 2 =====
function Step2({
  prd, onEdit, onBack, onNext, onReset,
}: {
  prd: TeacherPrd;
  onEdit: (p: Partial<TeacherPrd>) => void;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const progress = calcProgress(prd);

  return (
    <StepShell
      title="질문에 답하며 PRD 만들기"
      description="개발 용어를 몰라도 괜찮습니다. 내 수업과 만들고 싶은 도구를 설명해 주세요."
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-text mb-1">
          <span>작성 진행률</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-surface-card rounded-full overflow-hidden">
          <div className="h-full bg-coral transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* A. 기본 정보 */}
      <SubSection title="A. 앱의 기본 정보">
        <Field label="만들고 싶은 앱의 이름은 무엇인가요? *" value={prd.projectName} onChange={(v) => onEdit({ projectName: v })} hint="예: AI 형성평가 피드백 도우미" />
        <Field label="이 앱을 한 문장으로 소개해 주세요. *" value={prd.oneLineDescription} onChange={(v) => onEdit({ oneLineDescription: v })} rows={2} hint="예: 학생의 익명 답변을 입력하면 교사가 활용할 피드백 초안을 만들어 주는 앱" />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="학교급" value={prd.schoolLevel} onChange={(v) => onEdit({ schoolLevel: v })} hint="예: 중학교" />
          <Field label="학년" value={prd.grade} onChange={(v) => onEdit({ grade: v })} hint="예: 2학년" />
          <Field label="교과" value={prd.subject} onChange={(v) => onEdit({ subject: v })} hint="예: 국어" />
          <Field label="단원 또는 학습 주제" value={prd.learningTopic} onChange={(v) => onEdit({ learningTopic: v })} hint="예: 설득하는 글쓰기" />
        </div>
      </SubSection>

      {/* B. 문제 */}
      <SubSection title="B. 해결하려는 수업 문제">
        <Field label="현재 수업에서 어떤 점이 가장 불편하거나 시간이 많이 걸리나요? *" value={prd.problem} onChange={(v) => onEdit({ problem: v })} rows={3} hint="예: 서술형 형성평가 후 학생별 피드백을 작성하는 데 시간이 오래 걸린다." />
        <Field label="이 문제가 해결되면 수업이 어떻게 달라지면 좋겠나요?" value={prd.desiredChange} onChange={(v) => onEdit({ desiredChange: v })} rows={2} hint="예: 교사가 피드백 초안을 빠르게 확인하고 학생에게 다음 학습 방향을 안내한다." />
      </SubSection>

      {/* C. 사용자 */}
      <SubSection title="C. 주요 사용자">
        <RadioRow
          label="이 앱을 주로 사용하는 사람은 누구인가요? *"
          value={prd.primaryUser}
          onChange={(v) => onEdit({ primaryUser: v })}
          options={["교사", "학생", "교사와 학생", "기타"]}
        />
        <Field label="사용자가 이 앱에서 가장 먼저 하고 싶은 일은 무엇인가요?" value={prd.mainTask} onChange={(v) => onEdit({ mainTask: v })} rows={2} hint="예: 교사가 형성평가 질문과 학생 답변을 입력하고 피드백을 생성한다." />
      </SubSection>

      {/* D. 핵심 기능 */}
      <SubSection title="D. 핵심 기능 (최대 3개)">
        <p className="text-xs text-muted-text mb-3">
          첫 번째 버전에서는 있으면 좋은 기능보다 반드시 필요한 기능만 선택하세요.
        </p>
        {prd.coreFeatures.map((f, i) => (
          <Field
            key={i}
            label={`핵심 기능 ${i + 1}${i === 0 ? " *" : ""}`}
            value={f}
            onChange={(v) => {
              const arr = [...prd.coreFeatures];
              arr[i] = v;
              onEdit({ coreFeatures: arr });
            }}
            hint={i === 0 ? "예: 형성평가 질문 표시" : i === 1 ? "예: 학생 답변 입력" : "예: 피드백 생성 및 복사"}
          />
        ))}

        <div className="mt-4">
          <label className="block text-xs font-medium text-ink mb-2">앱을 사용하는 순서</label>
          <ListEditor
            items={prd.userFlow}
            onChange={(items) => onEdit({ userFlow: items })}
            placeholder="예: 학습 주제 입력"
          />
        </div>
      </SubSection>

      {/* E. 화면·결과 */}
      <SubSection title="E. 화면과 결과">
        <CheckboxGroup
          label="앱에는 어떤 화면이나 영역이 필요하나요?"
          selected={prd.screens}
          options={["시작 또는 입력 영역", "결과 영역", "안내 또는 주의사항", "기타"]}
          onChange={(arr) => onEdit({ screens: arr })}
        />
        <Field label="사용자가 마지막에 얻어야 하는 결과는 무엇인가요? *" value={prd.expectedOutput} onChange={(v) => onEdit({ expectedOutput: v })} rows={2} hint="예: 잘한 점, 보완할 점, 다음 학습 행동이 포함된 피드백" />
        <Field label="화면의 분위기나 디자인에 원하는 점이 있나요?" value={prd.designPreference} onChange={(v) => onEdit({ designPreference: v })} rows={2} hint="예: 한국어, 모바일에서 사용 가능, 단순한 화면" />
      </SubSection>

      {/* F. AI·데이터 */}
      <SubSection title="F. AI · 데이터 · 주의사항">
        <RadioRow
          label="생성형 AI 기능이 필요한가요? *"
          value={prd.needsAI}
          onChange={(v) => onEdit({ needsAI: v as TeacherPrd["needsAI"] })}
          options={[
            { value: "yes", label: "필요함" },
            { value: "no", label: "필요하지 않음" },
            { value: "unsure", label: "아직 모르겠음" },
          ]}
        />
        {prd.needsAI === "yes" && (
          <Field label="AI가 무엇을 해주면 좋을까요?" value={prd.aiTask} onChange={(v) => onEdit({ aiTask: v })} rows={2} hint="예: 학생 답변을 분석해 피드백 초안을 생성한다." />
        )}
        <RadioRow
          label="사용자의 정보를 저장해야 하나요?"
          value={prd.storageMethod}
          onChange={(v) => onEdit({ storageMethod: v as TeacherPrd["storageMethod"] })}
          options={[
            { value: "none", label: "저장하지 않음" },
            { value: "device", label: "기기에만 임시 저장" },
            { value: "database", label: "데이터베이스에 저장" },
            { value: "unsure", label: "아직 모르겠음" },
          ]}
        />
        <div className="mt-3">
          <label className="block text-xs font-medium text-ink mb-2">반드시 지켜야 할 주의사항</label>
          <ListEditor
            items={prd.cautions}
            onChange={(items) => onEdit({ cautions: items })}
            placeholder="예: 학생 실명을 입력하지 않는다."
          />
        </div>
      </SubSection>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="PRD 한 화면에 보기"
        extra={
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md text-error border border-error/30 hover:bg-error/5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 처음부터 다시 작성
          </button>
        }
      />
    </StepShell>
  );
}

// ===== Step 3 =====
function Step3({
  prd, onBack, onNext,
}: {
  prd: TeacherPrd;
  onBack: () => void;
  onNext: () => void;
}) {
  const missing = requiredMissing(prd);

  return (
    <StepShell
      title="교사가 작성한 PRD"
      description="AI가 아직 다듬지 않은 원본 PRD입니다. 인쇄하거나 다음 단계에서 AI로 업그레이드할 수 있습니다."
    >
      <div className="flex flex-wrap gap-2 mb-4 no-print">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-hairline hover:bg-surface-card">
          <ArrowLeft className="w-3.5 h-3.5" /> 내용 수정하기
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-hairline hover:bg-surface-card">
          <Printer className="w-3.5 h-3.5" /> 인쇄하기
        </button>
      </div>

      <div className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8 space-y-5">
        <h1 className="serif text-3xl">{prd.projectName || "작성되지 않음"}</h1>

        <PrdBlock title="1. 한 줄 소개" value={prd.oneLineDescription} />
        <PrdBlock title="2. 수업 맥락">
          <ul className="list-disc list-inside text-sm space-y-0.5">
            <li>학교급: {prd.schoolLevel || <em className="text-muted-soft not-italic">작성되지 않음</em>}</li>
            <li>학년: {prd.grade || <em className="text-muted-soft not-italic">작성되지 않음</em>}</li>
            <li>교과: {prd.subject || <em className="text-muted-soft not-italic">작성되지 않음</em>}</li>
            <li>단원/학습 주제: {prd.learningTopic || <em className="text-muted-soft not-italic">작성되지 않음</em>}</li>
          </ul>
        </PrdBlock>
        <PrdBlock title="3. 해결하려는 문제" value={prd.problem} />
        <PrdBlock title="4. 목표" value={prd.desiredChange} />
        <PrdBlock title="5. 주요 사용자" value={prd.primaryUser} />
        <PrdBlock title="6. 핵심 기능">
          <ol className="list-decimal list-inside text-sm space-y-0.5">
            {prd.coreFeatures.filter((f) => f.trim()).length === 0 ? (
              <li className="text-muted-soft list-none">작성되지 않음</li>
            ) : prd.coreFeatures.map((f, i) => f.trim() && <li key={i}>{f}</li>)}
          </ol>
        </PrdBlock>
        <PrdBlock title="7. 사용자 흐름">
          {prd.userFlow.filter((s) => s.trim()).length === 0 ? (
            <p className="text-sm text-muted-soft">작성되지 않음</p>
          ) : (
            <p className="text-sm">{prd.userFlow.filter((s) => s.trim()).join(" → ")}</p>
          )}
        </PrdBlock>
        <PrdBlock title="8. 화면 구성">
          {prd.screens.length === 0 ? (
            <p className="text-sm text-muted-soft">작성되지 않음</p>
          ) : (
            <p className="text-sm">{prd.screens.join(", ")}</p>
          )}
        </PrdBlock>
        <PrdBlock title="9. 기대하는 결과" value={prd.expectedOutput} />
        <PrdBlock title="10. AI 기능" value={prd.needsAI === "yes" ? (prd.aiTask || "필요함 (내용 미작성)") : prd.needsAI === "no" ? "필요하지 않음" : prd.needsAI === "unsure" ? "아직 모르겠음" : ""} />
        <PrdBlock title="11. 데이터 저장" value={storageLabel(prd.storageMethod)} />
        <PrdBlock title="12. 주의사항">
          {prd.cautions.filter((c) => c.trim()).length === 0 ? (
            <p className="text-sm text-muted-soft">작성되지 않음</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {prd.cautions.map((c, i) => c.trim() && <li key={i}>{c}</li>)}
            </ul>
          )}
        </PrdBlock>
      </div>

      {/* Upgrade CTA */}
      <div className="mt-8 bg-surface-cream-strong border-2 border-coral rounded-lg p-6 no-print">
        <h3 className="serif text-xl mb-2">AI에게 보내 PRD 업그레이드하기</h3>
        <p className="text-sm text-body mb-2">
          내가 작성한 내용과 모듈 2의 수업 아이디어를 바탕으로, Lovable이 더 정확하게 이해할 수 있는 PRD로 정리합니다.
        </p>
        <p className="text-sm text-coral font-medium mb-4">
          새로운 앱 아이디어를 임의로 추가하는 것이 아니라, 교사가 작성한 내용을 명확하고 구체적으로 다듬습니다.
        </p>
        {missing.length > 0 && (
          <div className="flex items-start gap-2 bg-canvas rounded-md p-3 mb-4 border border-hairline">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <div className="text-xs text-body">
              다음 필수 항목이 비어 있습니다: <strong>{missing.join(", ")}</strong>
              <br />비어 있어도 진행할 수 있지만, 채워야 더 좋은 결과가 나옵니다.
            </div>
          </div>
        )}
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-coral text-white hover:bg-coral-active font-medium"
        >
          <Sparkles className="w-4 h-4" /> AI로 PRD 업그레이드
        </button>
      </div>

      <StepNav onBack={onBack} />
    </StepShell>
  );
}

// ===== Step 4 =====
function Step4({
  store, onBack, onSaveUpgraded,
}: {
  store: Store;
  onBack: () => void;
  onSaveUpgraded: (md: string) => void;
}) {
  const upgrade = useServerFn(upgradePrd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const md = store.upgradedPrd;

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await upgrade({
        data: {
          module2Context: store.module2Imported,
          teacherPrd: store.teacherPrd as unknown as Record<string, unknown>,
        },
      });
      onSaveUpgraded(res.markdown);
    } catch (e) {
      console.error(e);
      setError("PRD 업그레이드 중 문제가 발생했습니다. 작성한 내용은 그대로 보관되어 있습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on entering step 4 if no result yet
  useEffect(() => {
    if (!md && !autoStarted) {
      setAutoStarted(true);
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("자동 복사가 차단되었습니다. 아래 텍스트를 직접 선택해 복사해 주세요.");
    }
  };

  const download = () => {
    try {
      const name = (store.teacherPrd.projectName || "PRD").replace(/[^\w가-힣\-_ ]/g, "_").trim() || "PRD";
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}_PRD.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("다운로드가 실패했습니다. 아래 내용을 복사해 저장해 주세요.");
    }
  };

  return (
    <StepShell
      title="AI가 정리한 Lovable용 PRD"
      description="교사가 작성한 수업 아이디어를 유지하면서 기능, 사용자 흐름과 완료 조건을 더 명확하게 정리했습니다."
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>교사 작성 내용 기반</Badge>
        <Badge>모듈 2 맥락 반영</Badge>
        <Badge>Lovable용 구조화</Badge>
      </div>

      <div aria-live="polite" className="min-h-[200px]">
        {loading && (
          <div className="bg-surface-card rounded-lg p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-coral mx-auto mb-3" />
            <p className="text-sm text-body">수업 아이디어를 Lovable이 이해하기 쉬운 PRD로 정리하고 있어요...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-error/5 border border-error/30 rounded-lg p-5 mb-4">
            <p className="text-sm text-error mb-3">{error}</p>
            <button onClick={run} className="text-sm px-4 py-2 rounded-md bg-coral text-white hover:bg-coral-active">
              다시 시도
            </button>
          </div>
        )}

        {md && !loading && (
          <>
            <article className="bg-canvas border border-hairline rounded-lg p-6 sm:p-8 prose-prd overflow-x-auto">
              <PrdMarkdown source={md} />
            </article>

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={copy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-coral text-white hover:bg-coral-active font-medium"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "복사되었습니다" : "PRD 복사하기"}
              </button>
              <button
                onClick={download}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-ink text-canvas hover:bg-ink/90 font-medium"
              >
                <Download className="w-4 h-4" /> Markdown(.md)로 저장하기
              </button>
            </div>
            {copied && (
              <p className="text-xs text-coral text-center mt-2">
                PRD가 복사되었습니다. Lovable의 채팅창에 붙여 넣어 보세요.
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card">
                원본 PRD 보기
              </button>
              <button onClick={run} className="text-xs px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card">
                내용을 수정하고 다시 만들기
              </button>
            </div>
          </>
        )}
      </div>

      <StepNav onBack={onBack} />
    </StepShell>
  );
}

// ===== Small components =====
function StepShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Section title={title}>
      <p className="text-body mb-6 -mt-3">{description}</p>
      {children}
    </Section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="serif text-xl mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, rows = 1, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink mb-1">{label}</span>
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas focus:border-coral outline-none text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas focus:border-coral outline-none text-sm"
        />
      )}
      {hint && <span className="block text-[11px] text-muted-text mt-1">{hint}</span>}
    </label>
  );
}

function RadioRow<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: T) => void;
  options: Array<string | { value: T; label: string }>;
}) {
  return (
    <fieldset>
      <legend className="block text-xs font-medium text-ink mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const optValue = typeof opt === "string" ? opt : opt.value;
          const optLabel = typeof opt === "string" ? opt : opt.label;
          const selected = value === optValue;
          return (
            <button
              key={optValue}
              type="button"
              onClick={() => onChange(optValue as T)}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                selected ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-card"
              }`}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  label, selected, options, onChange,
}: {
  label: string;
  selected: string[];
  options: string[];
  onChange: (arr: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };
  return (
    <fieldset>
      <legend className="block text-xs font-medium text-ink mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                on ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-card"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ListEditor({
  items, onChange, placeholder,
}: {
  items: string[];
  onChange: (arr: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-text w-6 shrink-0 text-right">{i + 1}.</span>
          <input
            value={item}
            onChange={(e) => {
              const arr = [...items];
              arr[i] = e.target.value;
              onChange(arr);
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-md border border-hairline bg-canvas focus:border-coral outline-none text-sm"
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="p-1.5 rounded-md text-muted-text hover:text-error hover:bg-error/5"
              aria-label="항목 삭제"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-dashed border-hairline hover:bg-surface-card text-muted-text"
      >
        <Plus className="w-3 h-3" /> 단계 추가
      </button>
    </div>
  );
}

function StepNav({ onBack, onNext, nextLabel = "다음", extra }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-hairline no-print">
      <div>
        {onBack && (
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-surface-card">
            <ArrowLeft className="w-3.5 h-3.5" /> 이전
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {onNext && (
          <button onClick={onNext} className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90">
            {nextLabel} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function PrdBlock({ title, value, children }: { title: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <h3 className="serif text-lg mb-1">{title}</h3>
      {children ?? (
        value ? <p className="text-sm text-body whitespace-pre-wrap">{value}</p>
              : <p className="text-sm text-muted-soft">작성되지 않음</p>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-pill bg-coral/10 text-coral text-[11px] font-medium">
      {children}
    </span>
  );
}

// Basic markdown renderer (headings + lists + paragraphs)
function PrdMarkdown({ source }: { source: string }) {
  const blocks = useMemo(() => renderMd(source), [source]);
  return <div className="space-y-3 text-sm break-words">{blocks}</div>;
}

function renderMd(src: string): React.ReactNode[] {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  const flushList = () => {
    if (!listType || listBuf.length === 0) return;
    const items = listBuf.map((t, i) => <li key={i}>{inline(t)}</li>);
    out.push(
      listType === "ol"
        ? <ol key={out.length} className="list-decimal list-inside space-y-1 pl-2">{items}</ol>
        : <ul key={out.length} className="list-disc list-inside space-y-1 pl-2">{items}</ul>
    );
    listBuf = [];
    listType = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }
    if (line.startsWith("### ")) {
      flushList();
      out.push(<h4 key={out.length} className="serif text-base mt-4 mb-1 text-ink">{inline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      flushList();
      out.push(<h3 key={out.length} className="serif text-xl mt-6 mb-2 text-ink border-b border-hairline pb-1">{inline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      flushList();
      out.push(<h2 key={out.length} className="serif text-2xl mt-2 mb-3 text-ink">{inline(line.slice(2))}</h2>);
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(line.replace(/^\s*\d+\.\s+/, ""));
    } else {
      flushList();
      out.push(<p key={out.length} className="text-body">{inline(line)}</p>);
    }
  }
  flushList();
  return out;
}

function inline(text: string): React.ReactNode {
  // simple **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// ===== Helpers =====
function storageLabel(s: TeacherPrd["storageMethod"]) {
  return s === "none" ? "저장하지 않음"
    : s === "device" ? "기기에만 임시 저장"
    : s === "database" ? "데이터베이스에 저장"
    : s === "unsure" ? "아직 모르겠음" : "";
}

function requiredMissing(p: TeacherPrd): string[] {
  const missing: string[] = [];
  if (!p.projectName.trim()) missing.push("앱 이름");
  if (!p.oneLineDescription.trim()) missing.push("한 줄 소개");
  if (!p.problem.trim()) missing.push("해결하려는 문제");
  if (!p.primaryUser.trim()) missing.push("주요 사용자");
  if (!p.coreFeatures[0]?.trim()) missing.push("핵심 기능 1");
  if (!p.expectedOutput.trim()) missing.push("기대하는 결과");
  if (!p.needsAI) missing.push("AI 필요 여부");
  return missing;
}

function calcProgress(p: TeacherPrd): number {
  const fields = [
    p.projectName, p.oneLineDescription, p.schoolLevel, p.grade, p.subject, p.learningTopic,
    p.problem, p.desiredChange, p.primaryUser, p.mainTask,
    p.coreFeatures[0], p.coreFeatures[1], p.coreFeatures[2],
    p.userFlow[0], p.expectedOutput, p.designPreference,
    p.needsAI, p.storageMethod,
  ];
  const filled = fields.filter((f) => (f ?? "").toString().trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}
