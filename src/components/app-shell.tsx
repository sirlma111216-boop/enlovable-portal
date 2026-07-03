import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Home, BookOpen, RotateCcw, Type, Printer, Play } from "lucide-react";
import { courseMeta, modules, phases } from "@/data/course";
import { useProgress } from "@/hooks/use-progress";
import { useFontSize } from "@/hooks/use-font-size";
import { SiteFooter } from "./site-footer";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cycle: cycleFont } = useFontSize();
  const { reset, percent, nextUnfinishedSlug } = useProgress();
  const location = useLocation();

  const handleReset = () => {
    if (confirm("진도와 모든 워크시트 임시 저장을 지웁니다. 계속할까요?")) reset();
  };

  return (
    <div className="min-h-screen bg-canvas text-body">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-hairline no-print">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <span className="spike serif text-lg">{courseMeta.title}</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="메뉴 열기"
            className="p-2 rounded-md hover:bg-surface-card"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 no-print"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-canvas border-r border-hairline overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-hairline">
              <span className="serif text-lg">{courseMeta.title}</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="메뉴 닫기"
                className="p-2 rounded-md hover:bg-surface-card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentPath={location.pathname}
              onNavigate={() => setMobileOpen(false)}
              percent={percent}
              nextSlug={nextUnfinishedSlug}
              onReset={handleReset}
              onFont={cycleFont}
            />
          </aside>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:w-80 lg:overflow-y-auto bg-canvas border-r border-hairline no-print">
          <Sidebar
            currentPath={location.pathname}
            percent={percent}
            nextSlug={nextUnfinishedSlug}
            onReset={handleReset}
            onFont={cycleFont}
          />
        </aside>

        <main className="flex-1 lg:ml-80 min-w-0 flex flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  currentPath,
  onNavigate,
  percent,
  nextSlug,
  onReset,
  onFont,
}: {
  currentPath: string;
  onNavigate?: () => void;
  percent: number;
  nextSlug: string;
  onReset: () => void;
  onFont: () => void;
}) {
  const { isComplete } = useProgress();

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <Link to="/" onClick={onNavigate} className="block">
          <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">
            {courseMeta.category}
          </p>
          <h2 className="serif text-2xl leading-tight">{courseMeta.title}</h2>
        </Link>
      </div>

      {/* Progress */}
      <div className="bg-surface-card rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-muted-text font-medium">
            진도
          </span>
          <span className="serif text-xl">{percent}%</span>
        </div>
        <div className="h-1.5 bg-hairline rounded-full overflow-hidden">
          <div
            className="h-full bg-coral transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <Link
          to="/modules/$slug"
          params={{ slug: nextSlug }}
          onClick={onNavigate}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-coral hover:text-coral-active font-medium"
        >
          <Play className="w-3.5 h-3.5" /> 이어하기
        </Link>
      </div>

      {/* Top actions */}
      <div className="flex flex-wrap gap-2 no-print">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md hairline hover:bg-surface-card"
        >
          <Home className="w-3.5 h-3.5" /> 홈
        </Link>
        <Link
          to="/resources"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md hairline hover:bg-surface-card"
        >
          <BookOpen className="w-3.5 h-3.5" /> 자료실
        </Link>
        <button
          onClick={onFont}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md hairline hover:bg-surface-card"
        >
          <Type className="w-3.5 h-3.5" /> 글자
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md hairline hover:bg-surface-card"
        >
          <Printer className="w-3.5 h-3.5" /> 인쇄
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md hairline hover:bg-surface-card text-error"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 초기화
        </button>
      </div>

      {/* Modules grouped by phase */}
      <nav aria-label="모듈 목록" className="flex flex-col gap-4">
        {phases.map((phase) => (
          <div key={phase.id}>
            <div className="flex items-baseline justify-between mb-2 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-text">
                Phase {phase.id}. {phase.title}
              </h3>
              <span className="text-xs text-muted-soft">{phase.duration}</span>
            </div>
            <ul className="flex flex-col">
              {phase.modules.map((n) => {
                const m = modules.find((x) => x.number === n)!;
                const href = `/modules/${m.slug}`;
                const active = currentPath === href;
                const done = isComplete(m.slug);
                return (
                  <li key={m.slug}>
                    <Link
                      to="/modules/$slug"
                      params={{ slug: m.slug }}
                      onClick={onNavigate}
                      className={`group flex items-start gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-surface-cream-strong text-ink"
                          : "hover:bg-surface-soft text-body"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[10px] font-medium ${
                          done
                            ? "bg-coral text-white"
                            : active
                              ? "bg-ink text-canvas"
                              : "bg-surface-card text-muted-text"
                        }`}
                      >
                        {done ? "✓" : m.number}
                      </span>
                      <span className="flex-1 leading-snug">
                        {m.title}
                        <span className="block text-xs text-muted-soft mt-0.5">
                          {m.duration}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <footer className="pt-4 border-t border-hairline text-xs text-muted-soft">
        강사 {courseMeta.instructor} · {courseMeta.dateShort}
      </footer>
    </div>
  );
}
