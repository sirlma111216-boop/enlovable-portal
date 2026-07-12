import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import {
  courseMeta,
  phases,
  modules,
  learningPrinciples,
  coreMessages,
  moduleBySlug,
} from "@/data/course";
import { useProgress } from "@/hooks/use-progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "내 수업에 코딩 한 스푼 — 연수 포털" },
      { name: "description", content: "AI와 함께 만드는 교사의 수업 도구. 6시간 바이브코딩 연수 포털." },
      { property: "og:title", content: "내 수업에 코딩 한 스푼" },
      { property: "og:description", content: "AI와 함께 만드는 교사의 수업 도구" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { percent, completedCount, total, nextUnfinishedSlug, state, isComplete } =
    useProgress();
  const lastVisited = state.lastVisited ? moduleBySlug(state.lastVisited) : null;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      {/* HERO */}
      <section className="mb-16">
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-text font-medium spike">
            {courseMeta.category}
          </p>
          <a
            href="https://labbitory.com/lecture-teacher"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center px-4 py-2 rounded-pill bg-coral text-white text-sm font-medium hover:bg-coral-active transition-colors"
          >
            labbitory.com
          </a>
        </div>
        <h1 className="serif text-5xl sm:text-7xl leading-[1.05] mb-4">
          {courseMeta.title}
        </h1>
        <p className="serif text-xl sm:text-2xl text-body-strong mb-6">
          {courseMeta.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="px-3 py-1 rounded-pill bg-surface-card text-xs font-medium">
            {courseMeta.duration}
          </span>
          <span className="px-3 py-1 rounded-pill bg-surface-card text-xs font-medium">
            강사 {courseMeta.instructor}
          </span>
          <span className="px-3 py-1 rounded-pill bg-surface-card text-xs font-medium">
            {courseMeta.dateShort}
          </span>
        </div>

        <p className="text-lg leading-relaxed text-body max-w-2xl mb-8">
          개발자가 되는 연수가 아닙니다. AI와 함께 내 수업의 병목을 찾고, 실제로
          작동하는 수업 도구를 설계하고 만드는 연수입니다.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/modules/$slug"
            params={{ slug: "01-vibe-coding" }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-coral text-white font-medium hover:bg-coral-active transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            연수 시작하기
          </Link>
          <Link
            to="/modules/$slug"
            params={{ slug: nextUnfinishedSlug }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-hairline text-ink font-medium hover:bg-surface-card transition-colors"
          >
            <Play className="w-4 h-4" />
            이어서 학습하기
          </Link>
        </div>
      </section>

      {/* Continue / Progress card */}
      <section className="mb-16">
        <div className="bg-surface-card rounded-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">
                나의 학습
              </p>
              <h2 className="serif text-2xl">
                {completedCount === 0
                  ? "아직 시작 전이에요"
                  : completedCount === total
                    ? "모든 모듈을 완료했습니다 🎉"
                    : `${completedCount} / ${total} 모듈 완료`}
              </h2>
            </div>
            <span className="serif text-4xl text-coral">{percent}%</span>
          </div>
          <div className="h-2 bg-hairline rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-coral transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          {lastVisited ? (
            <div className="text-sm text-body">
              마지막 학습:{" "}
              <Link
                to="/modules/$slug"
                params={{ slug: lastVisited.slug }}
                className="text-coral hover:text-coral-active font-medium"
              >
                Module {lastVisited.number}. {lastVisited.title} →
              </Link>
            </div>
          ) : (
            <Link
              to="/modules/$slug"
              params={{ slug: "01-vibe-coding" }}
              className="text-sm text-coral hover:text-coral-active font-medium"
            >
              첫 모듈부터 시작하기 →
            </Link>
          )}
        </div>
      </section>

      {/* Today's journey */}
      <section className="mb-16">
        <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2 spike">
          오늘의 여정
        </p>
        <h2 className="serif text-3xl sm:text-4xl mb-8">네 단계로 완성하는 6시간</h2>

        <ol className="space-y-4">
          {phases.map((phase) => {
            const phaseMods = modules.filter((m) => m.phase === phase.id);
            const phaseDone = phaseMods.filter((m) => isComplete(m.slug)).length;
            return (
              <li
                key={phase.id}
                className="bg-canvas border border-hairline rounded-lg p-6 hover:border-coral/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-baseline gap-4">
                    <span className="serif text-4xl text-coral">
                      {String(phase.id).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="serif text-2xl leading-tight">{phase.title}</h3>
                      <p className="text-sm text-muted-text mt-1">{phase.duration}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-text">
                    {phaseDone} / {phaseMods.length} 완료
                  </span>
                </div>
                <p className="text-body mb-4">{phase.outcome}</p>
                <div className="flex flex-wrap gap-2">
                  {phaseMods.map((m) => (
                    <Link
                      key={m.slug}
                      to="/modules/$slug"
                      params={{ slug: m.slug }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isComplete(m.slug)
                          ? "bg-coral/10 text-coral border border-coral/30"
                          : "bg-surface-card text-ink hover:bg-surface-cream-strong"
                      }`}
                    >
                      <span>{m.number}.</span>
                      <span>{m.title}</span>
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Core messages */}
      <section className="mb-16 grid md:grid-cols-2 gap-4">
        {coreMessages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-8 ${
              i === 0
                ? "bg-coral text-white"
                : "bg-surface-dark text-on-dark"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-70 font-medium mb-3">
              Core Message {i + 1}
            </p>
            <p className="serif text-2xl leading-snug">{msg}</p>
          </div>
        ))}
      </section>

      {/* Two outputs */}
      <section className="mb-16">
        <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2 spike">
          오늘 완성할 두 가지 산출물
        </p>
        <h2 className="serif text-3xl mb-8">완성 경험 두 번을 가져갑니다</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface-card rounded-lg p-8">
            <span className="inline-block px-3 py-1 rounded-pill bg-coral text-white text-[11px] uppercase tracking-widest font-medium mb-4">
              1차 산출물
            </span>
            <h3 className="serif text-2xl mb-3">AI 형성평가 피드백 도우미</h3>
            <p className="text-body leading-relaxed">
              공통 예제로 입력 → 분석 → 피드백 출력의 기본 흐름을 경험합니다.
            </p>
            <Link
              to="/modules/$slug"
              params={{ slug: "07-first-project" }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-coral font-medium hover:text-coral-active"
            >
              실습 시작 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-surface-dark text-on-dark rounded-lg p-8">
            <span className="inline-block px-3 py-1 rounded-pill bg-coral text-white text-[11px] uppercase tracking-widest font-medium mb-4">
              2차 산출물
            </span>
            <h3 className="serif text-2xl mb-3 text-on-dark">내 수업 도구 프로토타입</h3>
            <p className="text-on-dark-soft leading-relaxed">
              내 수업의 실제 병목을 해결하는 최소 기능 앱을 설계하고 만듭니다.
            </p>
            <Link
              to="/modules/$slug"
              params={{ slug: "11-classroom-project" }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-coral hover:text-white font-medium"
            >
              프로젝트 미션 <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Learning principles */}
      <section className="mb-16">
        <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2 spike">
          학습 원칙
        </p>
        <h2 className="serif text-3xl mb-8">다섯 가지 약속</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {learningPrinciples.map((p, i) => (
            <li
              key={i}
              className="flex gap-3 p-4 bg-surface-soft rounded-lg border border-hairline"
            >
              <span className="serif text-2xl text-coral leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-body-strong text-sm leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface-dark text-on-dark rounded-lg p-8 sm:p-12 text-center">
        <p className="serif text-2xl sm:text-3xl leading-snug mb-6">
          교사는 개발자가 되는 것이 아닙니다.
          <br />
          AI와 함께 내 수업을 설계하는 감각을 갖는 것입니다.
        </p>
        <Link
          to="/modules/$slug"
          params={{ slug: "01-vibe-coding" }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-coral text-white font-medium hover:bg-coral-active transition-colors"
        >
          첫 모듈로 시작하기 <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
