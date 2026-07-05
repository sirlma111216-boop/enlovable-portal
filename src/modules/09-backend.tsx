import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  ConceptCard,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
  PracticePanel,
} from "@/components/module-ui";
import { CloudDbDemoSection } from "./09-cloud-demo";

const m = moduleByNumber(9)!;

type YN = "yes" | "no" | "";
const questions: { key: string; q: string }[] = [
  { key: "persist", q: "앱을 닫아도 기록이 남아야 하나요?" },
  { key: "multi", q: "여러 기기에서 같은 기록을 봐야 하나요?" },
  { key: "roles", q: "교사와 학생의 권한이 달라야 하나요?" },
  { key: "files", q: "파일을 업로드해야 하나요?" },
  { key: "secret", q: "API 키처럼 숨겨야 하는 정보가 있나요?" },
  { key: "shared", q: "여러 사용자가 같은 데이터를 사용하나요?" },
];

function verdict(ans: Record<string, YN>) {
  const yes = Object.values(ans).filter((v) => v === "yes").length;
  if (yes === 0) return { tag: "프론트엔드만으로 충분", body: "화면만 있으면 되는 단순 도구입니다. 백엔드 없이 시작해도 됩니다." };
  if (yes <= 2 && ans.persist === "yes" && ans.multi !== "yes" && ans.shared !== "yes")
    return { tag: "localStorage로 먼저 시작", body: "한 사람의 기억만 필요하면 브라우저 저장으로 충분히 빠르게 시작할 수 있습니다." };
  return { tag: "백엔드 연결이 필요", body: "여러 사용자, 권한 차이, 비밀 키 보관 — 백엔드(예: Lovable Cloud)를 연결하세요." };
}

const scenarios: { text: string; need: "no" | "ls" | "yes"; why: string }[] = [
  { text: "한 교사가 본인만 사용하는 단어 학습 카드", need: "no", why: "공유·권한이 없으면 화면만으로 충분합니다." },
  { text: "여러 교사가 공통 평가 결과를 공유하는 대시보드", need: "yes", why: "여러 사용자가 같은 데이터를 본다면 백엔드가 필요합니다." },
  { text: "교사 한 명의 채점 메모를 다음 수업에도 이어 쓰기", need: "ls", why: "본인 기억만 유지하면 localStorage로 충분히 시작됩니다." },
  { text: "외부 AI API 호출이 포함된 학생용 도구", need: "yes", why: "API 키 보관과 사용량 제어를 위해 서버 함수가 필요합니다." },
];

export default function Mod09() {
  const [ans, setAns] = useState<Record<string, YN>>({});
  const all = questions.every((q) => ans[q.key]);
  const v = verdict(ans);

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "프론트엔드와 백엔드의 역할을 구분할 수 있다.",
          "데이터베이스가 필요한 상황을 판단할 수 있다.",
          "인증, 데이터 저장, 권한, 서버 함수의 기본 개념을 이해할 수 있다.",
        ]}
      />

      <KeyMessage>모든 앱에 백엔드가 필요한 것은 아닙니다. 필요할 때만 더합니다.</KeyMessage>

      <Section title="교실 비유로 백엔드 이해하기">
        <ul className="grid sm:grid-cols-2 gap-3">
          {[
            ["Frontend", "학생이 보는 활동지와 버튼"],
            ["Backend", "교무실에서 처리되는 규칙과 업무"],
            ["Database", "기록을 보관하는 문서함"],
            ["Authentication", "출입자 확인"],
            ["Server Function", "담당자가 안전하게 처리하는 비공개 작업"],
          ].map(([t, d]) => (
            <li key={t} className="bg-surface-card rounded-lg p-4">
              <p className="font-semibold text-ink">{t}</p>
              <p className="text-sm text-body">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <PracticePanel title="백엔드가 필요한가요? — 6문항 진단">
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.key} className="flex items-center justify-between gap-3 py-2 border-b border-hairline-soft">
              <span className="text-sm text-body-strong flex-1">{q.q}</span>
              <div className="flex gap-1">
                {(["yes", "no"] as YN[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setAns({ ...ans, [q.key]: v })}
                    className={`text-xs px-3 py-1 rounded-md border ${
                      ans[q.key] === v ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-card"
                    }`}
                  >
                    {v === "yes" ? "예" : "아니오"}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {all && (
          <div className="mt-5 p-5 bg-surface-card rounded-lg">
            <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">진단 결과</p>
            <p className="serif text-2xl mb-2">{v.tag}</p>
            <p className="text-sm text-body leading-relaxed">{v.body}</p>
          </div>
        )}
      </PracticePanel>

      <Section title="안전한 데이터 흐름">
        <div className="bg-surface-soft rounded-lg p-5 text-center font-mono text-sm leading-relaxed">
          교사 입력 → 화면 → <span className="text-coral font-semibold">안전한 서버 함수</span> → 데이터베이스 또는 외부 API → 결과 → 화면
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {[
            "학생 실명과 민감정보를 기본값으로 수집하지 않는다.",
            "API 키를 화면 코드나 localStorage에 넣지 않는다.",
            "사용자별 데이터 접근 권한을 확인한다.",
            "공개 전 테스트 계정으로 권한을 검증한다.",
            "필요하지 않은 데이터는 저장하지 않는다.",
          ].map((s) => (
            <li key={s} className="flex gap-2"><span className="text-coral">●</span><span>{s}</span></li>
          ))}
        </ul>
      </Section>

      <Section title="시나리오로 연습">
        <ul className="space-y-3">
          {scenarios.map((s) => (
            <Scenario key={s.text} {...s} />
          ))}
        </ul>
      </Section>

      <Section title="러버블에서의 백엔드 옵션">
        <div className="grid md:grid-cols-2 gap-3">
          <ConceptCard title="Lovable Cloud">
            대화로 데이터베이스·인증·secret을 한 번에 연결합니다. 별도 계정 없이 시작합니다.
          </ConceptCard>
          <Link
            to="/lovable/supabase-integration"
            className="block group rounded-lg bg-ink text-white p-5 hover:bg-ink/90 transition-colors cursor-pointer"
          >
            <p className="serif text-xl mb-2 text-white">Supabase integration</p>
            <p className="text-sm text-white/85 leading-relaxed mb-3">
              기존 Supabase 프로젝트가 있거나, 직접 관리하고 싶을 때 연결합니다.
            </p>
            <p className="text-xs text-white/70 mb-3">
              기존 Supabase 계정을 Lovable에 연결하는 6단계 안내
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-coral text-white px-3 py-1.5 rounded-md group-hover:bg-coral-active">
              연결 방법 보기 →
            </span>
          </Link>
        </div>
      </Section>

      <CloudDbDemoSection />

      <InstructorTip>
        “저장은 어디에 되나요?”라는 질문이 핵심입니다. 브라우저인지, 서버인지, 그
        결정이 곧 백엔드 필요 여부입니다.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod09:check"
        items={[
          "프론트엔드와 백엔드의 역할을 구분할 수 있다.",
          "내 프로젝트가 백엔드를 필요로 하는지 판단할 수 있다.",
          "API 키를 브라우저에 두지 않는 이유를 안다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}

function Scenario({ text, need, why }: { text: string; need: "no" | "ls" | "yes"; why: string }) {
  const [pick, setPick] = useState<"no" | "ls" | "yes" | null>(null);
  const label: Record<typeof need, string> = { no: "프론트엔드만", ls: "localStorage", yes: "백엔드 필요" };
  return (
    <li className="p-4 rounded-md bg-canvas border border-hairline">
      <p className="text-body-strong mb-3">{text}</p>
      <div className="flex flex-wrap gap-2">
        {(["no", "ls", "yes"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setPick(opt)}
            className={`text-xs px-3 py-1.5 rounded-md border ${
              pick === opt
                ? opt === need
                  ? "bg-success text-white border-success"
                  : "bg-error text-white border-error"
                : "border-hairline hover:bg-surface-card"
            }`}
          >
            {label[opt]}
          </button>
        ))}
      </div>
      {pick && (
        <p className="mt-2 text-sm text-body">
          <span className="font-semibold text-ink">정답: {label[need]} — </span>
          {why}
        </p>
      )}
    </li>
  );
}
