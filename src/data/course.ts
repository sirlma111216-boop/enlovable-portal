export const courseMeta = {
  category: "AI디지털수업평가전문가연수",
  title: "내 수업에 코딩 한 스푼",
  subtitle: "AI와 함께 만드는 교사의 수업 도구",
  instructor: "김도윤",
  date: "2026년 7월 4일",
  dateShort: "2026. 7. 4.",
  duration: "6시간",
};

export type Phase = {
  id: number;
  title: string;
  duration: string;
  outcome: string;
  modules: number[];
};

export const phases: Phase[] = [
  {
    id: 1,
    title: "관점 바꾸기",
    duration: "60분",
    outcome: "바이브코딩의 의미와 교사의 역할을 이해합니다.",
    modules: [1, 2, 3],
  },
  {
    id: 2,
    title: "첫 번째 완성 경험",
    duration: "120분",
    outcome: "러버블로 실제 작동하는 교육용 웹앱을 완성합니다.",
    modules: [4, 5, 6, 7],
  },
  {
    id: 3,
    title: "설계하고 확장하기",
    duration: "60분",
    outcome: "수업의 병목을 정의하고 PRD·백엔드·API의 역할을 이해합니다.",
    modules: [8, 9, 10],
  },
  {
    id: 4,
    title: "내 수업 도구 완성하기",
    duration: "120분",
    outcome: "내 수업 도구 프로토타입과 디지털 윤리 체크리스트를 완성합니다.",
    modules: [11, 12],
  },
];

export type Module = {
  number: number;
  slug: string;
  title: string;
  phase: number;
  duration: string;
  summary: string;
};

export const modules: Module[] = [
  { number: 1, slug: "01-vibe-coding", phase: 1, duration: "15분",
    title: "바이브코딩이란?",
    summary: "코드를 직접 입력하는 방식에서, 만들고 싶은 것을 설명하고 AI의 결과를 검토하는 방식으로 개발의 중심이 이동했습니다." },
  { number: 2, slug: "02-why-teachers-need-it", phase: 1, duration: "20분",
    title: "왜 지금 교사에게 바이브코딩이 필요한가?",
    summary: "기존 에듀테크가 정확히 맞추지 못하는 교실의 작은 틈을 교사가 직접 메울 수 있기 때문입니다." },
  { number: 3, slug: "03-developer-terms", phase: 1, duration: "25분",
    title: "바이브코딩을 위한 개발자 용어 총정리",
    summary: "개발자가 되기 위한 암기가 아니라, AI와 대화할 때 길을 잃지 않기 위한 최소 언어를 익힙니다." },
  { number: 4, slug: "04-tools", phase: 2, duration: "15분",
    title: "다양한 바이브코딩 도구 소개",
    summary: "도구의 순위를 정하는 것이 아니라, 내가 만들려는 결과와 현재 수준에 맞는 도구를 고릅니다." },
  { number: 5, slug: "05-lovable-pros-cons", phase: 2, duration: "15분",
    title: "러버블의 장단점 소개",
    summary: "러버블은 초보 교사가 빠르게 웹앱의 전체 흐름을 경험하기 좋지만, 좋은 결과를 위해서는 명확한 요구사항과 검증이 필요합니다." },
  { number: 6, slug: "06-lovable-basics", phase: 2, duration: "30분",
    title: "러버블 인터페이스, 기능, 기본 사용 팁",
    summary: "처음부터 모든 메뉴를 외우지 말고, 계획 → 생성 → 미리보기 → 수정 → 테스트 → 배포의 흐름을 익힙니다." },
  { number: 7, slug: "07-first-project", phase: 2, duration: "60분",
    title: "첫 번째 완성 경험 — AI 형성평가 피드백 도우미",
    summary: "모든 교과에서 활용할 수 있는 간단한 입력 → AI 분석 → 피드백 출력 구조를 완성합니다." },
  { number: 8, slug: "08-prd-workshop", phase: 3, duration: "30분",
    title: "PRD 제작 실습",
    summary: "PRD는 AI에게 주는 길고 어려운 개발 문서가 아니라, 무엇을 왜 누구를 위해 만들지 흔들리지 않게 붙잡아 주는 설계 기준입니다." },
  { number: 9, slug: "09-backend", phase: 3, duration: "15분",
    title: "백엔드 — 앱이 기억하고 처리하는 곳",
    summary: "화면만 필요한 앱과, 로그인·저장·공유·권한 관리가 필요한 앱을 구분합니다." },
  { number: 10, slug: "10-generative-api", phase: 3, duration: "15분",
    title: "생성형 API — 내 앱에 AI 기능 연결하기",
    summary: "생성형 AI 웹사이트를 여는 대신, 내 앱이 정해진 입력을 보내고 정해진 형식의 결과를 받도록 연결합니다." },
  { number: 11, slug: "11-classroom-project", phase: 4, duration: "90분",
    title: "프로젝트 미션 — 내 수업 도구 만들기",
    summary: "내 수업의 실제 병목 하나를 골라 문제 정의 → 설계 → 프로토타입 → 테스트 → 공유까지 완성합니다." },
  { number: 12, slug: "12-digital-ethics", phase: 4, duration: "30분",
    title: "교사로서의 디지털 윤리 강화하기",
    summary: "AI가 만들 수 있는 것과 교사가 책임져야 하는 것을 구분하고, 공개 전 안전·윤리 점검을 습관화합니다." },
];

export const moduleBySlug = (slug: string) => modules.find((m) => m.slug === slug);
export const moduleByNumber = (n: number) => modules.find((m) => m.number === n);

export const learningPrinciples = [
  "문제 정의부터 시작하기",
  "핵심 기능은 3개 이하로 제한하기",
  "한 번에 하나씩 구현하기",
  "AI 결과는 반드시 검증하기",
  "교육적 타당성을 기능보다 우선하기",
];

export const coreMessages = [
  "좋은 수업 문제 정의가 좋은 앱보다 중요하다.",
  "교사는 개발자가 아니다. 교사는 교육 문제 해결자다.",
];
