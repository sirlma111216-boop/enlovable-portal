import { createServerFn } from "@tanstack/react-start";

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

// ============================================================
// AI 호출 — Vertex AI (Google Cloud)
//
// AI Studio용 API(generativelanguage.googleapis.com)는 호출자 IP의 지역을
// 검사해서, Cloudflare Worker가 차단 지역(홍콩 등)을 경유하면 400으로
// 실패했습니다(유료 등급도 동일). Vertex AI(aiplatform.googleapis.com)는
// GCP 기업용 API라 호출자 위치 검사가 없어 이 문제가 구조적으로 없습니다.
//
// 프로덕션: GCP_SERVICE_ACCOUNT(서비스 계정 JSON, Cloudflare Secret)로
//           OAuth 토큰을 발급받아 Vertex AI 호출
// 로컬 dev: GCP_SERVICE_ACCOUNT가 없으면 GEMINI_API_KEY로 AI Studio
//           엔드포인트 사용 (한국에서는 지역 문제 없음)
// ============================================================

const DEFAULT_PRD_MODEL = "gemini-2.5-flash-lite";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

// 액세스 토큰 캐시 (Worker isolate 생존 동안 재사용, 만료 5분 전 갱신)
let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToBytes(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// 서비스 계정으로 OAuth2 액세스 토큰 발급 (JWT RS256 서명 → 토큰 교환)
async function getVertexAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 300 > now) return cachedToken.token;

  const enc = new TextEncoder();
  const header = base64UrlEncode(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = base64UrlEncode(
    enc.encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    ),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(sa.private_key).buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${header}.${claims}`)),
  );
  const jwt = `${header}.${claims}.${base64UrlEncode(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI 인증 토큰 발급에 실패했습니다. (${res.status}: ${t.slice(0, 160)})`);
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) };
  return json.access_token;
}

type GenerateContentResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  error?: { code?: number; message?: string; status?: string };
};

function extractText(json: GenerateContentResponse): string {
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((p) => p.thought !== true && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
}

// generateContent 공통 호출 (Vertex와 AI Studio가 같은 요청/응답 형식 사용)
async function callGenerateContent(
  url: string,
  headers: Record<string, string>,
  system: string,
  prompt: string,
): Promise<string> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
    } catch (e) {
      lastError = `network: ${String(e).slice(0, 160)}`;
      continue; // 네트워크 오류는 1회 재시도
    }
    const text = await res.text();
    if (res.ok) {
      try {
        const out = extractText(JSON.parse(text) as GenerateContentResponse);
        if (out) return out;
        lastError = "AI가 빈 응답을 반환했습니다.";
      } catch {
        lastError = "AI 응답을 해석하지 못했습니다.";
      }
      continue;
    }
    lastError = `HTTP ${res.status}: ${text.slice(0, 220)}`;
    console.error("[PRD AI]", lastError);
    if (res.status === 429) {
      throw new Error(
        "지금 AI 사용량이 몰려 잠시 한도(quota)에 걸렸습니다. 잠시 후 [다시 시도]를 눌러 주세요.",
      );
    }
    if (res.status < 500) break; // 4xx는 재시도 무의미
  }
  throw new Error(
    `AI 호출에 실패했습니다. 잠시 후 다시 시도해 주세요. (원인: ${lastError.slice(0, 180)})`,
  );
}

async function runPrd(system: string, prompt: string): Promise<string> {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_PRD_MODEL;

  const saRaw = process.env.GCP_SERVICE_ACCOUNT;
  if (saRaw) {
    let sa: ServiceAccount;
    try {
      sa = JSON.parse(saRaw) as ServiceAccount;
    } catch {
      throw new Error("GCP_SERVICE_ACCOUNT 값이 올바른 JSON 형식이 아닙니다.");
    }
    if (!sa.client_email || !sa.private_key || !sa.project_id) {
      throw new Error("GCP_SERVICE_ACCOUNT JSON에 필수 필드가 없습니다.");
    }
    const token = await getVertexAccessToken(sa);
    const url = `https://aiplatform.googleapis.com/v1/projects/${sa.project_id}/locations/global/publishers/google/models/${model}:generateContent`;
    return callGenerateContent(url, { Authorization: `Bearer ${token}` }, system, prompt);
  }

  // 로컬 개발 전용 경로 (배포 환경에는 GCP_SERVICE_ACCOUNT가 항상 존재)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GCP_SERVICE_ACCOUNT (로컬 개발은 GEMINI_API_KEY 필요)");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return callGenerateContent(url, { "x-goog-api-key": apiKey }, system, prompt);
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
