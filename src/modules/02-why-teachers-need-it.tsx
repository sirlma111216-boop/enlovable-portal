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
  PrivacyNote,
} from "@/components/module-ui";
import { useLocalStorage } from "@/hooks/use-local-storage";

const m = moduleByNumber(2)!;

type Answers = { repeatTime: string; studentStuck: string; toolGap: string };

const EMPTY: Answers = { repeatTime: "", studentStuck: "", toolGap: "" };

export default function Mod02() {
  const [draft, setDraft] = useLocalStorage<Answers>("vibecoding:mod02:bottleneck:draft", EMPTY);
  const [saved, setSaved] = useLocalStorage<Answers>("vibecoding:mod02:bottleneck", EMPTY);
  const a = draft;
  const setA = setDraft;
  const isSaved =
    saved.repeatTime === draft.repeatTime &&
    saved.studentStuck === draft.studentStuck &&
    saved.toolGap === draft.toolGap &&
    (draft.repeatTime || draft.studentStuck || draft.toolGap);


  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "기존 에듀테크의 한계를 교실 맥락에서 설명할 수 있다.",
          "교사가 만들 수 있는 수업 도구의 유형을 떠올릴 수 있다.",
          "바이브코딩의 교육적 가치를 기능이 아닌 문제 해결 관점에서 볼 수 있다.",
        ]}
      />

      <KeyMessage>
        이제 AI는 텍스트로 답하지 않고, 작동하는 도구를 만들어 줍니다.
      </KeyMessage>

      <Section title="BEFORE → NOW">
        <div className="grid md:grid-cols-2 gap-4">
          <ConceptCard title="검색과 답변의 AI (BEFORE)" tone="soft">
            <ul className="space-y-2 list-disc list-inside">
              <li>질문에 텍스트로 답한다.</li>
              <li>교사가 다시 가공해야 한다.</li>
              <li>결과물은 사람이 직접 만든다.</li>
            </ul>
          </ConceptCard>
          <ConceptCard title="창작과 도구의 AI (NOW)" tone="dark">
            <ul className="space-y-2 list-disc list-inside">
              <li>활동지, 루브릭, 데이터 시각화를 만든다.</li>
              <li>작동하는 웹앱까지 제작한다.</li>
              <li>교사의 아이디어를 빠르게 시험할 수 있다.</li>
            </ul>
          </ConceptCard>
        </div>
      </Section>

      <Section title="기존 에듀테크가 교실을 자주 비껴가는 이유">
        <ul className="grid sm:grid-cols-2 gap-3">
          {[
            ["수업 맥락이 다르다", "같은 단원도 학교, 학년, 학생 수준에 따라 다르다."],
            ["기능이 과하거나 부족하다", "꼭 필요한 기능 하나는 없고, 안 쓰는 기능은 많다."],
            ["학생 데이터를 다루기 부담스럽다", "외부 서비스에 학생 정보를 넣기 어렵다."],
            ["교사의 의도가 충분히 반영되지 않는다", "내 수업 흐름은 교사가 가장 잘 안다."],
          ].map(([t, d]) => (
            <li key={t} className="bg-surface-card rounded-lg p-5">
              <p className="font-semibold text-ink mb-1">{t}</p>
              <p className="text-sm text-body">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="교사가 만들 수 있는 도구의 4가지 결">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["평가", "개별 피드백, 루브릭, 오답 유형 분석"],
            ["운영", "역할 배정, 랜덤 미션, 참여 기록"],
            ["탐구", "수준별 탐구 질문, 프로젝트 주제 생성"],
            ["분석", "형성평가 대시보드, 보충 학습 추천"],
          ].map(([t, d]) => (
            <div key={t} className="border border-hairline rounded-lg p-5 bg-canvas">
              <span className="inline-block px-2 py-0.5 rounded-pill bg-coral/10 text-coral text-[11px] font-medium uppercase tracking-widest mb-2">
                {t}
              </span>
              <p className="text-body">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <PracticePanel title="직접 해보기 — 내 수업의 반복 업무 찾기">
        <p className="text-sm text-body mb-4">
          오늘 발견한 답은 Module 8 PRD 워크숍에서 자동으로 불러옵니다.
        </p>
        <div className="space-y-4">
          {[
            ["repeatTime", "수업에서 반복적으로 시간이 많이 드는 일", "예: 매주 형성평가 4개 채점하고 코멘트 달기"],
            ["studentStuck", "학생들이 매번 막히는 지점", "예: 글쓰기에서 첫 문장을 시작하지 못함"],
            ["toolGap", "기존 도구가 해결하지 못한 점", "예: 학생별 다른 난이도의 보충 질문이 필요"],
          ].map(([key, label, ph]) => (
            <label key={key} className="block">
              <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
              <textarea
                value={a[key as keyof Answers]}
                onChange={(e) => setA({ ...a, [key]: e.target.value })}
                placeholder={ph}
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-hairline bg-canvas focus:border-coral outline-none text-sm"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSaved({ ...draft })}
            className="text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
          >
            저장하기
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("입력한 내용을 모두 초기화할까요?")) {
                setDraft(EMPTY);
                setSaved(EMPTY);
              }
            }}
            className="text-sm px-4 py-2 rounded-md border border-hairline hover:bg-surface-card"
          >
            초기화
          </button>
          <span className="text-xs text-muted-text">
            {isSaved
              ? "✓ 저장됨 — 모듈 8에서 불러올 수 있습니다."
              : "저장 전에는 모듈 8에서 불러오기가 되지 않습니다."}
          </span>
        </div>
        <PrivacyNote />
      </PracticePanel>


      <InstructorTip>
        “기존 에듀테크가 부족했던 경험”을 두세 분에게 꼭 공유하게 합니다. 이 발화가
        나중 PRD 단계의 문제 정의로 그대로 이어집니다.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod02:check"
        items={[
          "내 수업에서 반복 업무 한 가지를 적었다.",
          "기존 도구의 한계를 한 문장으로 설명할 수 있다.",
          "내가 만들 수 있는 도구 유형을 하나 떠올렸다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}
