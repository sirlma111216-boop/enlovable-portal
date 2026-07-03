import { useEffect, useMemo, useState } from "react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  KeyMessage,
  ModuleNavigation,
  PracticePanel,
} from "@/components/module-ui";
import { Check, X, RotateCcw, ChevronRight, ChevronLeft, Info, Sparkles } from "lucide-react";

const m = moduleByNumber(4)!;

// ============================================================
// 1. Shared Tool Data Model
// ============================================================

type LearningPath = "easy" | "code" | "microsoft" | "google";
type Status = "ready" | "coming";
type PurposeTag =
  | "수업 자료"
  | "간단한 웹앱"
  | "AI 기능"
  | "완성형 웹앱"
  | "학교 업무 앱"
  | "업무 자동화"
  | "기존 코드 수정"
  | "배포·운영";

type Tool = {
  id: string;
  name: string;
  learningPath: LearningPath;
  status: Status;
  badge: string;
  oneLine: string;
  bestFor: string;
  difficulty: string;
  result: string;
  caution: string;
  ecosystem: ("canva" | "google" | "microsoft" | "any" | "github")[];
  codingLevel: 0 | 1 | 2 | 3 | 4; // 0=none .. 4=terminal
  aiCapability: 0 | 1 | 2 | 3; // 0=none .. 3=strong
  dataCapability: 0 | 1 | 2 | 3;
  automationCapability: 0 | 1 | 2 | 3;
  deploymentCapability: 0 | 1 | 2 | 3;
  sharingType: ("link" | "internal" | "public" | "domain")[];
  purposeTags: PurposeTag[];
  tags: string[];
  detailSummary: string;
  recommendedFor: string;
  learningPlan: string;
};

const PATH_LABEL: Record<LearningPath, string> = {
  easy: "쉽게 시작하기",
  code: "실제 코드로 발전시키기",
  microsoft: "Microsoft 365 앱 제작",
  google: "Google Workspace 앱 제작",
};

const TOOLS: Tool[] = [
  {
    id: "canva-code",
    name: "Canva Code",
    learningPath: "easy",
    status: "ready",
    badge: "입문",
    oneLine: "캔바 안에서 수업용 인터랙티브 콘텐츠와 간단한 위젯을 빠르게 만든다.",
    bestFor: "퀴즈, 개념 확인, 게임형 활동, 수업 자료용 미니 위젯",
    difficulty: "매우 쉬움",
    result: "캔바 자료 안에서 사용하는 인터랙티브 콘텐츠",
    caution: "복잡한 데이터 저장이나 완성형 서비스 제작에는 적합하지 않다.",
    ecosystem: ["canva", "any"],
    codingLevel: 0,
    aiCapability: 1,
    dataCapability: 0,
    automationCapability: 0,
    deploymentCapability: 1,
    sharingType: ["link"],
    purposeTags: ["수업 자료", "간단한 웹앱"],
    tags: ["수업 자료", "빠른 제작", "노코드", "간단한 상호작용"],
    detailSummary: "캔바 디자인 안에 삽입 가능한 소형 인터랙티브 요소를 대화형으로 만드는 도구입니다.",
    recommendedFor: "캔바로 수업 자료를 자주 만드는 선생님, 코딩 경험이 거의 없는 선생님.",
    learningPlan: "간단한 위젯 제작 → 퀴즈 활동 → 캔바 자료에 임베드",
  },
  {
    id: "claude-artifacts",
    name: "Claude Artifacts",
    learningPath: "easy",
    status: "ready",
    badge: "입문",
    oneLine: "Claude와 대화하며 작동하는 작은 앱, 시각화, 게임을 즉시 만든다.",
    bestFor: "단일 화면 앱, 개념 시뮬레이션, 분류 활동, 간단한 게임",
    difficulty: "매우 쉬움",
    result: "공유 가능한 단일 페이지 앱",
    caution: "회원 관리나 복잡한 데이터 저장이 필요한 서비스에는 한계가 있다.",
    ecosystem: ["any"],
    codingLevel: 0,
    aiCapability: 2,
    dataCapability: 0,
    automationCapability: 0,
    deploymentCapability: 1,
    sharingType: ["link"],
    purposeTags: ["수업 자료", "간단한 웹앱", "AI 기능"],
    tags: ["대화형 제작", "빠른 프로토타입", "미니앱", "시각화"],
    detailSummary: "Claude와의 대화 안에서 즉시 실행되는 작은 웹앱을 만들고 링크로 공유합니다.",
    recommendedFor: "빠르게 아이디어를 시각화하고 학생에게 보여주고 싶은 선생님.",
    learningPlan: "간단한 시뮬레이션 → 학습 게임 → 링크 공유",
  },
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    learningPath: "easy",
    status: "ready",
    badge: "입문",
    oneLine: "Gemini를 활용해 텍스트·이미지·파일을 분석하는 AI 기능 중심 앱을 만든다.",
    bestFor: "서술형 피드백, 이미지 분석, AI 챗봇, 생성형 AI 실험",
    difficulty: "쉬움",
    result: "Gemini 기능이 포함된 AI 프로토타입 또는 웹앱",
    caution: "공개 배포와 실제 운영 단계에서는 API와 사용량에 대한 이해가 필요하다.",
    ecosystem: ["google", "any"],
    codingLevel: 1,
    aiCapability: 3,
    dataCapability: 1,
    automationCapability: 1,
    deploymentCapability: 2,
    sharingType: ["link", "public"],
    purposeTags: ["AI 기능", "간단한 웹앱"],
    tags: ["Gemini", "생성형 AI", "이미지 분석", "피드백"],
    detailSummary: "Gemini 모델을 활용한 AI 기능을 실험하고 프로토타입 앱으로 확장합니다.",
    recommendedFor: "AI 피드백, 이미지 분석 등 생성형 AI 기능을 수업에 도입하고 싶은 선생님.",
    learningPlan: "프롬프트 실험 → AI 기능 설계 → 프로토타입 제작",
  },
  {
    id: "lovable",
    name: "Lovable",
    learningPath: "easy",
    status: "ready",
    badge: "입문",
    oneLine: "자연어 대화로 여러 화면과 기능을 갖춘 완성형 웹앱을 만들고 배포한다.",
    bestFor: "수업용 웹앱, 형성평가 앱, 교사 도구, 포트폴리오형 서비스",
    difficulty: "쉬움",
    result: "디자인과 배포 기능을 갖춘 완성형 웹앱",
    caution: "데이터베이스, 로그인, 외부 API를 추가할 때는 서비스 연결 구조를 이해해야 한다.",
    ecosystem: ["any"],
    codingLevel: 1,
    aiCapability: 2,
    dataCapability: 3,
    automationCapability: 2,
    deploymentCapability: 3,
    sharingType: ["link", "public", "domain"],
    purposeTags: ["완성형 웹앱", "AI 기능", "간단한 웹앱"],
    tags: ["완성형 웹앱", "디자인", "데이터베이스", "배포"],
    detailSummary: "PRD 작성 → 화면 → 기능 → 배포까지 한 도구에서 처리하는 완성형 웹앱 제작 도구입니다.",
    recommendedFor: "실제 학생/교사가 사용하는 완성도 있는 웹앱을 만들고 싶은 선생님.",
    learningPlan: "PRD 작성 → 화면 구성 → 데이터 연결 → 배포",
  },
  {
    id: "replit-agent",
    name: "Replit Agent",
    learningPath: "easy",
    status: "ready",
    badge: "입문+",
    oneLine: "브라우저 안에서 AI 에이전트와 함께 앱을 만들고 코드 확인과 배포까지 경험한다.",
    bestFor: "간단한 서비스, 학습용 미니앱, 코드가 포함된 웹 프로젝트",
    difficulty: "쉬움~보통",
    result: "코드와 실행 환경을 포함한 웹앱",
    caution: "복잡한 프로젝트에서는 생성된 코드와 실행 오류를 점검해야 한다.",
    ecosystem: ["any", "github"],
    codingLevel: 2,
    aiCapability: 2,
    dataCapability: 2,
    automationCapability: 2,
    deploymentCapability: 3,
    sharingType: ["link", "public"],
    purposeTags: ["간단한 웹앱", "완성형 웹앱"],
    tags: ["브라우저 개발", "코드 확인", "웹앱", "배포"],
    detailSummary: "브라우저 IDE에서 에이전트와 함께 코드까지 다루는 개발 경험을 제공합니다.",
    recommendedFor: "노코드에서 한 걸음 더 나아가 코드도 조금 다뤄보고 싶은 선생님.",
    learningPlan: "에이전트 프롬프트 → 코드 확인 → 실행/디버깅 → 배포",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    learningPath: "code",
    status: "coming",
    badge: "코드",
    oneLine: "AI 에이전트가 여러 파일과 개발 작업을 계획하고 수행하는 코드 워크스페이스.",
    bestFor: "기존 프로젝트 수정, 여러 기능 동시 개발, 코드 기반 앱 발전",
    difficulty: "보통",
    result: "코드를 직접 관리할 수 있는 개발 프로젝트",
    caution: "파일 구조, Git, 개발 작업 흐름에 대한 기본 이해가 필요하다.",
    ecosystem: ["github"],
    codingLevel: 3,
    aiCapability: 3,
    dataCapability: 2,
    automationCapability: 2,
    deploymentCapability: 2,
    sharingType: ["public", "domain"],
    purposeTags: ["기존 코드 수정", "완성형 웹앱"],
    tags: ["에이전트 코딩", "프로젝트 수정", "Git", "코드 개발"],
    detailSummary: "에이전트가 여러 파일을 함께 계획·수정하는 개발 워크스페이스입니다.",
    recommendedFor: "이미 만든 프로젝트를 코드 단위로 발전시키고 싶은 선생님.",
    learningPlan: "프로젝트 열기 → 다중 파일 편집 → Git 기반 협업",
  },
  {
    id: "codex",
    name: "Codex",
    learningPath: "code",
    status: "coming",
    badge: "코드",
    oneLine: "OpenAI의 코딩 에이전트를 활용해 기능 구현, 코드 수정, 검토 작업을 수행한다.",
    bestFor: "기능 추가, 오류 수정, 코드 검토, 저장소 기반 작업",
    difficulty: "보통",
    result: "수정되거나 발전된 코드 프로젝트",
    caution: "AI가 변경한 코드와 실행 결과를 사용자가 반드시 확인해야 한다.",
    ecosystem: ["github"],
    codingLevel: 3,
    aiCapability: 3,
    dataCapability: 2,
    automationCapability: 2,
    deploymentCapability: 2,
    sharingType: ["public", "domain"],
    purposeTags: ["기존 코드 수정"],
    tags: ["코딩 에이전트", "기능 구현", "코드 검토", "저장소"],
    detailSummary: "OpenAI의 코딩 에이전트로 저장소 단위 코드 작업을 수행합니다.",
    recommendedFor: "저장소 기반의 코드 검토와 기능 구현이 필요한 선생님.",
    learningPlan: "저장소 연결 → 작업 지시 → 변경 검토 → 반영",
  },
  {
    id: "cursor",
    name: "Cursor",
    learningPath: "code",
    status: "coming",
    badge: "코드",
    oneLine: "AI 기능이 통합된 코드 편집기에서 기존 코드를 직접 확인하고 수정한다.",
    bestFor: "기존 웹앱 수정, 코드 설명, 여러 파일 편집, 오류 해결",
    difficulty: "보통",
    result: "직접 편집하고 관리하는 코드 프로젝트",
    caution: "코드 편집기와 프로젝트 폴더 구조에 익숙해져야 한다.",
    ecosystem: ["github"],
    codingLevel: 3,
    aiCapability: 3,
    dataCapability: 2,
    automationCapability: 2,
    deploymentCapability: 2,
    sharingType: ["public", "domain"],
    purposeTags: ["기존 코드 수정"],
    tags: ["AI 코드 편집기", "기존 프로젝트", "오류 수정", "코드 학습"],
    detailSummary: "AI 기능이 통합된 코드 편집기로 기존 코드베이스를 이해하고 수정합니다.",
    recommendedFor: "코드를 직접 읽고 편집하며 AI 도움을 받고 싶은 선생님.",
    learningPlan: "프로젝트 열기 → 코드 이해 → 편집·리팩터링",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    learningPath: "code",
    status: "coming",
    badge: "코드",
    oneLine: "터미널에서 Claude와 대화하며 프로젝트의 코드를 수정하고 실행한다.",
    bestFor: "다중 파일 수정, Git 작업, 코드 점검, 반복 개발",
    difficulty: "보통~도전",
    result: "터미널과 Git으로 관리하는 실제 개발 프로젝트",
    caution: "터미널 명령어와 Git의 기본 개념이 필요하다.",
    ecosystem: ["github"],
    codingLevel: 4,
    aiCapability: 3,
    dataCapability: 2,
    automationCapability: 3,
    deploymentCapability: 2,
    sharingType: ["public", "domain"],
    purposeTags: ["기존 코드 수정"],
    tags: ["터미널", "코딩 에이전트", "Git", "다중 파일"],
    detailSummary: "터미널 환경에서 Claude와 함께 실제 개발 프로젝트를 관리합니다.",
    recommendedFor: "터미널과 Git이 익숙하고 본격 개발을 병행하려는 선생님.",
    learningPlan: "CLI 설치 → 프로젝트 작업 → Git 반영",
  },
  {
    id: "power-apps",
    name: "Power Apps",
    learningPath: "microsoft",
    status: "coming",
    badge: "업무앱",
    oneLine: "Microsoft 365 데이터를 활용해 교직원과 학생이 사용하는 학교 업무 앱을 만든다.",
    bestFor: "신청서, 기자재 대여, 상담 기록, 점검표, 시설 신고",
    difficulty: "쉬움~보통",
    result: "Microsoft 365 조직 안에서 사용하는 데이터 기반 앱",
    caution: "학교 계정의 라이선스, 관리자 설정, 데이터 연결 권한을 확인해야 한다.",
    ecosystem: ["microsoft"],
    codingLevel: 1,
    aiCapability: 1,
    dataCapability: 3,
    automationCapability: 2,
    deploymentCapability: 2,
    sharingType: ["internal"],
    purposeTags: ["학교 업무 앱"],
    tags: ["Microsoft 365", "학교 업무 앱", "SharePoint", "데이터 입력"],
    detailSummary: "SharePoint·Excel 데이터를 활용해 학교 조직 내부에서 쓰는 업무 앱을 만듭니다.",
    recommendedFor: "Microsoft 365를 사용하는 학교의 담당 교사/부장 선생님.",
    learningPlan: "데이터 준비 → 앱 화면 → 권한 설정 → 배포",
  },
  {
    id: "power-automate",
    name: "Power Automate",
    learningPath: "microsoft",
    status: "coming",
    badge: "자동화",
    oneLine: "Forms, Outlook, Teams, SharePoint 사이의 반복 업무를 자동으로 연결한다.",
    bestFor: "자동 알림, 승인 요청, 이메일 발송, 파일 저장과 분류",
    difficulty: "쉬움~보통",
    result: "조건에 따라 백그라운드에서 실행되는 자동화 흐름",
    caution: "독립된 앱 화면을 만드는 도구가 아니라 업무 흐름을 자동화하는 도구다.",
    ecosystem: ["microsoft"],
    codingLevel: 1,
    aiCapability: 1,
    dataCapability: 2,
    automationCapability: 3,
    deploymentCapability: 2,
    sharingType: ["internal"],
    purposeTags: ["업무 자동화"],
    tags: ["업무 자동화", "Teams", "Outlook", "승인", "알림"],
    detailSummary: "Microsoft 365 앱들 사이의 반복 작업을 자동화 흐름으로 연결합니다.",
    recommendedFor: "이메일·승인·알림 등 반복 업무를 자동화하고 싶은 선생님.",
    learningPlan: "트리거 설정 → 흐름 구성 → 알림·승인 연결",
  },
  {
    id: "ms365-integration",
    name: "Microsoft 365 통합 프로젝트",
    learningPath: "microsoft",
    status: "coming",
    badge: "통합",
    oneLine: "Power Apps, SharePoint, Power Automate를 연결해 실제 학교 업무 시스템을 완성한다.",
    bestFor: "시설 고장 신고, 기자재 대여, 연수 신청과 승인, 업무 요청 관리",
    difficulty: "보통",
    result: "입력 앱, 데이터 저장소, 알림과 승인 흐름이 연결된 시스템",
    caution: "학교 조직의 계정 정책과 사용 가능한 라이선스를 먼저 확인해야 한다.",
    ecosystem: ["microsoft"],
    codingLevel: 1,
    aiCapability: 1,
    dataCapability: 3,
    automationCapability: 3,
    deploymentCapability: 2,
    sharingType: ["internal"],
    purposeTags: ["학교 업무 앱", "업무 자동화"],
    tags: ["Power Apps", "Power Automate", "SharePoint", "통합 프로젝트"],
    detailSummary: "입력 앱 · 데이터 저장 · 자동 승인/알림이 연결된 통합 학교 업무 시스템 학습 경로입니다.",
    recommendedFor: "학교 내부에서 실제 업무 시스템을 도입·운영하려는 선생님.",
    learningPlan: "요구 정의 → 앱 제작 → 자동화 흐름 → 통합 운영",
  },
  {
    id: "appsheet",
    name: "AppSheet",
    learningPath: "google",
    status: "coming",
    badge: "업무앱",
    oneLine: "Google Sheets 등의 데이터를 연결해 코딩 없이 모바일·웹 업무 앱을 만든다.",
    bestFor: "상담 기록, 출결 확인, 기자재 관리, 체크리스트, 현장 기록",
    difficulty: "쉬움",
    result: "스프레드시트 데이터를 기반으로 작동하는 업무 앱",
    caution: "공유 범위와 고급 자동화 기능은 계정과 라이선스에 따라 달라질 수 있다.",
    ecosystem: ["google"],
    codingLevel: 0,
    aiCapability: 1,
    dataCapability: 3,
    automationCapability: 2,
    deploymentCapability: 2,
    sharingType: ["internal", "link"],
    purposeTags: ["학교 업무 앱"],
    tags: ["Google Workspace", "노코드", "Google Sheets", "업무 앱"],
    detailSummary: "Google Sheets를 데이터 원천으로 삼는 노코드 업무 앱 제작 도구입니다.",
    recommendedFor: "Google Workspace 환경에서 코딩 없이 업무 앱을 만들고 싶은 선생님.",
    learningPlan: "시트 준비 → 앱 구성 → 뷰/폼 설계 → 공유",
  },
  {
    id: "apps-script",
    name: "Apps Script",
    learningPath: "google",
    status: "coming",
    badge: "코드",
    oneLine: "JavaScript를 활용해 Google Sheets, Forms, Gmail, Drive 등의 작업을 자동화한다.",
    bestFor: "Forms 응답 처리, PDF 생성, 이메일 발송, 문서 자동화, 맞춤 웹앱",
    difficulty: "보통",
    result: "Google Workspace 자동화 또는 맞춤형 웹앱",
    caution: "코드, 계정 권한 승인, 실행 횟수와 사용량 제한을 이해해야 한다.",
    ecosystem: ["google"],
    codingLevel: 3,
    aiCapability: 2,
    dataCapability: 3,
    automationCapability: 3,
    deploymentCapability: 2,
    sharingType: ["internal", "link"],
    purposeTags: ["업무 자동화", "기존 코드 수정"],
    tags: ["Google Workspace", "JavaScript", "자동화", "맞춤 웹앱"],
    detailSummary: "Google Workspace의 반복 업무와 맞춤 기능을 JavaScript로 자동화합니다.",
    recommendedFor: "코드로 Google Workspace를 자동화하고 싶은 선생님.",
    learningPlan: "스크립트 작성 → 트리거 설정 → 배포",
  },
  {
    id: "google-integration",
    name: "Google Workspace 통합 프로젝트",
    learningPath: "google",
    status: "coming",
    badge: "통합",
    oneLine: "AppSheet, Google Sheets, Apps Script를 연결해 학교 업무 시스템을 완성한다.",
    bestFor: "신청 앱과 자동 알림, 기록 앱과 보고서 생성, 기자재 대여 시스템",
    difficulty: "보통",
    result: "입력 앱, 데이터 저장, 자동 처리가 연결된 Google 기반 시스템",
    caution: "Google 계정의 공유 권한과 학교 도메인 정책을 확인해야 한다.",
    ecosystem: ["google"],
    codingLevel: 2,
    aiCapability: 2,
    dataCapability: 3,
    automationCapability: 3,
    deploymentCapability: 2,
    sharingType: ["internal", "link"],
    purposeTags: ["학교 업무 앱", "업무 자동화"],
    tags: ["AppSheet", "Apps Script", "Google Sheets", "통합 프로젝트"],
    detailSummary: "AppSheet 입력·시트 저장·Apps Script 자동화를 연결한 통합 시스템 학습 경로입니다.",
    recommendedFor: "Google 환경에서 완결된 내부 업무 시스템을 만들고 싶은 선생님.",
    learningPlan: "시트 설계 → AppSheet 화면 → Apps Script 자동화 → 통합",
  },
];

// ============================================================
// 2. Small primitives & derivations
// ============================================================

function ToolBadge({ text, status }: { text: string; status: Status }) {
  const style =
    status === "ready"
      ? "bg-coral/10 text-coral"
      : "bg-surface-cream-strong text-muted-text";
  return (
    <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-pill ${style}`}>
      {text}
    </span>
  );
}

function getLevelLabel(tool: Tool): string {
  const override: Record<string, string> = {
    "claude-artifacts": "입문",
    "google-ai-studio": "초급",
    "lovable": "초급",
    "replit-agent": "중급",
    "cursor": "중급",
    "claude-code": "고급",
  };
  if (override[tool.id]) return override[tool.id];
  if (tool.codingLevel <= 0) return "입문";
  if (tool.codingLevel === 1) return "초급";
  if (tool.codingLevel <= 3) return "중급";
  return "고급";
}

function getCategoryLabel(tool: Tool): string {
  const override: Record<string, string> = {
    "claude-artifacts": "AI 프로토타이핑",
    "google-ai-studio": "AI 프로토타이핑",
    "lovable": "노코드 웹앱",
    "canva-code": "수업 콘텐츠 제작",
    "replit-agent": "노코드 웹앱",
    "antigravity": "코드 기반 개발",
    "codex": "코드 기반 개발",
    "cursor": "코드 기반 개발",
    "claude-code": "개발 환경",
    "power-apps": "노코드 웹앱",
    "power-automate": "자동화",
    "ms365-integration": "노코드 웹앱",
    "appsheet": "노코드 웹앱",
    "apps-script": "자동화",
    "google-integration": "노코드 웹앱",
  };
  return override[tool.id] ?? "노코드 웹앱";
}

const OFFICIAL_URLS: Record<string, string> = {
  "canva-code": "https://www.canva.com/",
  "claude-artifacts": "https://claude.ai/",
  "google-ai-studio": "https://aistudio.google.com/",
  "lovable": "https://lovable.dev/",
  "replit-agent": "https://replit.com/",
  "cursor": "https://cursor.com/",
  "claude-code": "https://www.anthropic.com/claude-code",
  "codex": "https://openai.com/",
  "power-apps": "https://powerapps.microsoft.com/",
  "power-automate": "https://powerautomate.microsoft.com/",
  "appsheet": "https://about.appsheet.com/",
  "apps-script": "https://script.google.com/",
};

// ============================================================
// 3. Tool Card — simplified
// ============================================================

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-5 hover:border-coral/40 transition-colors flex flex-col min-h-[220px]">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="serif text-xl leading-tight">{tool.name}</h3>
        <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-pill bg-coral/10 text-coral whitespace-nowrap">
          {getLevelLabel(tool)}
        </span>
      </div>
      <p className="text-sm text-body mb-4 leading-relaxed line-clamp-2">{tool.oneLine}</p>
      <div className="mb-4">
        <span className="text-[11px] px-2 py-0.5 rounded-pill bg-surface-card text-muted-text">
          {getCategoryLabel(tool)}
        </span>
      </div>
      <div className="mt-auto">
        <button
          onClick={() => onOpen(tool)}
          className="w-full h-10 text-sm font-medium px-3 rounded-md bg-ink text-canvas hover:bg-ink/90 transition-colors"
        >
          도구 소개 보기
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 4. Tool Detail Modal
// ============================================================

function ToolDetailModal({ tool, onClose }: { tool: Tool | null; onClose: () => void }) {
  useEffect(() => {
    if (!tool) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [tool, onClose]);

  if (!tool) return null;
  const officialUrl = OFFICIAL_URLS[tool.id];
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-canvas w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-pill bg-coral/10 text-coral">
                {getLevelLabel(tool)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-pill bg-surface-card text-muted-text">
                {getCategoryLabel(tool)}
              </span>
              {tool.status === "coming" && <ToolBadge text="준비 중" status="coming" />}
            </div>
            <h3 className="serif text-2xl">{tool.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-md hover:bg-surface-card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm text-body">
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">도구 소개</p>
            <p className="leading-relaxed">{tool.detailSummary}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">추천 대상</p>
            <p className="leading-relaxed">{tool.recommendedFor}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">잘 맞는 작업</p>
            <p className="leading-relaxed">{tool.bestFor}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">만들 수 있는 결과물</p>
            <p className="leading-relaxed">{tool.result}</p>
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">기본 사용 흐름</p>
            <p className="leading-relaxed">{tool.learningPlan}</p>
          </section>
          <section className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 bg-surface-card rounded-lg">
              <p className="text-xs uppercase tracking-widest text-muted-text mb-2">장점</p>
              <ul className="text-sm space-y-1 list-disc pl-4">
                {tool.tags.slice(0, 4).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-surface-card rounded-lg">
              <p className="text-xs uppercase tracking-widest text-muted-text mb-2">한계와 주의할 점</p>
              <p className="text-sm leading-relaxed">{tool.caution}</p>
            </div>
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-muted-text mb-1">관련 학습 내용</p>
            <p className="leading-relaxed">
              「{PATH_LABEL[tool.learningPath]}」 학습 경로에서 이 도구를 이어서 학습할 수 있습니다.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-hairline flex flex-wrap gap-2 justify-end">
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm font-medium px-4 py-2 rounded-md border border-hairline hover:bg-surface-card"
            >
              공식 사이트 보기
            </a>
          )}
          <button
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-md bg-ink text-canvas hover:bg-ink/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 5. Filters
// ============================================================

type PrimaryFilter = "all" | LearningPath;
type SecondaryFilter = "all" | PurposeTag;

const PRIMARY_TABS: { id: PrimaryFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "easy", label: "쉽게 시작하기" },
  { id: "code", label: "실제 코드로 발전시키기" },
  { id: "microsoft", label: "Microsoft 365 앱 제작" },
  { id: "google", label: "Google Workspace 앱 제작" },
];

const SECONDARY_CHIPS: { id: SecondaryFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "수업 자료", label: "수업 자료" },
  { id: "간단한 웹앱", label: "간단한 웹앱" },
  { id: "AI 기능", label: "AI 기능" },
  { id: "완성형 웹앱", label: "완성형 웹앱" },
  { id: "학교 업무 앱", label: "학교 업무 앱" },
  { id: "업무 자동화", label: "업무 자동화" },
  { id: "기존 코드 수정", label: "기존 코드 수정" },
  { id: "배포·운영", label: "배포·운영" },
];

// ============================================================
// 6. Recommendation Wizard
// ============================================================

type WizardAnswers = {
  goal: string;
  ecosystem: string;
  coding: string;
  features: string[];
  sharing: string;
};

const EMPTY: WizardAnswers = {
  goal: "",
  ecosystem: "",
  coding: "",
  features: [],
  sharing: "",
};

const GOAL_OPTS = [
  { id: "quiz", label: "수업용 퀴즈·게임·시각 자료" },
  { id: "simple", label: "학생이 사용하는 간단한 웹앱" },
  { id: "ai", label: "AI가 답변이나 이미지를 분석하는 앱" },
  { id: "fullapp", label: "로그인·기록 저장이 있는 완성형 웹앱" },
  { id: "school", label: "상담·신청·점검을 위한 학교 업무 앱" },
  { id: "automation", label: "이메일·알림·파일 정리 등의 업무 자동화" },
  { id: "codeedit", label: "이미 만든 앱의 코드 수정과 기능 추가" },
];

const ECO_OPTS = [
  { id: "canva", label: "캔바를 자주 사용함" },
  { id: "google", label: "Google Workspace를 주로 사용함" },
  { id: "microsoft", label: "Microsoft 365와 Teams를 주로 사용함" },
  { id: "any", label: "특정 플랫폼과 상관없음" },
  { id: "github", label: "GitHub나 로컬 프로젝트를 사용할 수 있음" },
];

const CODING_OPTS = [
  { id: "0", label: "코딩 경험이 거의 없음", hint: "괜찮습니다. 대부분의 도구는 대화만으로 시작할 수 있어요." },
  { id: "1", label: "AI와 대화하며 만드는 것은 가능함", hint: "많은 선생님이 이 수준에서 훌륭한 앱을 만듭니다." },
  { id: "2", label: "생성된 코드를 조금 수정할 수 있음", hint: "간단한 편집이 가능하면 선택 폭이 크게 넓어집니다." },
  { id: "3", label: "코드 편집기와 Git을 사용할 수 있음", hint: "코드 중심 도구도 편안하게 사용할 수 있습니다." },
  { id: "4", label: "터미널 명령어도 사용할 수 있음", hint: "가장 자유롭게 도구를 조합할 수 있습니다." },
];

const FEATURE_OPTS = [
  { id: "ai", label: "AI 답변 생성과 피드백" },
  { id: "vision", label: "이미지 또는 파일 분석" },
  { id: "records", label: "학생별 기록 저장" },
  { id: "google", label: "Google Sheets·Forms 연결" },
  { id: "ms", label: "Excel·SharePoint·Teams 연결" },
  { id: "login", label: "회원가입 또는 로그인" },
  { id: "notify", label: "자동 이메일·알림·승인" },
  { id: "none", label: "특별한 기능은 필요 없음" },
];

const SHARING_OPTS = [
  { id: "link", label: "연수 중 빠르게 링크로 공유" },
  { id: "student", label: "학생들이 링크나 QR 코드로 사용" },
  { id: "internal", label: "학교 구성원만 내부에서 사용" },
  { id: "public", label: "공개 웹사이트로 배포" },
  { id: "domain", label: "GitHub와 사용자 도메인으로 계속 운영" },
  { id: "unsure", label: "아직 잘 모르겠음" },
];

const WIZARD_KEY = "vibecoding:mod04:wizard";

// ---------- Scoring ----------

function scoreTool(tool: Tool, a: WizardAnswers): { score: number; reasons: string[] } {
  let goalPts = 0;
  const reasons: string[] = [];

  const goalMap: Record<string, PurposeTag[]> = {
    quiz: ["수업 자료"],
    simple: ["간단한 웹앱"],
    ai: ["AI 기능"],
    fullapp: ["완성형 웹앱"],
    school: ["학교 업무 앱"],
    automation: ["업무 자동화"],
    codeedit: ["기존 코드 수정"],
  };
  const goalTags = goalMap[a.goal] ?? [];
  if (goalTags.some((t) => tool.purposeTags.includes(t))) {
    goalPts = 40;
    reasons.push(`선택하신 목표(${goalTags[0]})에 잘 맞습니다.`);
  } else if (goalTags.length && tool.purposeTags.some((t) => t === "완성형 웹앱" && a.goal === "simple")) {
    goalPts = 20;
  } else {
    goalPts = 8;
  }

  // Ecosystem match (max 25)
  let ecoPts = 0;
  const ecoMap: Record<string, Tool["ecosystem"][number]> = {
    canva: "canva",
    google: "google",
    microsoft: "microsoft",
    any: "any",
    github: "github",
  };
  const wantEco = ecoMap[a.ecosystem];
  if (wantEco === "any") {
    ecoPts = tool.ecosystem.includes("any") ? 25 : 15;
  } else if (wantEco && tool.ecosystem.includes(wantEco)) {
    ecoPts = 25;
    if (wantEco === "google") reasons.push("Google Workspace 환경과 잘 어울립니다.");
    if (wantEco === "microsoft") reasons.push("Microsoft 365 환경에서 바로 활용할 수 있습니다.");
    if (wantEco === "canva") reasons.push("캔바 작업 흐름과 자연스럽게 연결됩니다.");
    if (wantEco === "github") reasons.push("GitHub·로컬 프로젝트 환경과 잘 맞습니다.");
  } else {
    // penalize mismatched ecosystem
    if (
      (wantEco === "google" && tool.ecosystem.includes("microsoft")) ||
      (wantEco === "microsoft" && tool.ecosystem.includes("google"))
    ) {
      ecoPts = 0;
    } else {
      ecoPts = 10;
    }
  }

  // Coding level (max 20): closer is better
  const userLevel = Number(a.coding || "1");
  const diff = Math.abs(userLevel - tool.codingLevel);
  let codePts = Math.max(0, 20 - diff * 6);
  if (tool.codingLevel > userLevel + 1) {
    codePts = Math.max(0, codePts - 4);
  } else if (tool.codingLevel <= userLevel && diff <= 1) {
    reasons.push("현재 코딩 경험 수준에 무리 없이 시작할 수 있습니다.");
  }

  // Feature match (max 25)
  let featPts = 0;
  const feats = a.features;
  const has = (f: string) => feats.includes(f);
  if (has("none") || feats.length === 0) {
    featPts = 15;
  } else {
    let hits = 0;
    let checks = 0;
    const add = (cond: boolean, weight = 1) => {
      checks += weight;
      if (cond) hits += weight;
    };
    if (has("ai")) add(tool.aiCapability >= 2);
    if (has("vision")) add(tool.aiCapability >= 3 || tool.id === "google-ai-studio");
    if (has("records")) add(tool.dataCapability >= 2);
    if (has("google")) add(tool.ecosystem.includes("google"));
    if (has("ms")) add(tool.ecosystem.includes("microsoft"));
    if (has("login")) add(tool.dataCapability >= 3);
    if (has("notify")) add(tool.automationCapability >= 2);
    featPts = checks === 0 ? 15 : Math.round((hits / checks) * 25);
    if (featPts >= 20) reasons.push("필요하신 기능들을 대부분 지원합니다.");
  }

  // Sharing (max 15)
  let sharePts = 0;
  const shareMap: Record<string, Tool["sharingType"][number] | "any"> = {
    link: "link",
    student: "link",
    internal: "internal",
    public: "public",
    domain: "domain",
    unsure: "any",
  };
  const wantShare = shareMap[a.sharing];
  if (!wantShare || wantShare === "any") sharePts = 10;
  else if (tool.sharingType.includes(wantShare as Tool["sharingType"][number])) {
    sharePts = 15;
    if (wantShare === "internal") reasons.push("학교 내부 사용 시나리오에 적합합니다.");
    if (wantShare === "public") reasons.push("공개 배포까지 지원합니다.");
  } else sharePts = 5;

  const total = goalPts + ecoPts + codePts + featPts + sharePts;
  const pct = Math.round((total / 125) * 100);
  return { score: pct, reasons: reasons.slice(0, 3) };
}

function levelText(v: number, high = "매우 적합", mid = "적합", low = "일부 가능", none = "별도 설정 필요") {
  if (v >= 3) return high;
  if (v === 2) return mid;
  if (v === 1) return low;
  return none;
}

function comparisonRow(tool: Tool) {
  return {
    "배우기 쉬움": levelText(4 - Math.min(tool.codingLevel, 3), "매우 적합", "적합", "일부 가능", "별도 설정 필요"),
    "제작 속도": tool.status === "ready" ? "매우 적합" : "적합",
    "AI 기능": levelText(tool.aiCapability),
    "데이터 저장": levelText(tool.dataCapability),
    "업무 자동화": levelText(tool.automationCapability),
    "코드 직접 수정":
      tool.codingLevel >= 3 ? "매우 적합" : tool.codingLevel === 2 ? "적합" : "일부 가능",
    "배포 난이도": levelText(tool.deploymentCapability),
    "Google Workspace 적합도": tool.ecosystem.includes("google") ? "매우 적합" : tool.ecosystem.includes("any") ? "일부 가능" : "별도 설정 필요",
    "Microsoft 365 적합도": tool.ecosystem.includes("microsoft") ? "매우 적합" : tool.ecosystem.includes("any") ? "일부 가능" : "별도 설정 필요",
    "추천 활용 장면": tool.bestFor,
  };
}

function interpretation(a: WizardAnswers, top: Tool) {
  const parts: string[] = [];
  const codingLabel = CODING_OPTS.find((c) => c.id === a.coding)?.label ?? "";
  const ecoLabel = ECO_OPTS.find((e) => e.id === a.ecosystem)?.label ?? "";
  const goalLabel = GOAL_OPTS.find((g) => g.id === a.goal)?.label ?? "";
  if (codingLabel) parts.push(`선생님은 "${codingLabel}"이고`);
  if (ecoLabel) parts.push(ecoLabel + "며");
  if (goalLabel) parts.push(`"${goalLabel}"을(를) 만들고 싶어 하므로`);
  return `${parts.join(", ")} ${top.name}이(가) 가장 적합합니다.`;
}

// ---------- Choice card ----------

function ChoiceCard({
  selected,
  onClick,
  label,
  hint,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`text-left w-full p-4 rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
        selected
          ? "border-coral bg-coral/5"
          : "border-hairline bg-canvas hover:border-coral/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-${multi ? "sm" : "full"} border-2 flex items-center justify-center ${
            selected ? "border-coral bg-coral text-white" : "border-hairline"
          }`}
        >
          {selected && <Check className="w-3.5 h-3.5" />}
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          {hint && <p className="text-xs text-muted-text mt-1 leading-relaxed">{hint}</p>}
        </div>
      </div>
    </button>
  );
}

// ---------- Wizard ----------

function RecommendationWizard() {
  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY);
  const [step, setStep] = useState(0); // 0..4 questions, 5 = result
  const [compareOpen, setCompareOpen] = useState(false);
  const [detail, setDetail] = useState<Tool | null>(null);

  // Load / persist
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIZARD_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.answers) setAnswers(parsed.answers);
        if (typeof parsed?.step === "number") setStep(parsed.step);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(WIZARD_KEY, JSON.stringify({ answers, step }));
    } catch {}
  }, [answers, step]);

  const totalSteps = 5;
  const canNext = (() => {
    if (step === 0) return !!answers.goal;
    if (step === 1) return !!answers.ecosystem;
    if (step === 2) return !!answers.coding;
    if (step === 3) return answers.features.length > 0;
    if (step === 4) return !!answers.sharing;
    return true;
  })();

  const reset = () => {
    setAnswers(EMPTY);
    setStep(0);
    try {
      localStorage.removeItem(WIZARD_KEY);
    } catch {}
  };

  const toggleFeature = (id: string) => {
    setAnswers((a) => {
      if (id === "none") return { ...a, features: ["none"] };
      const without = a.features.filter((f) => f !== "none");
      return without.includes(id)
        ? { ...a, features: without.filter((f) => f !== id) }
        : { ...a, features: [...without, id] };
    });
  };

  const results = useMemo(() => {
    if (step < 5) return [];
    return TOOLS.map((t) => ({ tool: t, ...scoreTool(t, answers) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);
  }, [step, answers]);

  // Result view
  if (step === 5) {
    const top = results[0];
    const alts = results.slice(1);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="serif text-2xl">선생님께 추천하는 도구</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCompareOpen((v) => !v)}
              className="text-sm px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card"
            >
              추천 도구 비교하기
            </button>
            <button
              onClick={reset}
              className="text-sm px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              선택 내용 삭제
            </button>
          </div>
        </div>

        <p className="text-sm text-body leading-relaxed p-4 bg-surface-card rounded-lg">
          <Info className="inline w-4 h-4 mr-1 text-coral" />
          {interpretation(answers, top.tool)}
        </p>

        {/* Top */}
        <div className="border-2 border-coral rounded-xl p-6 bg-coral/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-pill bg-coral text-white">
              가장 추천
            </span>
            <span className="ml-auto text-sm font-medium text-coral">일치도 {top.score}%</span>
          </div>
          <h4 className="serif text-2xl mb-2">{top.tool.name}</h4>
          <ul className="text-sm text-body space-y-1 mb-4 list-disc pl-5">
            {top.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="grid sm:grid-cols-3 gap-3 text-xs mb-4">
            <div className="p-3 bg-canvas rounded-md">
              <p className="text-muted-text mb-0.5">만들 수 있는 것</p>
              <p className="text-ink">{top.tool.result}</p>
            </div>
            <div className="p-3 bg-canvas rounded-md">
              <p className="text-muted-text mb-0.5">난이도</p>
              <p className="text-ink">{top.tool.difficulty}</p>
            </div>
            <div className="p-3 bg-canvas rounded-md">
              <p className="text-muted-text mb-0.5">주의</p>
              <p className="text-ink">{top.tool.caution}</p>
            </div>
          </div>
          <button
            onClick={() => setDetail(top.tool)}
            className="text-sm font-medium px-4 py-2 rounded-md bg-coral text-white hover:bg-coral/90"
          >
            도구 소개 보기
          </button>
        </div>

        {/* Alternatives */}
        <div className="grid sm:grid-cols-2 gap-4">
          {alts.map((r, idx) => (
            <div key={r.tool.id} className="border border-hairline rounded-lg p-5 bg-canvas">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-text">
                  {idx === 0 ? "함께 비교해 볼 도구" : "다른 방식으로 적합한 도구"}
                </span>
                <span className="ml-auto text-xs text-muted-text">일치도 {r.score}%</span>
              </div>
              <h4 className="serif text-xl mb-1">{r.tool.name}</h4>
              <ul className="text-xs text-body mt-3 space-y-1 list-disc pl-5">
                {r.reasons.map((rr, i) => (
                  <li key={i}>{rr}</li>
                ))}
                {r.reasons.length === 0 && <li>{r.tool.oneLine}</li>}
              </ul>
              <button
                onClick={() => setDetail(r.tool)}
                className="mt-4 text-sm font-medium px-3 py-1.5 rounded-md bg-ink text-canvas hover:bg-ink/90"
              >
                도구 소개 보기
              </button>
            </div>
          ))}
        </div>

        {compareOpen && (
          <div className="border border-hairline rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-surface-card">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-text">비교 항목</th>
                  {results.map((r) => (
                    <th key={r.tool.id} className="text-left p-3 font-medium text-ink">
                      {r.tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(comparisonRow(results[0].tool)).map((key) => (
                  <tr key={key} className="border-t border-hairline">
                    <td className="p-3 text-muted-text">{key}</td>
                    {results.map((r) => {
                      const row = comparisonRow(r.tool) as Record<string, string>;
                      return (
                        <td key={r.tool.id} className="p-3 text-body">
                          {row[key]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ToolDetailModal tool={detail} onClose={() => setDetail(null)} />
      </div>
    );
  }

  // Questions
  const stepNode = (() => {
    if (step === 0) {
      return (
        <div>
          <h3 className="serif text-xl mb-4">가장 먼저 만들고 싶은 것은 무엇인가요?</h3>
          <div role="radiogroup" className="grid sm:grid-cols-2 gap-3">
            {GOAL_OPTS.map((o) => (
              <ChoiceCard
                key={o.id}
                label={o.label}
                selected={answers.goal === o.id}
                onClick={() => setAnswers((a) => ({ ...a, goal: o.id }))}
              />
            ))}
          </div>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div>
          <h3 className="serif text-xl mb-4">어떤 계정과 업무 환경을 주로 사용하나요?</h3>
          <div role="radiogroup" className="grid sm:grid-cols-2 gap-3">
            {ECO_OPTS.map((o) => (
              <ChoiceCard
                key={o.id}
                label={o.label}
                selected={answers.ecosystem === o.id}
                onClick={() => setAnswers((a) => ({ ...a, ecosystem: o.id }))}
              />
            ))}
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div>
          <h3 className="serif text-xl mb-4">코딩과 개발 도구가 얼마나 익숙한가요?</h3>
          <div role="radiogroup" className="grid sm:grid-cols-2 gap-3">
            {CODING_OPTS.map((o) => (
              <ChoiceCard
                key={o.id}
                label={o.label}
                hint={o.hint}
                selected={answers.coding === o.id}
                onClick={() => setAnswers((a) => ({ ...a, coding: o.id }))}
              />
            ))}
          </div>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div>
          <h3 className="serif text-xl mb-4">필요한 기능을 모두 선택해 주세요.</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {FEATURE_OPTS.map((o) => (
              <ChoiceCard
                key={o.id}
                multi
                label={o.label}
                selected={answers.features.includes(o.id)}
                onClick={() => toggleFeature(o.id)}
              />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <h3 className="serif text-xl mb-4">완성한 결과물을 어떻게 사용하고 싶나요?</h3>
        <div role="radiogroup" className="grid sm:grid-cols-2 gap-3">
          {SHARING_OPTS.map((o) => (
            <ChoiceCard
              key={o.id}
              label={o.label}
              selected={answers.sharing === o.id}
              onClick={() => setAnswers((a) => ({ ...a, sharing: o.id }))}
            />
          ))}
        </div>
      </div>
    );
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            나에게 맞는 바이브코딩 도구 찾기
          </p>
          <p className="text-sm text-body">
            만들고 싶은 결과물과 사용 환경을 선택하면 가장 잘 맞는 도구 3개를 추천해 드립니다. · 약 1분 소요
          </p>
        </div>
        <div className="text-xs text-muted-text">
          {step + 1} / {totalSteps}
        </div>
      </div>

      <div className="w-full h-1 bg-surface-card rounded-full overflow-hidden">
        <div
          className="h-full bg-coral transition-all"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {stepNode}

      <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
        <button
          onClick={reset}
          className="text-sm px-3 py-1.5 rounded-md border border-hairline hover:bg-surface-card inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          처음부터 다시
        </button>
        <div className="flex gap-2 ml-auto">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-sm px-4 py-1.5 rounded-md border border-hairline hover:bg-surface-card disabled:opacity-40 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            이전
          </button>
          {step < totalSteps - 1 ? (
            <button
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="text-sm px-4 py-1.5 rounded-md bg-ink text-canvas hover:bg-ink/90 disabled:opacity-40 inline-flex items-center gap-1"
            >
              다음
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled={!canNext}
              onClick={() => setStep(5)}
              className="text-sm px-4 py-1.5 rounded-md bg-coral text-white hover:bg-coral/90 disabled:opacity-40"
            >
              추천 결과 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 7. Page
// ============================================================

export default function Mod04() {
  const [primary, setPrimary] = useState<PrimaryFilter>("all");
  const [secondary, setSecondary] = useState<SecondaryFilter>("all");
  const [detail, setDetail] = useState<Tool | null>(null);

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      if (primary !== "all" && t.learningPath !== primary) return false;
      if (secondary !== "all" && !t.purposeTags.includes(secondary as PurposeTag)) return false;
      return true;
    });
  }, [primary, secondary]);

  return (
    <article className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <KeyMessage>
        도구의 순위가 아니라, 내가 만들 결과에 맞는 도구를 고르는 것이 먼저입니다.
      </KeyMessage>

      <Section title="다양한 바이브 도구 소개">
        {/* Primary tabs */}
        <div className="-mx-5 sm:mx-0 mb-4 overflow-x-auto">
          <div className="flex gap-2 px-5 sm:px-0 min-w-max sm:min-w-0 sm:flex-wrap">
            {PRIMARY_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setPrimary(t.id)}
                className={`text-sm px-4 py-2 rounded-pill whitespace-nowrap transition-colors ${
                  primary === t.id
                    ? "bg-coral text-white"
                    : "bg-surface-card text-ink hover:bg-surface-cream-strong"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary chips */}
        <div className="-mx-5 sm:mx-0 mb-4 overflow-x-auto">
          <div className="flex gap-1.5 px-5 sm:px-0 min-w-max sm:min-w-0 sm:flex-wrap">
            {SECONDARY_CHIPS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSecondary(c.id)}
                className={`text-xs px-3 py-1 rounded-pill whitespace-nowrap transition-colors border ${
                  secondary === c.id
                    ? "bg-ink text-canvas border-ink"
                    : "bg-canvas text-body border-hairline hover:border-coral/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 text-sm">
          <p className="text-muted-text">조건에 맞는 도구 {filtered.length}개</p>
          {(primary !== "all" || secondary !== "all") && (
            <button
              onClick={() => {
                setPrimary("all");
                setSecondary("all");
              }}
              className="text-xs px-3 py-1 rounded-pill border border-hairline hover:bg-surface-card inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              필터 초기화
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} onOpen={setDetail} />
          ))}
        </div>
      </Section>

      <div className="bg-coral/5 border-l-4 border-coral rounded-r-lg p-6 my-8">
        <p className="text-body-strong leading-relaxed">
          오늘은 여러 도구 중 <strong>러버블</strong>을 이용해 “처음부터 끝까지 완성하는 경험”에 집중합니다.
        </p>
      </div>

      <PracticePanel title="직접 해보기 — 도구 선택 도우미">
        <RecommendationWizard />
      </PracticePanel>

      <ModuleNavigation module={m} />

      <ToolDetailModal tool={detail} onClose={() => setDetail(null)} />
    </article>
  );
}
