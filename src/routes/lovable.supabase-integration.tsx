import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Languages as LanguagesIcon } from "lucide-react";
import step1 from "@/assets/supabase-step-9.png.asset.json";
import step2 from "@/assets/supabase-step-10.png.asset.json";
import step3 from "@/assets/supabase-step-11.png.asset.json";
import step4 from "@/assets/supabase-step-12.png.asset.json";

export const Route = createFileRoute("/lovable/supabase-integration")({
  head: () => ({
    meta: [
      { title: "Lovable과 Supabase 연결하기 — 내 수업에 코딩 한 스푼" },
      {
        name: "description",
        content:
          "기존 Supabase 프로젝트를 Lovable에 연결하는 6단계 안내. 교사를 위한 쉬운 매뉴얼.",
      },
    ],
  }),
  component: SupabaseIntegrationPage,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-text">{error.message}</div>
  ),
});

type Step = {
  id: string;
  n: string;
  title: string;
  img: { url: string };
  imgAlt: string;
  layout: "portrait" | "wide";
  what?: string;
  happens?: string;
  tip?: string;
  caution?: string;
  extra?: { label: string; body: string }[];
};

const STEPS: Step[] = [
  {
    id: "s1",
    n: "①",
    title: "프로젝트 이름 옆 화살표 열기",
    img: step1,
    imgAlt: "프로젝트 메뉴 열기",
    layout: "portrait",
    what: "프로젝트 제목 오른쪽에 있는 ▼ 버튼",
    happens: "프로젝트 설정과 연결 기능을 선택할 수 있는 메뉴가 열립니다.",
    tip: "대시보드의 왼쪽 메뉴가 아니라, 현재 프로젝트 안에서 프로젝트 이름 옆 화살표를 누르는 단계입니다.",
  },
  {
    id: "s2",
    n: "②",
    title: "Connectors 메뉴 선택",
    img: step1,
    imgAlt: "Connectors 메뉴",
    layout: "portrait",
    what: "열린 메뉴에서 “Connectors” 항목",
    happens: "Lovable과 연결할 수 있는 외부 서비스 목록으로 이동합니다.",
    tip: "Connector는 Lovable과 외부 서비스를 연결하는 통로입니다.",
  },
  {
    id: "s3",
    n: "③",
    title: "검색창에 Supabase 입력",
    img: step2,
    imgAlt: "Supabase 검색",
    layout: "wide",
    what: "왼쪽 위 검색창에 “supabase” 입력",
    happens: "많은 Connector 중 Supabase 항목만 빠르게 찾을 수 있습니다.",
    tip: "전체 이름을 입력하지 않아도 ‘supa’ 정도만 입력해도 검색됩니다.",
  },
  {
    id: "s4",
    n: "④",
    title: "Supabase Connector 선택",
    img: step2,
    imgAlt: "Supabase 카드 선택",
    layout: "wide",
    what: "“Connect an external Supabase project”라고 적힌 Supabase 카드",
    happens: "Supabase 연결 상세 화면으로 이동합니다.",
    caution:
      "옆에 표시되는 Cloud는 Lovable Cloud입니다. 외부 Supabase 계정을 연결하려면 Supabase 카드를 선택해야 합니다.",
  },
  {
    id: "s5",
    n: "⑤",
    title: "Connect Supabase 버튼 누르기",
    img: step3,
    imgAlt: "Connect Supabase 버튼",
    layout: "wide",
    what: "상세 화면 오른쪽의 “Connect Supabase” 버튼",
    happens: "Lovable이 Supabase의 로그인 및 권한 승인 화면으로 이동시킵니다.",
    caution: "이 버튼만으로 Supabase 계정이 자동 생성되는 것은 아닙니다.",
    extra: [
      {
        label: "계정이 있는 경우",
        body: "이미 Supabase에 로그인되어 있다면 바로 조직 선택과 승인 화면으로 이동할 수 있습니다.",
      },
      {
        label: "계정이 없는 경우",
        body: "Supabase 로그인 또는 회원가입 화면이 먼저 나타납니다. 회원가입을 완료한 뒤 연결 과정을 계속합니다.",
      },
    ],
  },
  {
    id: "s6",
    n: "⑥",
    title: "Supabase 조직 선택 후 Authorize Lovable",
    img: step4,
    imgAlt: "Authorize Lovable",
    layout: "portrait",
    what: "연결할 Organization 선택 후 “Authorize Lovable” 버튼",
    happens:
      "Lovable이 선택한 Supabase 조직의 프로젝트와 백엔드 기능에 접근할 수 있도록 권한을 부여합니다.",
    extra: [
      {
        label: "표시되는 주요 권한",
        body: "Database, Secrets, Auth, Edge Functions, Environment, Projects, PostgREST, Analytics, Storage / Organizations, Domains",
      },
      {
        label: "쉽게 설명",
        body: "Lovable이 Supabase에서 데이터베이스를 만들고, 로그인 기능을 설정하고, 비밀키와 서버 기능을 관리할 수 있도록 허용하는 단계입니다.",
      },
      {
        label: "계정이 없는 사용자",
        body: "이 화면이 바로 나타나지 않고 로그인/회원가입 화면이 먼저 나타나도 정상입니다. 계정을 만든 뒤 로그인하면 조직 선택 화면으로 이어집니다.",
      },
      {
        label: "보안",
        body: "본인이 관리하는 Organization에만 접근을 허용하세요. 학교나 다른 사람의 조직을 임의로 선택하지 마세요.",
      },
      {
        label: "Authorize Lovable이란?",
        body: "Supabase 비밀번호를 Lovable에 전달하는 것이 아니라, Supabase가 Lovable에 정해진 접근 권한을 부여하는 OAuth 승인입니다.",
      },
    ],
  },
];

const EXAMPLE_PROMPTS: { ko: string; en: string }[] = [
  {
    ko: "Supabase를 사용해 이메일 회원가입과 로그인 기능을 추가해줘.",
    en: "Add email sign-up and login using Supabase.",
  },
  {
    ko: "사용자가 작성한 형성평가 기록을 Supabase 데이터베이스에 저장해줘.",
    en: "Save the formative assessment records that users create to the Supabase database.",
  },
  {
    ko: "교사는 전체 기록을 보고 학생은 자신의 기록만 볼 수 있도록 권한을 설정해줘.",
    en: "Set permissions so teachers can see all records while students can only see their own.",
  },
  {
    ko: "Gemini API 키는 Supabase Secret에 저장하고 Edge Function에서만 호출해줘.",
    en: "Store the Gemini API key in a Supabase secret and call it only from an Edge Function.",
  },
];

const CHECKLIST = [
  "Supabase Connector 상태가 Enabled 또는 Connected로 표시되는가?",
  "올바른 Supabase Organization을 선택했는가?",
  "Lovable 채팅에서 Supabase 연결을 인식하는가?",
  "데이터베이스 또는 로그인 기능을 요청했을 때 관련 작업이 생성되는가?",
  "Supabase 대시보드에서 프로젝트와 테이블을 확인할 수 있는가?",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Authorize Lovable 화면이 나타나지 않아요",
    a: "Supabase에 로그인되어 있지 않다면 로그인 또는 회원가입 화면이 먼저 나타날 수 있습니다. 팝업 차단 여부를 확인하고 Supabase 로그인 후 다시 Connect Supabase를 눌러보세요.",
  },
  {
    q: "선택할 Organization이 없어요",
    a: "Supabase 계정을 처음 만든 경우 기본 Organization이 생성되는지 확인하세요. 생성되지 않았다면 Supabase 대시보드에서 새 Organization을 만든 뒤 다시 연결하세요.",
  },
  {
    q: "잘못된 Organization을 선택했어요",
    a: "연결을 취소하거나 Connector 설정에서 연결을 해제한 뒤 올바른 Organization으로 다시 승인하세요.",
  },
  {
    q: "Supabase 프로젝트가 보이지 않아요",
    a: "선택한 Organization에 해당 프로젝트가 있는지 확인하고, 현재 계정에 프로젝트를 볼 수 있는 권한이 있는지 확인하세요.",
  },
  {
    q: "학교 계정으로 연결해도 되나요?",
    a: "학교의 개인정보 및 외부 클라우드 사용 정책을 먼저 확인하세요. 민감한 학생 정보를 저장하기 전에는 반드시 학교/기관의 보안 지침을 검토해야 합니다.",
  },
  {
    q: "연결하면 자동으로 데이터베이스가 완성되나요?",
    a: "연결은 Lovable이 Supabase 기능을 사용할 수 있도록 허용하는 단계입니다. 실제 테이블, 로그인, 저장 기능은 이후 Lovable 채팅에서 요청해 만들어야 합니다.",
  },
];

const GLOSSARY: [string, string][] = [
  ["Organization", "Supabase에서 여러 프로젝트와 구성원을 묶어 관리하는 작업 공간"],
  ["Project", "하나의 앱에서 사용하는 데이터베이스, 인증, 저장소, 서버 기능의 묶음"],
  ["OAuth", "비밀번호를 직접 전달하지 않고 외부 서비스에 정해진 권한을 허용하는 연결 방식"],
  ["Authorization", "외부 앱이 어떤 데이터와 기능에 접근할 수 있는지 허용하는 과정"],
  ["Connector", "Lovable과 외부 서비스를 연결하는 기능"],
  ["Edge Function", "API 키를 숨긴 채 서버에서 코드를 실행하는 기능"],
];

function SupabaseIntegrationPage() {
  const [account, setAccount] = useState<"has" | "none" | null>(null);
  const [zoom, setZoom] = useState<{ url: string; alt: string } | null>(null);
  const [activeStep, setActiveStep] = useState<string>("s1");
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST.map(() => false));
  const [copied, setCopied] = useState<number | null>(null);
  const [promptLang, setPromptLang] = useState<"ko" | "en">("ko");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const stepRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom]);

  const scrollToStep = (id: string) => {
    setActiveStep(id);
    stepRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      {/* Back */}
      <div className="mb-6 text-sm">
        <Link to="/modules/$slug" params={{ slug: "09-backend" }} className="text-coral hover:text-coral-active">
          ← 백엔드 모듈로 돌아가기
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-text mb-2">Backend Integration</p>
        <h1 className="serif text-4xl sm:text-5xl leading-tight mb-3">Lovable과 Supabase 연결하기</h1>
        <p className="text-body text-lg leading-relaxed">
          기존 Supabase 프로젝트를 Lovable에 연결하여 데이터베이스, 로그인, 파일 저장, 서버 기능을 사용할 수 있습니다.
        </p>
      </header>

      {/* Prereq notice */}
      <section className="mb-10 rounded-xl border border-coral/40 bg-coral/5 p-6">
        <p className="serif text-2xl mb-2">시작하기 전에 꼭 확인하세요</p>
        <p className="text-body leading-relaxed mb-3">
          Supabase integration은 Lovable 계정만으로 자동 생성되는 기능이 아닙니다. 외부 Supabase 계정이 별도로 필요합니다.
          Supabase 계정이 없다면 연결 과정에서 먼저 회원가입하거나 Supabase 웹사이트에서 무료 계정을 만든 뒤 진행해야 합니다.
        </p>
        <p className="inline-block bg-coral text-white text-sm font-semibold px-3 py-1 rounded-md mb-4">
          Lovable 계정 ≠ Supabase 계정
        </p>
        <ul className="space-y-1.5 text-sm text-body-strong">
          {[
            "Lovable 계정과 Supabase 계정은 서로 다른 서비스의 계정입니다.",
            "Supabase integration은 사용자가 소유한 Supabase 계정과 조직을 Lovable에 연결하는 기능입니다.",
            "Supabase 계정이 없다면 먼저 회원가입해야 합니다.",
            "Supabase에 처음 가입하면 기본 Organization이 생성됩니다.",
            "이후 Lovable에 해당 Organization의 접근 권한을 승인합니다.",
          ].map((s) => (
            <li key={s} className="flex gap-2"><span className="text-coral">●</span><span>{s}</span></li>
          ))}
        </ul>
      </section>

      {/* Comparison */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-4">Lovable Cloud vs Supabase integration</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface-card rounded-xl p-6 border border-hairline">
            <div className="flex items-center justify-between mb-2">
              <p className="serif text-xl">Lovable Cloud</p>
              <span className="text-xs bg-success/15 text-success px-2 py-1 rounded-md font-semibold">처음 시작할 때 추천</span>
            </div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• 별도의 Supabase 계정 없이 시작 가능</li>
              <li>• DB·인증·저장소·서버 기능을 Lovable 안에서 관리</li>
              <li>• 초보자와 빠른 MVP 제작에 적합</li>
              <li>• 설정 과정이 간단함</li>
            </ul>
          </div>
          <div className="bg-surface-card rounded-xl p-6 border border-hairline">
            <div className="flex items-center justify-between mb-2">
              <p className="serif text-xl">Supabase integration</p>
              <span className="text-xs bg-coral/15 text-coral px-2 py-1 rounded-md font-semibold">직접 관리할 때 추천</span>
            </div>
            <ul className="text-sm text-body space-y-1.5">
              <li>• 별도의 Supabase 계정 필요</li>
              <li>• 기존 Supabase 조직·프로젝트를 Lovable에 연결</li>
              <li>• Supabase 대시보드에서 데이터·설정을 직접 관리</li>
              <li>• 기존 프로젝트 활용과 세밀한 관리에 적합</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-body bg-surface-soft rounded-lg p-4">
          Supabase를 처음 사용하고 직접 관리할 필요가 없다면 <b>Lovable Cloud</b>가 더 간단합니다. 기존 Supabase 프로젝트가
          있거나 데이터베이스를 직접 관리하려면 <b>Supabase integration</b>을 선택하세요.
        </p>
      </section>

      {/* Account state */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-3">나는 어디에 해당하나요?</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["has", "none"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setAccount(v)}
              className={`text-sm px-4 py-2 rounded-md border cursor-pointer transition-colors ${
                account === v ? "bg-coral text-white border-coral" : "border-hairline hover:bg-surface-card"
              }`}
            >
              {v === "has" ? "Supabase 계정이 있어요" : "Supabase 계정이 없어요"}
            </button>
          ))}
        </div>
        {account === "has" && (
          <div className="bg-surface-card rounded-lg p-5">
            <p className="text-body-strong mb-2">
              Connect Supabase를 누르면 Supabase 로그인 상태를 확인한 뒤, Lovable에 권한을 허용하는 Authorize Lovable
              화면으로 이동합니다. 이미 로그인되어 있다면 로그인 화면이 생략될 수 있습니다.
            </p>
            <p className="text-sm font-mono text-muted-text">
              Supabase 선택 → Connect Supabase → 조직 선택 → Authorize Lovable
            </p>
          </div>
        )}
        {account === "none" && (
          <div className="bg-surface-card rounded-lg p-5 space-y-3">
            <p className="text-body-strong">
              Lovable이 외부 Supabase 계정을 자동으로 만들어 주지는 않습니다. Supabase 로그인 또는 회원가입 화면에서 계정을
              먼저 생성해야 합니다. 회원가입이 끝나면 기본 Organization이 만들어지며, 이후 다시 권한 승인 단계로 진행할 수
              있습니다.
            </p>
            <p className="text-sm font-mono text-muted-text">
              Connect Supabase → Supabase 회원가입 → 이메일 확인/로그인 → 기본 Organization 확인 → Authorize Lovable
            </p>
            <ul className="text-sm text-body space-y-1">
              <li>• Supabase 무료 계정은 일반적으로 신용카드 없이 시작할 수 있습니다.</li>
              <li>• 가입에 사용한 이메일과 로그인 방식을 기억하세요.</li>
              <li>• 조직 이름은 나중에 Supabase에서 관리할 수 있습니다.</li>
            </ul>
            <p className="text-xs text-muted-text">
              ※ Supabase의 실제 가입 화면은 로그인 상태나 가입 방식에 따라 첨부 이미지와 다르게 나타날 수 있습니다.
            </p>
          </div>
        )}
      </section>

      {/* Step indicator */}
      <section className="mb-8 sticky top-2 z-10">
        <div className="bg-canvas/90 backdrop-blur rounded-full border border-hairline p-2 flex justify-between gap-1 overflow-x-auto">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToStep(s.id)}
              className={`flex-1 min-w-[3rem] text-sm font-semibold py-1.5 rounded-full cursor-pointer transition-colors ${
                activeStep === s.id ? "bg-coral text-white" : "text-body hover:bg-surface-card"
              }`}
            >
              {s.n}
            </button>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-12 space-y-6">
        {STEPS.map((s, idx) => (
          <div key={s.id}>
            <div
              ref={(el) => {
                stepRefs.current[s.id] = el;
              }}
              className={`rounded-xl border p-5 sm:p-6 transition-colors bg-surface-card ${
                activeStep === s.id ? "border-coral" : "border-hairline"
              }`}
              onMouseEnter={() => setActiveStep(s.id)}
            >
              <div className="flex items-baseline gap-3 mb-4">
                <span className={`serif text-3xl ${activeStep === s.id ? "text-coral" : "text-ink"}`}>{s.n}</span>
                <h3 className="serif text-xl leading-tight">{s.title}</h3>
              </div>
              <div className={s.layout === "portrait" ? "grid md:grid-cols-[minmax(0,260px)_1fr] gap-6 items-start" : "space-y-5"}>
                <button
                  type="button"
                  onClick={() => setZoom({ url: s.img.url, alt: s.imgAlt })}
                  className={`block rounded-lg overflow-hidden bg-canvas border border-hairline hover:border-coral cursor-zoom-in ${
                    s.layout === "portrait" ? "w-full max-w-[260px] mx-auto md:mx-0" : "w-full"
                  }`}
                  aria-label={`${s.imgAlt} 확대`}
                >
                  <img src={s.img.url} alt={s.imgAlt} className="w-full h-auto" />
                </button>
                <div className="text-sm space-y-3">
                  {s.what && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">무엇을 눌러야 하나요</p>
                      <p className="text-body-strong">{s.what}</p>
                    </div>
                  )}
                  {s.happens && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">이 단계에서 일어나는 일</p>
                      <p className="text-body">{s.happens}</p>
                    </div>
                  )}
                  {s.tip && (
                    <div className="bg-surface-soft rounded-md p-3">
                      <p className="text-xs font-semibold text-ink mb-1">💡 초보자 팁</p>
                      <p className="text-body">{s.tip}</p>
                    </div>
                  )}
                  {s.caution && (
                    <div className="bg-coral/5 border border-coral/30 rounded-md p-3">
                      <p className="text-xs font-semibold text-coral mb-1">⚠️ 주의</p>
                      <p className="text-body">{s.caution}</p>
                    </div>
                  )}
                  {s.extra?.map((e) => (
                    <div key={e.label} className="border-l-2 border-hairline pl-3">
                      <p className="text-xs font-semibold text-ink mb-0.5">{e.label}</p>
                      <p className="text-body">{e.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex justify-center py-2 text-muted-text" aria-hidden>
                ↓
              </div>
            )}
          </div>
        ))}
      </section>

      {/* After */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-3">연결이 완료된 뒤 무엇을 할 수 있나요?</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm mb-6">
          {[
            "사용자 회원가입과 로그인 구현",
            "데이터베이스 테이블 생성",
            "학생 또는 사용자 기록 저장",
            "이미지와 첨부 파일 저장",
            "서버 함수(Edge Function) 실행",
            "API 키와 Secret을 서버 측에서 관리",
            "Supabase 대시보드에서 데이터·인증 상태 확인",
          ].map((t) => (
            <li key={t} className="bg-surface-card rounded-md p-3 flex gap-2">
              <span className="text-coral">✓</span>
              <span className="text-body">{t}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="serif text-lg">바로 써볼 수 있는 예시 프롬프트</h3>
          <button
            onClick={() => setPromptLang(promptLang === "ko" ? "en" : "ko")}
            aria-label={promptLang === "ko" ? "영어로 보기" : "한국어로 보기"}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card cursor-pointer"
          >
            <LanguagesIcon className="w-3.5 h-3.5" />
            {promptLang === "ko" ? "English" : "한국어"}
          </button>
        </div>
        <div className="space-y-2">
          {EXAMPLE_PROMPTS.map((p, i) => (
            <div key={i} className="bg-canvas border border-hairline rounded-md p-3 flex items-start justify-between gap-3">
              <p className="text-sm text-body-strong flex-1">{p[promptLang]}</p>
              <button
                onClick={() => copy(p[promptLang], i)}
                className="text-xs px-3 py-1 rounded-md border border-hairline hover:bg-surface-card cursor-pointer whitespace-nowrap"
              >
                {copied === i ? "복사됨" : "복사"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-3">연결이 제대로 되었나요?</h2>
        <ul className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <li key={i}>
              <label className="flex items-start gap-3 bg-surface-card rounded-md p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={(e) => {
                    const next = [...checked];
                    next[i] = e.target.checked;
                    setChecked(next);
                  }}
                  className="mt-1"
                />
                <span className={`text-sm ${checked[i] ? "line-through text-muted-text" : "text-body-strong"}`}>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        {checked.every(Boolean) && (
          <p className="mt-4 p-4 bg-success/10 text-success rounded-md text-sm font-semibold">
            ✓ 연결 완료 확인 — 이제 Lovable 채팅에서 백엔드 기능을 요청할 수 있습니다.
          </p>
        )}
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-3">연결이 안 될 때</h2>
        <div className="border border-hairline rounded-xl overflow-hidden bg-surface-card">
          {FAQS.map((f, i) => (
            <div key={i} className={i > 0 ? "border-t border-hairline" : ""}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer hover:bg-surface-soft"
                aria-expanded={openFaq === i}
              >
                <span className="text-body-strong font-medium">{f.q}</span>
                <span className="text-muted-text">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-sm text-body leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="mb-10 rounded-xl border border-coral/40 bg-coral/5 p-6">
        <p className="serif text-2xl mb-3">교사가 반드시 확인할 보안 사항</p>
        <ul className="space-y-1.5 text-sm text-body-strong mb-4">
          {[
            "실제 학생의 민감한 개인정보를 연습용 프로젝트에 입력하지 않기",
            "API 키를 채팅, 화면 코드, 공개 GitHub 저장소에 직접 넣지 않기",
            "Secret과 Edge Function을 사용해 서버 측에서 관리하기",
            "인증만 추가하고 끝내지 말고 사용자별 데이터 접근 권한도 설정하기",
            "교사·학생·관리자 역할에 따른 권한을 테스트하기",
            "공개 배포 전 샘플 계정으로 접근 범위를 점검하기",
            "사용하지 않는 Connector와 권한은 해제하기",
          ].map((s) => (
            <li key={s} className="flex gap-2"><span className="text-coral">●</span><span>{s}</span></li>
          ))}
        </ul>
        <p className="text-sm bg-canvas rounded-md p-3 text-body-strong">
          ⚠ Supabase 연결 자체가 데이터 보안을 자동으로 완성해 주지 않습니다. 인증, 권한, 데이터베이스 정책을 별도로 확인해야 합니다.
        </p>
      </section>

      {/* Glossary */}
      <section className="mb-10">
        <h2 className="serif text-2xl mb-3">용어 도움말</h2>
        <dl className="grid sm:grid-cols-2 gap-3">
          {GLOSSARY.map(([term, def]) => (
            <div key={term} className="bg-surface-card rounded-md p-3">
              <dt className="text-sm font-semibold text-ink">{term}</dt>
              <dd className="text-sm text-body mt-0.5">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="text-sm">
        <Link to="/modules/$slug" params={{ slug: "09-backend" }} className="text-coral hover:text-coral-active">
          ← 백엔드 모듈로 돌아가기
        </Link>
      </div>

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setZoom(null)}
            className="absolute top-4 right-4 text-white text-sm bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 cursor-pointer"
            aria-label="닫기"
          >
            닫기 ✕
          </button>
          <img
            src={zoom.url}
            alt={zoom.alt}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
