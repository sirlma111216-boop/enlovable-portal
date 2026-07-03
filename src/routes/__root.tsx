import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/app-shell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="serif text-7xl">404</h1>
        <h2 className="mt-4 serif text-2xl">페이지를 찾을 수 없습니다</h2>
        <p className="mt-2 text-sm text-muted-text">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-coral px-5 py-2.5 text-sm font-medium text-white hover:bg-coral-active transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="serif text-2xl">페이지를 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm text-muted-text">
          잠시 후 다시 시도하거나 홈으로 돌아가 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-coral px-5 py-2.5 text-sm font-medium text-white hover:bg-coral-active"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="rounded-md border border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface-card"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "내 수업에 코딩 한 스푼 — AI디지털수업평가전문가연수" },
      {
        name: "description",
        content:
          "AI와 함께 만드는 교사의 수업 도구. 6시간 바이브코딩 교사 연수 포털 — 김도윤.",
      },
      { name: "author", content: "김도윤" },
      { property: "og:title", content: "내 수업에 코딩 한 스푼 — AI디지털수업평가전문가연수" },
      { property: "og:description", content: "Code Spoon Portal is a web application for the \"Coding Spoon in My Class\" training program." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "내 수업에 코딩 한 스푼 — AI디지털수업평가전문가연수" },
      { name: "description", content: "Code Spoon Portal is a web application for the \"Coding Spoon in My Class\" training program." },
      { name: "twitter:description", content: "Code Spoon Portal is a web application for the \"Coding Spoon in My Class\" training program." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/204be58c-2255-4fdc-8f94-c2d25f9ad001/id-preview-4a3b483e--5ed62606-74ca-4c13-8619-02d3b7802dd3.lovable.app-1782832776902.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/204be58c-2255-4fdc-8f94-c2d25f9ad001/id-preview-4a3b483e--5ed62606-74ca-4c13-8619-02d3b7802dd3.lovable.app-1782832776902.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
