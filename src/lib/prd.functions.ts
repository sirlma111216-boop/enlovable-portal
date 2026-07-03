import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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

export const upgradePrd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as UpgradePrdInput)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const userPrompt = `모듈 2에서 가져온 배경 맥락 (그대로 반복하지 말고 의미만 반영):
${JSON.stringify(data.module2Context, null, 2)}

교사가 직접 작성한 PRD 원본 (이것이 최우선 진실이다):
${JSON.stringify(data.teacherPrd, null, 2)}

위 내용을 바탕으로 지정된 구조의 한국어 Markdown PRD를 작성해 주세요. 교사가 요청하지 않은 기능을 추가하지 마세요. 정보가 부족한 항목은 "추후 결정" 또는 "확인 필요"로 표시하세요.`;

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return { markdown: text };
  });
