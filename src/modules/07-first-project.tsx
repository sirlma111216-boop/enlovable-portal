import { useMemo, useState } from "react";
import {
  X,
  ArrowRight,
  Copy,
  CheckCheck,
  ExternalLink,
  ChevronDown,
  PencilLine,
  Wand2,
  Rocket,
  ClipboardCheck,
} from "lucide-react";
import { moduleByNumber } from "@/data/course";
import { ModuleHeader, Section, KeyMessage, ModuleNavigation } from "@/components/module-ui";
import chatbotExample from "@/assets/ai-chatbot-example.png.asset.json";

const m = moduleByNumber(7)!;

const STEPS: Array<{ icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { icon: PencilLine, label: "수업 정보 입력" },
  { icon: Wand2, label: "영문 프롬프트 만들기" },
  { icon: Rocket, label: "Lovable에 붙여넣기" },
  { icon: ClipboardCheck, label: "예시 답변으로 테스트" },
];

const TIMELINE = [
  ["내 수업 정보 입력", "10분", "학교급, 교과, 학년, 학습 주제와 질문 방식을 정합니다."],
  ["영문 프롬프트 생성", "10분", "입력한 내용을 바탕으로 Lovable용 프롬프트를 만듭니다."],
  ["Lovable에서 앱 만들기", "25분", "생성된 프롬프트를 붙여 넣고 앱이 완성될 때까지 기다립니다."],
  ["예시 답변으로 테스트", "15분", "학생 답변을 입력하고 피드백이 만들어지는지 확인합니다."],
] as const;

const SCHOOL_LEVELS = ["초등학교", "중학교", "고등학교"] as const;
const QUESTION_TYPES = ["설명하기", "이유 말하기", "비교하기", "예측하기", "적용하기"] as const;

type SchoolLevel = (typeof SCHOOL_LEVELS)[number];
type QuestionType = (typeof QUESTION_TYPES)[number];

function buildPrompt(input: {
  level: SchoolLevel;
  subject: string;
  grade: string;
  topic: string;
  qtype: QuestionType;
}) {
  return `Create a simple Korean-language formative assessment feedback web app for a teacher.

Teaching context:
- School level: ${input.level}
- Subject: ${input.subject}
- Grade: ${input.grade}
- Learning topic: ${input.topic}
- Question type: ${input.qtype}

Important:
- All visible UI text, buttons, instructions, examples, and AI-generated feedback must be in Korean.
- Keep the app very simple and use only one page.
- Use Lovable AI to generate feedback.
- Do not ask for student names or personal information.

The app should show one formative assessment question based on the learning topic and question type.

The user flow must be:
Formative assessment question
→ anonymous student response
→ generate feedback
→ copy result

Include:
- one editable formative assessment question
- one student response text area
- a button labeled "예시 답변 넣기"
- a button labeled "피드백 만들기"
- a feedback result area
- a button labeled "결과 복사"

Generate feedback in only three short sections:
1. 잘한 점
2. 보완할 점
3. 다음 학습 한 가지

Keep each section concise and practical.

Show this notice:
"학생 실명과 개인정보를 입력하지 마세요. AI가 만든 피드백은 교사가 최종 확인해야 합니다."

Do not add:
- login
- database
- student accounts
- class management
- file upload
- ranking
- multiple pages
- complex settings

Make the layout clean, mobile-friendly, and easy for a teacher to use immediately.`;
}

const SUCCESS_ITEMS = [
  "앱 화면이 열린다.",
  "학생 답변을 입력할 수 있다.",
  "피드백이 세 영역으로 나온다.",
  "결과를 복사할 수 있다.",
];

const STUCK_SMALL_EXAMPLE =
  "예시 답변 넣기 버튼이 작동하지 않습니다. 다른 화면은 바꾸지 말고 이 버튼만 수정해줘.";
const STUCK_STRUCTURAL_EXAMPLE =
  "현재 앱 화면, 문제점, 원하는 흐름을 설명할 테니 Lovable에 붙여 넣을 수정 프롬프트를 작성해줘. 앱 UI는 한국어로 유지하고 다른 기능은 변경하지 않도록 해줘.";

export default function Mod07() {
  const [level, setLevel] = useState<SchoolLevel>("중학교");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [qtype, setQtype] = useState<QuestionType>("설명하기");

  const [prompt, setPrompt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const canGenerate =
    Boolean(level) && subject.trim() && grade.trim() && topic.trim() && Boolean(qtype);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  };

  const generate = () => {
    if (!canGenerate) {
      setError("학교급, 교과, 학년, 학습 주제와 질문 방식을 모두 입력해 주세요.");
      return;
    }
    setError(null);
    setGenerating(true);
    setPrompt(null);
    // 짧은 대기로 생성 감각 유지
    setTimeout(() => {
      setPrompt(
        buildPrompt({ level, subject: subject.trim(), grade: grade.trim(), topic: topic.trim(), qtype }),
      );
      setGenerating(false);
    }, 700);
  };

  const inputRow = "flex flex-col gap-2";
  const labelCls = "text-sm font-medium text-ink";
  const inputCls =
    "w-full px-3 py-2 rounded-md border border-hairline bg-canvas text-sm outline-none focus:border-coral";

  const promptCard = useMemo(() => {
    if (!prompt) return null;
    return (
      <div className="bg-surface-dark text-on-dark rounded-lg overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <span className="text-xs uppercase tracking-widest text-on-dark-soft font-medium">
            Lovable에 붙여 넣을 영문 프롬프트
          </span>
          <button
            onClick={() => copy("prompt", prompt)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-white/10"
          >
            {copied === "prompt" ? (
              <CheckCheck className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied === "prompt" ? "복사됨" : "복사"}
          </button>
        </div>
        <pre className="px-5 py-4 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap font-mono">
          {prompt}
        </pre>
      </div>
    );
  }, [prompt, copied]);

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <p className="serif text-3xl md:text-4xl leading-snug text-ink mb-2">
        첫 번째 완성 경험 — AI 형성평가 피드백 도우미
      </p>
      <p className="text-body mb-6">
        내 수업 정보를 입력하고, 영문 프롬프트를 만들어 Lovable에 붙여 넣어 보세요.
      </p>

      <KeyMessage>오늘은 잘 만드는 것보다 끝까지 완성하는 것이 목표입니다.</KeyMessage>

      {/* 4-step flow */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2 p-4 bg-surface-card rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="serif text-2xl text-coral">{i + 1}</span>
                <Icon className="w-5 h-5 text-coral" />
              </div>
              <p className="text-sm text-body-strong font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Timeline (no checkboxes) */}
      <Section title="60분 워크숍 타임라인">
        <ol className="space-y-3">
          {TIMELINE.map(([t, d, desc], i) => (
            <li key={t} className="flex gap-4 p-4 bg-surface-soft rounded-lg">
              <span className="serif text-3xl text-coral leading-none w-10 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h3 className="text-body-strong font-medium">{t}</h3>
                  <span className="text-xs text-muted-text">— {d}</span>
                </div>
                <p className="text-sm text-body">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Input + generate */}
      <Section>
        <div className="max-w-2xl mx-auto bg-canvas border-2 border-coral/30 rounded-lg p-6 sm:p-8">
          <h2 className="serif text-2xl mb-1">내 수업에 맞게 설정하기</h2>
          <p className="text-sm text-body mb-6">
            아래 내용을 입력하면 Lovable에 바로 붙여 넣을 영문 프롬프트를 만들어드립니다.
          </p>

          <div className="space-y-4">
            <div className={inputRow}>
              <label className={labelCls} htmlFor="f-level">학교급</label>
              <div id="f-level" className="flex flex-wrap gap-2">
                {SCHOOL_LEVELS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLevel(s)}
                    aria-pressed={level === s}
                    className={`px-3 py-1.5 rounded-pill text-sm border ${
                      level === s
                        ? "bg-coral text-white border-coral"
                        : "bg-canvas text-ink border-hairline hover:border-coral"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={inputRow}>
              <label className={labelCls} htmlFor="f-subject">교과</label>
              <input
                id="f-subject"
                type="text"
                placeholder="예: 과학"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className={inputRow}>
              <label className={labelCls} htmlFor="f-grade">학년</label>
              <input
                id="f-grade"
                type="text"
                placeholder="예: 중학교 2학년"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className={inputRow}>
              <label className={labelCls} htmlFor="f-topic">학습 주제</label>
              <input
                id="f-topic"
                type="text"
                placeholder="예: 전류와 전압의 관계"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className={inputRow}>
              <label className={labelCls} htmlFor="f-qtype">형성평가 질문 방식</label>
              <div id="f-qtype" className="flex flex-wrap gap-2">
                {QUESTION_TYPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQtype(s)}
                    aria-pressed={qtype === s}
                    className={`px-3 py-1.5 rounded-pill text-sm border ${
                      qtype === s
                        ? "bg-coral text-white border-coral"
                        : "bg-canvas text-ink border-hairline hover:border-coral"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-coral text-white text-base font-medium hover:bg-coral-active disabled:opacity-70"
            >
              <Wand2 className="w-4 h-4" />
              {generating ? "Lovable용 프롬프트를 만들고 있어요..." : "영문 프롬프트 만들기"}
            </button>
            <p className="text-xs text-muted-text text-center mt-2">
              프롬프트는 영어로 생성되지만, 완성되는 앱의 화면은 한국어입니다.
            </p>
            {error && (
              <p className="text-sm text-coral mt-3 text-center" role="alert">
                {error}
              </p>
            )}
          </div>

          {promptCard}

          {prompt && (
            <>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={generate}
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-surface-soft"
                >
                  다시 만들기
                </button>
                <a
                  href="https://lovable.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Lovable 열기
                </a>
              </div>
              <p className="text-xs text-muted-text mt-3">
                복사한 프롬프트를 Lovable의 새 프로젝트 입력창에 붙여 넣으세요.
              </p>
            </>
          )}
        </div>
      </Section>

      {/* Success criteria */}
      <Section title="이 네 가지만 되면 완성입니다">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SUCCESS_ITEMS.map((t, i) => (
            <div key={t} className="bg-surface-card rounded-lg p-5">
              <div className="serif text-3xl text-coral leading-none mb-2">{i + 1}</div>
              <p className="text-sm text-body-strong">{t}</p>
            </div>
          ))}
        </div>
        <p className="serif text-lg text-coral mt-5 text-center">
          디자인이 완벽하지 않아도 네 가지가 작동하면 오늘의 실습은 성공입니다.
        </p>
      </Section>

      {/* Stuck: 2 cards */}
      <Section title="막혔을 때">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg p-6 bg-surface-card">
            <h3 className="serif text-lg mb-2">작은 문제라면 Lovable에 바로 요청</h3>
            <p className="text-sm text-body mb-3">
              버튼이 안 눌리거나, 문구·색상·간격을 바꾸는 정도라면 화면을 캡처해 Lovable에 바로 요청하세요.
            </p>
            <pre className="bg-surface-dark text-on-dark rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono mb-3">
              {STUCK_SMALL_EXAMPLE}
            </pre>
            <button
              onClick={() => copy("stuck-small", STUCK_SMALL_EXAMPLE)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-coral text-white hover:bg-coral-active"
            >
              {copied === "stuck-small" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "stuck-small" ? "복사됨" : "예시 복사"}
            </button>
          </div>
          <div className="rounded-lg p-6 bg-surface-card">
            <h3 className="serif text-lg mb-2">구조를 바꿔야 한다면 AI 챗봇에 먼저 질문</h3>
            <p className="text-sm text-body mb-3">
              여러 기능을 바꾸거나 화면 흐름을 다시 설계해야 한다면, ChatGPT 같은 AI 챗봇에 현재 상황을 설명하고 Lovable용 프롬프트를 만들어 달라고 요청하세요.
            </p>
            <pre className="bg-surface-dark text-on-dark rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono mb-3">
              {STUCK_STRUCTURAL_EXAMPLE}
            </pre>
            <button
              onClick={() => copy("stuck-struct", STUCK_STRUCTURAL_EXAMPLE)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-coral text-white hover:bg-coral-active"
            >
              {copied === "stuck-struct" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "stuck-struct" ? "복사됨" : "예시 복사"}
            </button>
          </div>
        </div>
        <p className="text-sm text-body mt-4">
          첫 실습에서는 큰 수정에 도전하지 말고, 핵심 기능이 작동하면 다음 단계로 넘어가세요.
        </p>

        {/* Collapsed chatbot example image */}
        <div className="mt-6 border border-hairline rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowChat((v) => !v)}
            aria-expanded={showChat}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-ink hover:bg-surface-soft"
          >
            <span>복잡한 수정 요청 예시 보기</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showChat ? "rotate-180" : ""}`} />
          </button>
          {showChat && (
            <div className="p-4 border-t border-hairline">
              <p className="text-sm text-body mb-3">
                구조적인 수정이 필요할 때 다른 AI 챗봇에서 Lovable용 프롬프트를 작성받는 예시입니다.
              </p>
              <button
                type="button"
                onClick={() => setZoomed(true)}
                className="block w-full rounded-lg overflow-hidden border border-hairline hover:border-coral transition-colors cursor-zoom-in"
                aria-label="예시 이미지 확대"
              >
                <img
                  src={chatbotExample.url}
                  alt="AI 챗봇에서 Lovable용 프롬프트를 작성받는 대화 예시"
                  className="w-full h-auto block"
                />
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Resources shortcut */}
      <Section title="초간단 실습 자료">
        <a
          href="/resources"
          className="flex items-center justify-between gap-3 p-5 bg-ink text-canvas rounded-lg hover:bg-ink/90 transition-colors"
        >
          <div>
            <p className="serif text-xl">첫 번째 완성 경험 — 초간단 실습 자료</p>
            <p className="text-sm text-canvas/70 mt-1">
              입력 항목 안내 · 프롬프트 구조 · 성공 기준 · 막혔을 때 예시
            </p>
          </div>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </a>
      </Section>

      <ModuleNavigation module={m} />

      {zoomed && (
        <div
          className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-2 rounded-md bg-canvas text-ink text-sm font-medium"
            aria-label="닫기"
          >
            <X className="w-4 h-4" /> 닫기
          </button>
          <img
            src={chatbotExample.url}
            alt="AI 챗봇 예시 확대"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
