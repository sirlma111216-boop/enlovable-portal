// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    cloudflare: {
      // 생성되는 wrangler.json에 병합됨 — Workers AI 바인딩(Gemini 지역 차단 시 폴백용)
      // (래퍼의 TS 타입에는 wrangler 키가 없지만 nitro가 실제로 지원하므로 캐스트)
      wrangler: {
        ai: { binding: "AI" },
      },
    } as { nodeCompat?: boolean; deployConfig?: boolean },
  },
});
