import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Copy, CheckCheck, Lightbulb, ChevronDown, Languages } from "lucide-react";
import { useState, type ReactNode } from "react";
import { moduleByNumber, type Module } from "@/data/course";
import { useProgress } from "@/hooks/use-progress";

// ===== Module header =====
export function ModuleHeader({ module }: { module: Module }) {
  return (
    <header className="mb-8">
      <nav aria-label="breadcrumb" className="mb-4 text-sm text-muted-text no-print">
        <Link to="/" className="hover:text-ink">홈</Link>
        <span className="mx-2 text-muted-soft">/</span>
        <span>Phase {module.phase}</span>
        <span className="mx-2 text-muted-soft">/</span>
        <span className="text-ink">Module {module.number}</span>
      </nav>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="inline-flex items-center px-3 py-1 rounded-pill bg-surface-card text-ink text-xs font-medium">
          Module {String(module.number).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-pill bg-surface-cream-strong text-ink text-xs font-medium">
          Phase {module.phase}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-pill hairline text-muted-text text-xs font-medium">
          {module.duration}
        </span>
      </div>
      <h1 className="serif text-4xl md:text-5xl leading-tight mb-4">{module.title}</h1>
      <p className="text-lg text-body max-w-3xl leading-relaxed">{module.summary}</p>
    </header>
  );
}

// ===== Section with title =====
export function Section({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-12 ${className}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2">
          {eyebrow}
        </p>
      )}
      {title && <h2 className="serif text-3xl mb-6">{title}</h2>}
      {children}
    </section>
  );
}

// ===== Learning objectives =====
export function LearningObjectives(_props: { items: string[] }) {
  return null;
}


// ===== Key message callout =====
export function KeyMessage({ children }: { children: ReactNode }) {
  return (
    <div className="bg-coral text-white rounded-lg p-8 my-8">
      <p className="text-xs uppercase tracking-widest font-medium opacity-80 mb-3">
        핵심 메시지
      </p>
      <p className="serif text-2xl md:text-3xl leading-snug">{children}</p>
    </div>
  );
}

// ===== Concept card =====
export function ConceptCard({
  title,
  children,
  tone = "cream",
}: {
  title: string;
  children: ReactNode;
  tone?: "cream" | "dark" | "soft";
}) {
  const cls =
    tone === "dark"
      ? "bg-surface-dark text-on-dark"
      : tone === "soft"
        ? "bg-surface-soft border border-hairline"
        : "bg-surface-card";
  return (
    <div className={`rounded-lg p-6 ${cls}`}>
      <h3 className={`serif text-xl mb-3 ${tone === "dark" ? "text-on-dark" : ""}`}>
        {title}
      </h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// ===== Copy block =====
// ko와 en을 모두 주면 한/영 전환 버튼이 생기고, 하나만 주면(또는 text만 주면) 단일 언어로 표시됩니다.
export function CopyBlock({
  label,
  text,
  ko,
  en,
  initial,
}: {
  label?: string;
  text?: string;
  ko?: string;
  en?: string;
  initial?: "ko" | "en";
}) {
  const koText = ko ?? (en === undefined ? text : undefined);
  const enText = en;
  const bilingual = koText !== undefined && enText !== undefined;
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">(
    initial ?? (koText !== undefined ? "ko" : "en"),
  );
  const shown = (lang === "ko" ? koText : enText) ?? koText ?? enText ?? "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <div className="bg-surface-dark text-on-dark rounded-lg overflow-hidden my-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/10">
        <span className="text-xs uppercase tracking-widest text-on-dark-soft font-medium">
          {label || "prompt"}
          {bilingual && (
            <span className="ml-2 normal-case tracking-normal text-on-dark-soft/80">
              · {lang === "ko" ? "한국어" : "English"}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {bilingual && (
            <button
              type="button"
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-white/10 transition-colors"
              aria-label={lang === "ko" ? "영어로 보기" : "한국어로 보기"}
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === "ko" ? "English" : "한국어"}
            </button>
          )}
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-white/10 transition-colors"
            aria-label="복사하기"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <pre className="px-5 py-4 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap font-mono">
        {shown}
      </pre>
    </div>
  );
}

// ===== Instructor tip =====
export function InstructorTip(_props: { children: ReactNode; title?: string }) {
  return null;
}


// ===== Practice panel =====
export function PracticePanel({
  title = "직접 해보기",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Section eyebrow={title}>
      <div className="bg-canvas border-2 border-coral/30 rounded-lg p-6">
        {children}
      </div>
    </Section>
  );
}

// ===== Warning callout =====
export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg my-4">
      <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
      <div className="text-sm text-body-strong">{children}</div>
    </div>
  );
}

// ===== Completion checklist =====
export function CompletionChecklist(_props: {
  storageKey: string;
  items: string[];
  title?: string;
}) {
  return null;
}


// ===== Module navigation (prev / complete / next) =====
export function ModuleNavigation({ module }: { module: Module }) {
  const { isComplete, toggleComplete } = useProgress();
  const prev = moduleByNumber(module.number - 1);
  const next = moduleByNumber(module.number + 1);
  const done = isComplete(module.slug);
  return (
    <nav
      aria-label="모듈 이동"
      className="mt-16 mb-8 pt-8 border-t border-hairline no-print grid sm:grid-cols-3 gap-3"
    >
      {prev ? (
        <Link
          to="/modules/$slug"
          params={{ slug: prev.slug }}
          className="flex items-center gap-2 p-4 rounded-lg hairline hover:bg-surface-card transition-colors"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-muted-text">이전</div>
            <div className="text-sm font-medium text-ink truncate">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      <button
        onClick={() => toggleComplete(module.slug)}
        className={`flex items-center justify-center gap-2 p-4 rounded-lg font-medium transition-colors ${
          done ? "bg-ink text-canvas" : "bg-coral text-white hover:bg-coral-active"
        }`}
      >
        <Check className="w-4 h-4" />
        {done ? "완료 표시 취소" : "완료 표시"}
      </button>
      {next ? (
        <Link
          to="/modules/$slug"
          params={{ slug: next.slug }}
          className="flex items-center justify-end gap-2 p-4 rounded-lg bg-surface-card hover:bg-surface-cream-strong text-ink transition-colors"
        >
          <div className="min-w-0 text-right">
            <div className="text-xs text-muted-text">다음</div>
            <div className="text-sm font-medium text-ink truncate">{next.title}</div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      ) : (
        <Link
          to="/resources"
          className="flex items-center justify-end gap-2 p-4 rounded-lg bg-surface-card hover:bg-surface-cream-strong text-ink transition-colors"
        >
          <div className="text-right">
            <div className="text-xs text-muted-text">다음</div>
            <div className="text-sm font-medium text-ink">자료실로 이동</div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      )}
    </nav>
  );
}

export function PrivacyNote({ children }: { children?: ReactNode }) {
  return (
    <p className="text-xs text-muted-text bg-surface-soft border border-hairline rounded-md p-3 mt-2">
      🔒 {children || "학생 실명·연락처 등 개인정보는 입력하지 마세요. 이 워크시트의 내용은 브라우저(localStorage)에만 저장되며 외부로 전송되지 않습니다."}
    </p>
  );
}
