import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export type UpgradePrdInput = {
  module2Context: {
    repeatTime: string;
    studentStuck: string;
    toolGap: string;
  };
  teacherPrd: Record<string, unknown>;
};

const SYSTEM_PROMPT = `You are an educational product designer who converts a teacher's rough app idea into a clear, implementation-ready PRD for Lovable.

Use the teacher's answers as the primary source of truth. Use the imported Module 2 content only as background context. Do not paste the Module 2 content as a separate raw section. Instead, reflect its meaning in the relevant PRD sections such as the problem, users, goals, core features, user flow, and success criteria. If the teacher edited information after importing Module 2, prioritize the teacher's latest edited version.

Rules:
- Preserve the teacher's original educational intention.
- Do not invent new features, users, integrations, or data requirements.
- Keep the MVP focused on no more than three core features.
- Convert vague expressions into clear and testable requirements.
- Clearly separate input, processing, and output.
- Define a simple user flow.
- Include screen structure and button behavior.
- Include acceptance criteria that can be tested.
- Include privacy, AI review, and educational safety requirements.
- Mark missing information as "추후 결정" or "확인 필요".
- Require all visible app UI, labels, buttons, instructions, examples, error messages, and AI-generated results to be in Korean.
- Write the final result in Korean Markdown.
- Do not wrap the whole result in a code fence.

Use this exact structure (Korean headings):

# [프로젝트 이름] PRD

## 1. 제품 개요
- 한 줄 설명
- 사용 환경

## 2. 해결하려는 문제
- 현재 문제
- 이 문제가 중요한 이유

## 3. 목표
- 앱을 통해 달성할 변화

## 4. 주요 사용자
- 주요 사용자
- 사용 상황

## 5. MVP 범위
- 이번 버전에서 구현할 핵심 기능
- 이번 버전에서 구현하지 않을 기능

## 6. 사용자 흐름
1.
2.
3.

## 7. 핵심 기능 요구사항
### 기능 1
- 목적
- 입력
- 처리
- 출력
- 버튼 또는 상호작용
- 완료 조건
### 기능 2
(동일 형식)
### 기능 3
(동일 형식)

## 8. 화면 구성
- 화면 또는 영역
- 표시할 정보
- 주요 버튼
- 사용자의 행동

## 9. AI 기능
- AI가 수행할 작업
- AI에게 제공되는 입력
- AI가 생성하는 결과
- 교사 검토 방식
- AI가 해서는 안 되는 일

## 10. 데이터와 백엔드
- 저장할 데이터
- 저장 방식
- 로그인 필요 여부
- 백엔드 필요 여부

## 11. 개인정보와 디지털 윤리
- 입력하면 안 되는 정보
- 사용자 권한
- AI 결과 검토
- 공개 전 확인 사항

## 12. 디자인 요구사항
- 언어
- 화면 분위기
- 모바일 대응
- 접근성

## 13. 수용 기준
- 사용자가 [행동]하면 [결과]가 나타난다.
- 필수 입력이 없으면 한국어 안내 메시지가 표시된다.
- 핵심 기능이 모바일에서도 작동한다.
- 요청하지 않은 기능은 표시되지 않는다.

## 14. 제외 범위
- 이번 버전에서 만들지 않을 기능

## 15. 완료 기준
- Lovable에서 MVP가 완성되었다고 판단할 조건`;

// 외부 Gemini API를 사용합니다.
// 로컬: .env.local의 GEMINI_API_KEY / 배포: Cloudflare Variables & Secrets에 등록
const DEFAULT_PRD_MODEL = "gemini-3.1-flash-lite";

// 이 API 키(무료 등급)에서 무료 할당량이 0이라 항상 429가 나는 모델들.
// GEMINI_MODEL 환경변수가 이 중 하나로 잘못 설정돼 있어도 무시하고 안전한 기본값을 씁니다.
// (예전에 Cloudflare에 GEMINI_MODEL=gemini-3.5-flash를 넣어둔 경우 대비)
const QUOTA_ZERO_MODELS = new Set([
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
]);

function resolveModelId(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel && !QUOTA_ZERO_MODELS.has(envModel)) return envModel;
  return DEFAULT_PRD_MODEL;
}

function createPrdModel() {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("Missing GEMINI_API_KEY");
  const gemini = createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: geminiKey,
  });
  return gemini(resolveModelId());
}

// 에러 객체(중첩 포함)에서 원인 문자열을 수집합니다.
// AI SDK는 원인을 lastError/cause/errors에 중첩해 담고, 상태코드는 statusCode에 있습니다.
function collectErrorDetail(e: unknown): string {
  const parts: string[] = [];
  const collect = (o: unknown, depth = 0) => {
    if (o == null || depth > 5) return;
    if (typeof o === "string") {
      parts.push(o);
      return;
    }
    const r = o as Record<string, unknown>;
    if (typeof r.name === "string") parts.push(`name=${r.name}`);
    if (typeof r.message === "string") parts.push(r.message);
    if (r.statusCode != null) parts.push(`status=${r.statusCode}`);
    if (typeof r.responseBody === "string") parts.push(r.responseBody);
    collect(r.lastError, depth + 1);
    collect(r.cause, depth + 1);
    if (Array.isArray(r.errors)) r.errors.forEach((x) => collect(x, depth + 1));
    if (Array.isArray(r.data)) r.data.forEach((x) => collect(x, depth + 1));
  };
  collect(e);
  let detail = parts.filter(Boolean).join(" | ");
  if (!detail) {
    try {
      detail = `${String(e)} :: ${JSON.stringify(e, Object.getOwnPropertyNames((e as object) ?? {}))}`;
    } catch {
      detail = String(e);
    }
  }
  return detail;
}

// Gemini 무료 등급은 일부 지역(홍콩 등)에서 차단됩니다.
// Cloudflare Worker는 호출마다 다른 엣지 IP로 나가므로, 같은 요청이
// 어떤 때는 성공하고 어떤 때는 400 "User location is not supported"로 실패합니다.
// → 이 에러는 즉시 재시도하면 다른 경로를 타면서 성공하는 경우가 많아 재시도 대상입니다.
function isRetryableDetail(detail: string): boolean {
  return /User location is not supported|FAILED_PRECONDITION|status=5\d\d|ECONNRESET|fetch failed|network/i.test(
    detail,
  );
}

// Cloudflare Workers AI 폴백.
// Gemini 무료/유료 등급 모두 홍콩 등 일부 지역에서는 사용이 불가한데,
// Cloudflare Worker의 아웃바운드 경로가 그 지역을 지나면 400으로 실패합니다.
// Workers AI는 Cloudflare 내부에서 실행되므로 지역 문제가 원천적으로 없습니다.
// (바인딩은 vite.config.ts의 nitro.cloudflare.wrangler.ai 로 주입됩니다.)
type WorkersAiBinding = {
  run: (
    model: string,
    options: { messages: { role: string; content: string }[]; max_tokens?: number },
  ) => Promise<{ response?: string }>;
};

async function runWorkersAiFallback(system: string, prompt: string): Promise<string> {
  // Cloudflare Workers 런타임에서만 존재하는 모듈 (로컬 dev에서는 실패 → 호출부에서 처리)
  // 문자열 변수로 지정해 TS/Vite의 정적 해석을 피합니다.
  const specifier = "cloudflare:workers";
  const mod = (await import(/* @vite-ignore */ specifier)) as {
    env?: Record<string, unknown>;
  };
  const ai = mod.env?.AI as WorkersAiBinding | undefined;
  if (!ai) throw new Error("Workers AI binding(AI)이 없습니다.");
  const res = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    max_tokens: 4096,
  });
  const text = (res?.response ?? "").trim();
  if (!text) throw new Error("Workers AI가 빈 응답을 반환했습니다.");
  return text;
}

// generateText를 지역차단·일시 오류 재시도와 함께 실행하고,
// Gemini가 끝내 실패하면 Workers AI로 폴백합니다.
async function runPrd(system: string, prompt: string): Promise<string> {
  const MAX_ATTEMPTS = 3;
  let lastDetail = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const model = createPrdModel();
      const { text } = await generateText({
        model,
        system,
        prompt,
        maxRetries: 0, // 재시도는 이 루프에서 직접 제어
      });
      if (text && text.trim()) return text;
      lastDetail = "empty response";
    } catch (e) {
      lastDetail = collectErrorDetail(e);
      console.error(`[PRD AI] attempt ${attempt}/${MAX_ATTEMPTS}:`, lastDetail.slice(0, 300));
      if (/quota|status=429|\b429\b|exceeded|resource_exhausted|rate.?limit|too many requests/i.test(lastDetail)) {
        throw new Error(
          "지금 AI 사용량이 몰려 잠시 한도(quota)에 걸렸습니다. 20~30초 후 [다시 시도]를 눌러 주세요.",
        );
      }
      if (!isRetryableDetail(lastDetail)) break; // 재시도해도 소용없는 오류
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }

  // Gemini가 지역 차단 등으로 끝내 실패 → Workers AI 폴백 (지역 무관)
  let fallbackDetail = "";
  try {
    const text = await runWorkersAiFallback(system, prompt);
    console.warn("[PRD AI] Gemini 실패 → Workers AI 폴백으로 생성함");
    return text;
  } catch (fe) {
    fallbackDetail = collectErrorDetail(fe);
    console.error("[PRD AI] 폴백 실패:", fallbackDetail.slice(0, 200));
  }

  if (/User location is not supported|FAILED_PRECONDITION/i.test(lastDetail)) {
    throw new Error(
      `AI 접속 경로가 일시 차단되었고 예비 AI도 실패했습니다. [다시 시도]를 눌러 주세요. (예비: ${fallbackDetail.slice(0, 120)})`,
    );
  }
  if (/timeout|abort|timed out/i.test(lastDetail)) {
    throw new Error("AI 응답이 지연되어 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.");
  }
  throw new Error(`AI 호출에 실패했습니다. 잠시 후 다시 시도해 주세요. (원인: ${lastDetail.slice(0, 160)})`);
}

const REVIEW_SYSTEM_PROMPT = `You are an experienced educational product mentor. A teacher has written a draft PRD for a small classroom web app that will be built with Lovable. Your job is to REVIEW the draft — do not rewrite it.

Rules:
- Never invent new features, users, or requirements. Respect the teacher's educational intention.
- Be specific: reference the teacher's own words when pointing something out.
- Evaluate whether the MVP is small enough: 3 or fewer core features, buildable in about 60 minutes.
- Check privacy and AI ethics: no student real names or sensitive data, teacher reviews all AI output, fallback behavior on failure.
- For every missing or vague item, turn it into ONE concrete question the teacher can answer in a sentence.
- Warm, encouraging Korean. The teacher is not a developer.
- Output Korean Markdown. Keep the whole review under 600 words. Do not wrap the result in a code fence.

Use this exact structure (Korean headings):

# PRD 점검 결과

## 총평
(2~3문장)

## 잘된 점
(2~4개 목록)

## 보완이 필요한 부분
(항목별로 "무엇이 — 왜 — 이렇게 보완" 형식의 목록)

## 개인정보·윤리 점검
(문제 없으면 "확인됨"과 근거 한 줄, 위험이 보이면 구체적으로)

## 업그레이드 전에 답해 볼 질문
(3~5개, 번호 목록)

## 준비도
(다음 중 하나만: "바로 업그레이드해도 좋습니다" / "몇 가지 보완 후 업그레이드를 권합니다" / "핵심 항목을 먼저 채워 주세요" — 이유 한 문장과 함께)`;

export const reviewPrd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as UpgradePrdInput)
  .handler(async ({ data }) => {
    const userPrompt = `모듈 2에서 가져온 배경 맥락:
${JSON.stringify(data.module2Context, null, 2)}

교사가 작성한 PRD 원본:
${JSON.stringify(data.teacherPrd, null, 2)}

위 PRD 초안을 지정된 구조로 점검해 주세요. PRD를 다시 써 주지 말고, 점검 결과만 한국어 Markdown으로 작성해 주세요.`;

    const markdown = await runPrd(REVIEW_SYSTEM_PROMPT, userPrompt);
    return { markdown };
  });

export const upgradePrd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as UpgradePrdInput)
  .handler(async ({ data }) => {
    const userPrompt = `모듈 2에서 가져온 배경 맥락 (그대로 반복하지 말고 의미만 반영):
${JSON.stringify(data.module2Context, null, 2)}

교사가 직접 작성한 PRD 원본 (이것이 최우선 진실이다):
${JSON.stringify(data.teacherPrd, null, 2)}

위 내용을 바탕으로 지정된 구조의 한국어 Markdown PRD를 작성해 주세요. 교사가 요청하지 않은 기능을 추가하지 마세요. 정보가 부족한 항목은 "추후 결정" 또는 "확인 필요"로 표시하세요.`;

    const markdown = await runPrd(SYSTEM_PROMPT, userPrompt);
    return { markdown };
  });
