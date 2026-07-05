import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, CheckCheck, ExternalLink, Search, Download, Printer, X, ImageIcon, FileText, Languages } from "lucide-react";
import chatbotExample from "@/assets/ai-chatbot-example.png.asset.json";
import {
  exampleTermsMarkdown,
  examplePrivacyMarkdown,
  downloadMarkdown,
} from "@/data/policies";
import { FOOTER_PROMPT, FOOTER_PROMPT_KO, EDIT_CHECKLIST, FINAL_CHECKLIST, attachInstructions } from "@/modules/12-policy-practice";

type Category =
  | "전체"
  | "첫 프로젝트"
  | "오류 수정"
  | "판단 도우미"
  | "PRD"
  | "백엔드"
  | "생성형 API"
  | "테스트"
  | "디지털 윤리";

const cats: Category[] = [
  "전체", "첫 프로젝트", "오류 수정", "판단 도우미", "PRD", "백엔드", "생성형 API", "테스트", "디지털 윤리",
];

type Resource = {
  id: string;
  title: string;
  when: string;
  category: Exclude<Category, "전체">;
  body: string;
  /** body의 언어. 기본값 "ko" */
  bodyLang?: "ko" | "en";
  /** body의 반대 언어 번역본. 있으면 카드에 한/영 전환 버튼이 표시됩니다. */
  translation?: string;
  moduleSlug?: string;
  moduleLabel?: string;
  bundle?: "feedback" | "simple" | "policy";
  filename?: string;
};

// ===== Module 7 bundle (AI 형성평가 피드백 도우미) =====
const M7_ERR_FEATURE = `The [feature name] is not working.

Current result: [describe what currently happens]
Expected result: [describe what should happen]

Find the smallest cause and fix only this issue. Do not change the design or unrelated features. Keep UI in Korean.`;

const M7_ERR_FEATURE_KO = `[기능 이름]이(가) 작동하지 않습니다.

현재 결과: [지금 어떻게 되는지 설명]
기대 결과: [어떻게 되어야 하는지 설명]

가장 작은 원인을 찾아 이 문제만 수정해줘. 디자인이나 관련 없는 기능은 바꾸지 마. UI는 한국어로 유지해줘.`;

const M7_ERR_RESULT = `The current result is incorrect or unclear.

Problem: [describe the incorrect result]
Expected result: [describe the correct result]

Fix only this part and test it again. Do not add new features. Keep UI in Korean.`;

const M7_ERR_RESULT_KO = `현재 결과가 잘못되었거나 명확하지 않습니다.

문제: [잘못된 결과 설명]
기대 결과: [올바른 결과 설명]

이 부분만 수정하고 다시 테스트해줘. 새 기능은 추가하지 마. UI는 한국어로 유지해줘.`;

const M7_ERR_FLOW = `Test the current core flow step by step:
formative assessment question → student response (or "예시 답변 넣기") → generate feedback → copy result

Identify the first step that fails. Explain the cause briefly. Fix only that problem and test the full flow again. Do not redesign. Keep UI in Korean.`;

const M7_ERR_FLOW_KO = `현재 핵심 흐름을 단계별로 테스트해줘:
형성평가 질문 확인 → 학생 답변 입력(또는 "예시 답변 넣기") → 피드백 만들기 → 결과 복사

가장 먼저 실패하는 단계를 찾고, 원인을 간단히 설명해줘. 그 문제만 수정한 뒤 전체 흐름을 다시 테스트해줘. 디자인은 다시 만들지 말고, UI는 한국어로 유지해줘.`;

const M7_CHATBOT_TEMPLATE = `현재 만들고 있는 앱: [앱의 이름과 목적]
현재 작동하는 기능: [정상 작동하는 기능]
현재 문제: [작동하지 않거나 어색한 부분]
원하는 사용자 흐름: [사용자가 어떤 순서로 이용해야 하는지]
추가하거나 변경할 기능: [수정할 기능]
유지해야 할 부분: [디자인, 기존 기능, 다른 페이지 등]
변경하면 안 되는 부분: [절대 건드리지 않아야 할 요소]
현재 오류 메시지: [오류 메시지가 있다면 입력]
첨부 자료: [화면 캡처, 오류 화면, 현재 코드 또는 설명]

요청: 위 내용을 바탕으로 Lovable에 그대로 붙여 넣을 수 있는 구체적인 영문 프롬프트를 작성해줘. 완성 앱의 모든 UI와 결과는 한국어로 만들도록 지시해줘.`;

const M7_CHATBOT_TEMPLATE_EN = `App I am building: [name and purpose of the app]
Features that currently work: [features working normally]
Current problem: [what is broken or awkward]
Desired user flow: [the order in which users should use the app]
Features to add or change: [features to modify]
Things to keep: [design, existing features, other pages, etc.]
Things that must not change: [elements that must never be touched]
Current error message: [paste the error message if any]
Attachments: [screenshots, error screens, current code, or descriptions]

Request: Based on the above, write a specific English prompt I can paste directly into Lovable. Instruct it to keep all UI and results of the finished app in Korean.`;

const M7_DECISION = `체크 항목:
- 여러 화면이 함께 바뀌어야 한다
- 새로운 기능을 추가해야 한다
- 사용자 흐름을 다시 설계해야 한다
- 백엔드나 데이터 저장 방식을 바꿔야 한다
- 현재 오류의 원인을 정확히 모르겠다
- Lovable에서 같은 수정을 두 번 이상 실패했다
- 요구사항이 길고 복잡하다

판단 결과:
- 0~1개 → Lovable에 바로 요청. 문제 화면을 캡처하고 수정 범위를 작게.
- 2~3개 → 먼저 AI 챗봇에서 요구사항을 정리한 뒤 Lovable에 입력.
- 4개 이상 → 구조적 수정. 현재 상태/원하는 구조/유지 조건을 정리해 AI 챗봇에서 Lovable용 프롬프트를 먼저 작성.`;

const SIMPLE_INPUTS = `1. 학교급 — 초등학교 / 중학교 / 고등학교
2. 교과 — 예: 과학
3. 학년 — 예: 중학교 2학년
4. 학습 주제 — 예: 전류와 전압의 관계
5. 형성평가 질문 방식 — 설명하기 / 이유 말하기 / 비교하기 / 예측하기 / 적용하기 (한 가지 선택)`;

const SIMPLE_PROMPT_STRUCTURE = `Create a simple Korean-language formative assessment feedback web app for a teacher.

Teaching context:
- School level: [학교급]
- Subject: [교과]
- Grade: [학년]
- Learning topic: [학습 주제]
- Question type: [질문 방식]

Important:
- All visible UI text must be in Korean.
- One page only. Use Lovable AI. No student names.

Flow: question → student response → generate feedback → copy result.

Include: one editable question, one response text area, "예시 답변 넣기", "피드백 만들기", feedback area, "결과 복사".

Feedback sections (only 3, concise): 1. 잘한 점 2. 보완할 점 3. 다음 학습 한 가지

Notice: "학생 실명과 개인정보를 입력하지 마세요. AI가 만든 피드백은 교사가 최종 확인해야 합니다."

Do not add: login, database, student accounts, class management, file upload, ranking, multiple pages, complex settings.`;

const SIMPLE_PROMPT_STRUCTURE_KO = `교사를 위한 간단한 한국어 형성평가 피드백 웹앱을 만들어줘.

수업 정보:
- 학교급: [학교급]
- 교과: [교과]
- 학년: [학년]
- 학습 주제: [학습 주제]
- 질문 방식: [질문 방식]

중요:
- 화면의 모든 문구는 한국어로 해줘.
- 한 페이지로만 만들고, Lovable AI를 사용하고, 학생 이름은 요구하지 마.

흐름: 질문 → 학생 답변 → 피드백 생성 → 결과 복사.

포함할 것: 수정 가능한 질문 1개, 답변 입력창 1개, "예시 답변 넣기", "피드백 만들기", 피드백 영역, "결과 복사".

피드백 구성 (3개만, 간결하게): 1. 잘한 점 2. 보완할 점 3. 다음 학습 한 가지

안내 문구: "학생 실명과 개인정보를 입력하지 마세요. AI가 만든 피드백은 교사가 최종 확인해야 합니다."

추가하지 말 것: 로그인, 데이터베이스, 학생 계정, 학급 관리, 파일 업로드, 순위표, 여러 페이지, 복잡한 설정.`;

const SIMPLE_SUCCESS = `1. 앱 화면이 열린다.
2. 학생 답변을 입력할 수 있다.
3. 피드백이 세 영역으로 나온다.
4. 결과를 복사할 수 있다.

디자인이 완벽하지 않아도 네 가지가 작동하면 오늘의 실습은 성공입니다.`;

const resources: Resource[] = [
  { id: "simple-inputs", title: "수업 정보 입력 항목 안내", when: "첫 번째 완성 경험을 시작할 때", category: "첫 프로젝트", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: SIMPLE_INPUTS },
  { id: "simple-prompt", title: "첫 프롬프트 — 초간단 피드백 앱 만들기", when: "새 프로젝트를 시작할 때", category: "첫 프로젝트", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: SIMPLE_PROMPT_STRUCTURE, bodyLang: "en", translation: SIMPLE_PROMPT_STRUCTURE_KO },
  { id: "simple-success", title: "실습 성공 기준 4개", when: "완성 여부를 판단할 때", category: "테스트", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: SIMPLE_SUCCESS },
  { id: "m7-err-feature", title: "오류 프롬프트 ① 기능이 작동하지 않을 때", when: "특정 버튼·기능이 안 될 때", category: "오류 수정", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: M7_ERR_FEATURE, bodyLang: "en", translation: M7_ERR_FEATURE_KO },
  { id: "m7-err-result", title: "오류 프롬프트 ② 결과가 이상할 때", when: "화면·AI 결과가 어색할 때", category: "오류 수정", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: M7_ERR_RESULT, bodyLang: "en", translation: M7_ERR_RESULT_KO },
  { id: "m7-err-flow", title: "오류 프롬프트 ③ 전체 흐름 순차 점검", when: "어디가 문제인지 모를 때", category: "오류 수정", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: M7_ERR_FLOW, bodyLang: "en", translation: M7_ERR_FLOW_KO },
  { id: "m7-decision", title: "수정 요청 판단 도우미 기준", when: "Lovable에 바로 vs 챗봇 먼저를 정할 때", category: "판단 도우미", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: M7_DECISION },
  { id: "m7-chatbot-template", title: "AI 챗봇에 설명할 때 사용하는 입력 템플릿", when: "구조적 수정을 챗봇에 정리해 넘길 때", category: "판단 도우미", moduleSlug: "07-first-project", moduleLabel: "Module 7", bundle: "feedback", body: M7_CHATBOT_TEMPLATE, translation: M7_CHATBOT_TEMPLATE_EN },

  {
    id: "prd-skeleton", title: "PRD 7요소 스켈레톤", when: "처음 PRD를 쓸 때", category: "PRD",
    moduleSlug: "08-prd-workshop", moduleLabel: "Module 8",
    body: `# PRD
- 앱 이름:
- 한 줄 개요:
- 주요 사용자:
- 해결할 교육 문제:
- 사용 상황:
- 핵심 기능 (최대 3): 1) 2) 3)
- 입력 / 처리 / 출력:
- 화면 구성:
- 하지 않을 기능:
- 개인정보·윤리 제한:
- 성공 기준:`,
  },
  {
    id: "prd-workshop-guide", title: "PRD 제작 실습 가이드", when: "PRD 워크숍 전 배경 지식을 정리할 때", category: "PRD",
    moduleSlug: "08-prd-workshop", moduleLabel: "Module 8",
    body: `# PRD 제작 실습 가이드

수업 문제를 앱의 요구사항으로 바꾸고, Lovable이 이해하기 쉬운 PRD로 정리하는 실습 자료입니다.

## 1. PRD란 무엇인가
- Product Requirements Document의 약자로, 만들려는 제품이 무엇인지 한 문서에 정리한 것입니다.
- 개발 지식보다 "무엇을, 누구를 위해, 왜 만드는가"를 분명히 하는 데 초점을 둡니다.

## 2. 모듈 2의 내용을 PRD에 반영하는 방법
- 모듈 2의 "반복되는 수업 문제" → PRD의 "해결하려는 문제"
- 모듈 2의 "학생이 막히는 지점" → PRD의 "주요 사용자와 상황"
- 모듈 2의 "기존 도구의 한계" → PRD의 "목표와 성공 기준"
- 원문을 그대로 붙이지 말고, 의미를 각 항목에 자연스럽게 녹여 넣습니다.

## 3. PRD 작성 질문 목록
1. 앱 이름과 한 줄 소개
2. 학교급·학년·교과·학습 주제
3. 해결하려는 수업 문제와 기대하는 변화
4. 주요 사용자와 첫 번째 할 일
5. 핵심 기능 (최대 3개) 및 사용 순서
6. 화면 구성과 사용자가 마지막에 얻는 결과
7. AI 기능 필요 여부와 역할
8. 데이터 저장 방식과 주의사항

## 4. 원본 보기 → AI 점검 → AI 업그레이드 흐름
- 원본: 교사가 직접 쓴 문장 그대로. 자유롭고 짧을 수 있음.
- AI 점검: 원본은 그대로 두고 잘된 점, 빠진 항목, 개인정보·윤리 위험만 짚어 줌. 점검 결과를 반영해 내용을 수정한 뒤 다시 점검받을 수 있음.
- AI 업그레이드: 같은 내용을 유지하되 사용자 흐름, 완료 조건, 화면 구성이 구체화됨.
- AI는 새로운 기능을 임의로 만들지 않고, 애매한 문장을 검증 가능한 요구사항으로 다듬습니다.

## 5. 좋은 MVP 기능을 고르는 기준
- 없으면 앱이 성립하지 않는가?
- 60분 안에 만들 수 있는가?
- 교사가 수업 중 실제로 사용할 것인가?
- 학생 개인정보 없이 동작하는가?

## 6. Lovable용 PRD의 기본 구성
1. 제품 개요  2. 문제  3. 목표  4. 주요 사용자
5. MVP 범위  6. 사용자 흐름  7. 핵심 기능 요구사항
8. 화면 구성  9. AI 기능  10. 데이터/백엔드
11. 개인정보  12. 디자인  13. 수용 기준  14. 제외 범위  15. 완료 기준

## 7. 개인정보와 AI 검토 원칙
- 학생 실명·연락처·민감 정보는 입력하지 않는다.
- 최소한의 데이터만 저장한다.
- 모든 AI 결과는 교사가 최종 검토한다.
- 실패 시 대체 흐름과 한국어 오류 메시지를 제공한다.

## 8. PRD 복사 및 Markdown 저장 방법
- 5단계(AI 업그레이드)에서 [PRD 복사하기]를 누르면 클립보드에 복사됩니다. Lovable 채팅창에 붙여 넣기만 하면 됩니다.
- [Markdown(.md)로 저장하기]를 누르면 \`앱이름_PRD.md\` 파일이 다운로드됩니다. UTF-8로 저장되어 한국어가 깨지지 않습니다.`,
  },
  {
    id: "backend-check", title: "백엔드가 필요한가? 6문항 체크", when: "프로젝트 초반에 빠르게 판단할 때", category: "백엔드",
    moduleSlug: "09-backend", moduleLabel: "Module 9",
    body: `1. 앱을 닫아도 기록이 남아야 하나요?
2. 여러 기기에서 같은 기록을 봐야 하나요?
3. 교사와 학생의 권한이 달라야 하나요?
4. 파일을 업로드해야 하나요?
5. API 키처럼 숨겨야 하는 정보가 있나요?
6. 여러 사용자가 같은 데이터를 사용하나요?

'예'가 0개 → 프론트엔드만 / 1~2개 (혼자만 저장) → localStorage / 그 외 → 백엔드 연결`,
  },
  {
    id: "ai-secure-prompt", title: "생성형 AI 보안·구현 프롬프트", when: "AI 기능을 안전하게 연결할 때", category: "생성형 API",
    moduleSlug: "10-generative-api", moduleLabel: "Module 10",
    body: `현재 앱에 생성형 AI 피드백 기능을 추가해줘.

보안: API 키는 서버 secret에만 두고 서버 함수에서 호출. 브라우저·localStorage에 절대 노출 금지.
AI 역할: 입력을 분석해 JSON {encouragement, strength, improvement, nextAction} 반환. 학생 단정 금지.
앱 동작: 로딩 표시, 실패 시 한국어 오류 + 다시 시도, JSON 검증, 모의 응답을 대체 흐름으로 유지.

먼저 구현 계획과 필요한 secret 이름을 설명한 뒤 구현하고, 정상/실패 흐름을 모두 테스트해줘.`,
    translation: `Add a generative AI feedback feature to the current app.

Security: keep the API key only in a server secret and call it from a server function. Never expose it to the browser or localStorage.
AI role: analyze the input and return JSON {encouragement, strength, improvement, nextAction}. Do not label the student.
App behavior: show a loading state; on failure show a Korean error message and a retry button; validate the JSON; keep the mock response as a fallback flow.

Explain the implementation plan and the required secret names first, then implement, and test both the success and failure flows.`,
  },
  {
    id: "ai-design-six", title: "좋은 AI 기능 설계 6요소", when: "AI 기능을 설계 단계에서 점검할 때", category: "생성형 API",
    moduleSlug: "10-generative-api", moduleLabel: "Module 10",
    body: `1. 입력이 분명한가?
2. AI의 역할이 한정되어 있는가?
3. 출력 형식이 고정되어 있는가?
4. 개인정보를 막는가?
5. 실패 시 대체 흐름이 있는가?
6. 최종 검토자가 교사인가?`,
  },
  {
    id: "test-cases", title: "공통 테스트 케이스", when: "공유 전 마지막 점검", category: "테스트",
    moduleSlug: "11-classroom-project", moduleLabel: "Module 11",
    body: `- 정상 입력 / 빈 입력 / 예상보다 긴 입력 / 모바일 화면 / 잘못된 입력 / AI·API 실패 또는 네트워크 실패`,
  },
  {
    id: "ethics-10", title: "공개 전 10문항 점검", when: "공유 링크를 만들기 직전", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12",
    body: `1. 학생 실명·민감정보 미요구
2. 필요 이상 데이터 미저장
3. API 키 비노출
4. 사용자 권한 확인
5. AI 결과 교사 검토
6. 실패·오류 상황 테스트
7. 저작권·출처 확인
8. 모바일·키보드 사용 확인
9. 학습 목표·기능 연결
10. 외부 공유 범위 확인`,
  },
  {
    id: "policy-terms-example", title: "이용약관_예시.md", when: "앱 공개 직전에 이용약관을 만들 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "이용약관_예시.md",
    body: exampleTermsMarkdown,
  },
  {
    id: "policy-privacy-example", title: "개인정보처리방침_예시.md", when: "앱 공개 직전에 개인정보처리방침을 만들 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "개인정보처리방침_예시.md",
    body: examplePrivacyMarkdown,
  },
  {
    id: "policy-edit-checklist", title: "문서 수정 체크리스트", when: "예시 파일을 내 앱에 맞게 다듬을 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "문서_수정_체크리스트.md",
    body: `# 문서 수정 체크리스트\n\n${EDIT_CHECKLIST.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n`,
  },
  {
    id: "policy-attach-guide", title: "Lovable 파일 첨부 방법", when: "수정한 두 파일을 Lovable에 보낼 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "Lovable_파일_첨부_방법.md",
    body: attachInstructions,
  },
  {
    id: "policy-footer-prompt", title: "공통 푸터 제작 프롬프트", when: "이용약관·개인정보처리방침을 첨부하고 푸터를 요청할 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "공통_푸터_제작_프롬프트.md",
    body: FOOTER_PROMPT, bodyLang: "en", translation: FOOTER_PROMPT_KO,
  },
  {
    id: "policy-final-check", title: "적용 후 최종 확인 체크리스트", when: "푸터 적용 결과를 점검할 때", category: "디지털 윤리",
    moduleSlug: "12-digital-ethics", moduleLabel: "Module 12", bundle: "policy", filename: "적용_후_최종_확인_체크리스트.md",
    body: `# 푸터 적용 후 확인할 것\n\n${FINAL_CHECKLIST.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n`,
  },
];

const docs: Array<[string, string]> = [
  ["Lovable 시작하기", "https://docs.lovable.dev/"],
  ["프롬프트 작성 모범 사례", "https://docs.lovable.dev/prompting"],
  ["Project knowledge", "https://docs.lovable.dev/features/knowledge"],
  ["GitHub 연결", "https://docs.lovable.dev/integrations/git"],
  ["Lovable Cloud / 백엔드", "https://docs.lovable.dev/features/cloud"],
  ["AI 통합과 secret 관리", "https://docs.lovable.dev/features/ai"],
  ["테스트", "https://docs.lovable.dev/features/testing"],
  ["배포(Publish)", "https://docs.lovable.dev/features/publishing"],
];

function ResourceCard({
  r,
  copiedId,
  onCopy,
}: {
  r: Resource;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  // 원문 언어 (기본 한국어)
  const baseLang = r.bodyLang ?? "ko";
  const [lang, setLang] = useState<"ko" | "en">(baseLang);
  const showingTranslation = lang !== baseLang && !!r.translation;
  const shown = showingTranslation ? r.translation! : r.body;

  return (
    <li className="bg-canvas border border-hairline rounded-lg p-5 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest font-medium text-coral">
          {r.category}
        </span>
        {r.moduleSlug && r.moduleLabel && (
          <Link
            to="/modules/$slug"
            params={{ slug: r.moduleSlug }}
            className="text-xs text-muted-text hover:text-ink"
          >
            {r.moduleLabel} →
          </Link>
        )}
      </div>
      <h3 className="serif text-xl mb-1">{r.title}</h3>
      <p className="text-xs text-muted-text mb-3">언제: {r.when}</p>
      <pre className="bg-surface-dark text-on-dark rounded-md p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto flex-1 mb-3 max-h-48">
        {shown}
      </pre>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCopy(r.id, shown)}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-coral text-white hover:bg-coral-active"
        >
          {copiedId === r.id ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedId === r.id ? "복사됨" : "복사하기"}
        </button>
        {r.translation && (
          <button
            onClick={() => setLang(lang === "ko" ? "en" : "ko")}
            aria-label={lang === "ko" ? "영어로 보기" : "한국어로 보기"}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "ko" ? "English" : "한국어"}
          </button>
        )}
        {r.filename && (
          <button
            onClick={() => downloadMarkdown(r.filename!, shown)}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card"
          >
            <Download className="w-3.5 h-3.5" /> .md 다운로드
          </button>
        )}
      </div>
    </li>
  );
}

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "자료실 — 내 수업에 코딩 한 스푼" },
      { name: "description", content: "연수에서 사용한 모든 복사 가능한 프롬프트, 체크리스트, 공식 문서 링크 모음." },
      { property: "og:title", content: "자료실" },
      { property: "og:description", content: "프롬프트·체크리스트·공식 문서 모음" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category>("전체");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const filtered = useMemo(
    () =>
      resources.filter(
        (r) =>
          (cat === "전체" || r.category === cat) &&
          (q.trim() === "" ||
            r.title.toLowerCase().includes(q.toLowerCase()) ||
            r.body.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, cat],
  );

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  const feedbackBundle = resources.filter((r) => r.bundle === "feedback");

  const bundleMarkdown = useMemo(() => {
    return `# AI 형성평가 피드백 도우미 — 실습 자료

> 첫 번째 완성 경험(초간단 앱)을 위한 프롬프트·성공 기준·오류 대응·판단 도우미 모음입니다.

${feedbackBundle
  .map((r) => `\n## ${r.title}\n\n_언제 쓰나요:_ ${r.when}\n\n\`\`\`\n${r.body}\n\`\`\`\n`)
  .join("\n")}
`;
  }, [feedbackBundle]);

  const policyBundle = resources.filter((r) => r.bundle === "policy");
  const policyBundleMarkdown = useMemo(() => {
    return `# 이용약관·개인정보처리방침과 푸터 제작 — 자료 묶음\n\n> 공개 웹앱에 정책 문서와 공통 푸터를 추가하는 실습 자료입니다.\n\n${policyBundle
      .map((r) => `\n## ${r.title}\n\n_언제 쓰나요:_ ${r.when}\n\n\`\`\`markdown\n${r.body}\n\`\`\`\n`)
      .join("\n")}\n`;
  }, [policyBundle]);

  const copyAllBundle = () => copy("bundle-all", bundleMarkdown);
  const copyPolicyBundle = () => copy("policy-all", policyBundleMarkdown);

  const downloadBundle = () => {
    const blob = new Blob([bundleMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AI_형성평가_피드백_도우미_실습자료.md";
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-3 spike">
        자료실
      </p>
      <h1 className="serif text-5xl mb-3">언제든 다시 꺼내 쓰세요</h1>
      <p className="text-body max-w-2xl mb-8">
        연수에서 사용한 모든 복사 가능한 프롬프트와 체크리스트, 그리고 공식 문서
        링크를 모았습니다.
      </p>

      {/* Feedback bundle actions */}
      <section className="mb-10 bg-surface-cream-strong rounded-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
          <div>
            <h2 className="serif text-2xl mb-1">AI 형성평가 피드백 도우미 실습 자료</h2>
            <p className="text-sm text-body">
              입력 항목 안내, 첫 프롬프트, 성공 기준, 오류 대응, 판단 도우미까지 한 번에 내려받으세요.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={copyAllBundle}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-coral text-white hover:bg-coral-active"
          >
            {copiedId === "bundle-all" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === "bundle-all" ? "복사됨" : "전체 복사"}
          </button>
          <button
            onClick={downloadBundle}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
          >
            <Download className="w-3.5 h-3.5" /> Markdown 다운로드
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-canvas"
          >
            <Printer className="w-3.5 h-3.5" /> 인쇄
          </button>
          <Link
            to="/modules/$slug"
            params={{ slug: "07-first-project" }}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-canvas"
          >
            실습 페이지로 이동 →
          </Link>
          <button
            onClick={() => setZoomed(true)}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-canvas"
          >
            <ImageIcon className="w-3.5 h-3.5" /> AI 챗봇 예시 이미지
          </button>
        </div>
      </section>

      {/* Policy bundle actions */}
      <section className="mb-10 bg-surface-cream-strong rounded-lg p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
          <div>
            <h2 className="serif text-2xl mb-1">이용약관·개인정보처리방침과 푸터 제작</h2>
            <p className="text-sm text-body">
              공개 웹앱에 정책 문서와 공통 푸터를 추가하는 실습 자료입니다.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={copyPolicyBundle}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-coral text-white hover:bg-coral-active"
          >
            {copiedId === "policy-all" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === "policy-all" ? "복사됨" : "전체 복사"}
          </button>
          <button
            onClick={() => downloadMarkdown("이용약관·개인정보처리방침_실습자료.md", policyBundleMarkdown)}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
          >
            <Download className="w-3.5 h-3.5" /> 전체 Markdown 다운로드
          </button>
          <Link
            to="/modules/$slug"
            params={{ slug: "12-digital-ethics" }}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-hairline hover:bg-canvas"
          >
            실습 페이지로 이동 →
          </Link>
        </div>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2">
          {policyBundle.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 bg-canvas border border-hairline rounded-md px-3 py-2">
              <span className="text-sm text-ink truncate">
                <FileText className="w-3.5 h-3.5 inline mr-1 text-coral" />
                {r.title}
              </span>
              <button
                onClick={() => r.filename && downloadMarkdown(r.filename, r.body)}
                className="text-xs px-2 py-1 rounded border border-hairline hover:bg-surface-card shrink-0"
                aria-label={`${r.title} Markdown 다운로드`}
              >
                <Download className="w-3 h-3 inline mr-1" />.md
              </button>
            </li>
          ))}
        </ul>
      </section>



      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="자료 검색"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-hairline bg-canvas outline-none focus:border-coral text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-8">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`text-sm px-3 py-1.5 rounded-md ${
              cat === c
                ? "bg-surface-cream-strong text-ink font-medium"
                : "text-muted-text hover:bg-surface-card"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-text bg-surface-soft rounded-lg p-10">
          해당하는 자료가 없습니다.
        </p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4 mb-16">
          {filtered.map((r) => (
            <ResourceCard key={r.id} r={r} copiedId={copiedId} onCopy={copy} />
          ))}
        </ul>
      )}

      <section className="bg-surface-dark text-on-dark rounded-lg p-8">
        <p className="text-xs uppercase tracking-widest opacity-70 font-medium mb-3">
          공식 문서에서 다시 확인하기
        </p>
        <h2 className="serif text-3xl mb-4 text-on-dark">최신 정보는 항상 공식 문서</h2>
        <p className="text-on-dark-soft text-sm mb-6">
          서비스의 기능·화면·요금은 변경될 수 있으므로 실제 사용 전 공식 문서를
          확인하세요.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {docs.map(([t, href]) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-md bg-surface-dark-elevated hover:bg-white/10 transition-colors"
              >
                <span className="text-on-dark text-sm">{t}</span>
                <ExternalLink className="w-3.5 h-3.5 text-on-dark-soft" />
              </a>
            </li>
          ))}
        </ul>
      </section>

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
            alt="AI 챗봇에서 Lovable용 영문 프롬프트를 정리하는 대화 예시"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
