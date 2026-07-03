import { useMemo, useState } from "react";
import { Search, ChevronDown, Copy, Check } from "lucide-react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  KeyMessage,
  ConceptCard,
  ModuleNavigation,
} from "@/components/module-ui";

const m = moduleByNumber(3)!;

type Category = "ui" | "data" | "ai" | "design" | "code" | "file" | "deploy";
type Level = "기초" | "알아두면 좋음" | "심화";

type Term = {
  id: string;
  term: string;
  fullForm?: string;
  koreanName?: string;
  extension?: string;
  shortDescription: string;
  easyAnalogy?: string;
  useCase?: string;
  example?: string;
  exampleLang?: "json" | "yaml" | "markdown" | "xml" | "csv" | "text";
  caution?: string;
  relatedTerms?: string[];
  category: Category;
  level: Level;
  keywords?: string[];
};

const categories: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "ui", label: "화면과 사용자 경험" },
  { id: "data", label: "데이터와 서버" },
  { id: "ai", label: "AI와 외부 연결" },
  { id: "design", label: "설계와 제작" },
  { id: "code", label: "코드와 버전 관리" },
  { id: "file", label: "파일과 데이터 형식" },
  { id: "deploy", label: "배포와 운영" },
];

const categoryLabel = (c: Category) => categories.find((x) => x.id === c)!.label;

const terms: Term[] = [
  // 화면과 사용자 경험
  { id: "frontend", term: "Frontend", koreanName: "프론트엔드", shortDescription: "사용자가 직접 보고 조작하는 화면과 상호작용 부분.", easyAnalogy: "식당의 홀 – 손님이 앉아 주문하고 음식을 받는 공간과 같습니다.", useCase: "버튼, 카드, 페이지 등 사용자에게 보이는 모든 부분을 만들 때.", relatedTerms: ["UI", "UX", "HTML", "CSS"], category: "ui", level: "기초" },
  { id: "ui", term: "UI", fullForm: "User Interface", shortDescription: "버튼, 카드, 메뉴, 입력창처럼 사용자가 직접 보는 구성 요소.", easyAnalogy: "자동차의 계기판·버튼처럼 사람이 조작하는 접점.", useCase: "화면 안의 버튼·폼·카드를 배치할 때.", relatedTerms: ["UX", "Component", "Frontend"], category: "ui", level: "기초" },
  { id: "ux", term: "UX", fullForm: "User Experience", shortDescription: "사용자가 앱을 사용하며 겪는 전체적인 경험과 편의성.", easyAnalogy: "식당의 예약부터 계산까지 전 과정의 느낌.", useCase: "흐름이 자연스러운지, 사용자가 원하는 결과에 쉽게 도달하는지 판단할 때.", relatedTerms: ["UI", "User Flow", "Accessibility"], category: "ui", level: "기초" },
  { id: "html", term: "HTML", fullForm: "HyperText Markup Language", shortDescription: "웹페이지의 제목, 문단, 버튼 같은 구조를 만드는 언어.", easyAnalogy: "건물의 뼈대(철골).", useCase: "화면의 구조를 정의할 때.", relatedTerms: ["CSS", "Component"], category: "ui", level: "기초" },
  { id: "css", term: "CSS", fullForm: "Cascading Style Sheets", shortDescription: "색상, 글꼴, 간격, 크기, 배치 등 화면의 모양을 정하는 언어.", easyAnalogy: "옷과 인테리어.", useCase: "화면 디자인과 반응형 배치를 설정할 때.", relatedTerms: ["HTML", "Responsive"], category: "ui", level: "기초" },
  { id: "component", term: "Component", koreanName: "컴포넌트", shortDescription: "버튼이나 카드처럼 여러 화면에서 다시 사용할 수 있는 화면 조각.", easyAnalogy: "레고 블록.", useCase: "반복되는 UI를 한 번만 만들어 여러 곳에서 재사용할 때.", relatedTerms: ["UI", "Framework"], category: "ui", level: "알아두면 좋음" },
  { id: "responsive", term: "Responsive", koreanName: "반응형", shortDescription: "휴대전화, 태블릿, PC 화면 크기에 맞게 레이아웃이 바뀌는 방식.", easyAnalogy: "고무줄처럼 늘어나는 옷.", useCase: "다양한 기기에서 잘 보이도록 디자인할 때.", relatedTerms: ["Layout", "CSS"], category: "ui", level: "알아두면 좋음" },
  { id: "layout", term: "Layout", koreanName: "레이아웃", shortDescription: "화면의 영역과 요소를 배치하는 구조.", easyAnalogy: "교실의 자리 배치도.", useCase: "헤더·본문·사이드바 같은 큰 영역을 나눌 때.", relatedTerms: ["Responsive", "UI"], category: "ui", level: "알아두면 좋음" },
  { id: "navigation", term: "Navigation", koreanName: "내비게이션", shortDescription: "사용자가 페이지와 기능 사이를 이동하는 방식.", easyAnalogy: "쇼핑몰의 층별 안내판.", useCase: "메뉴, 탭, 뒤로가기 버튼 등을 설계할 때.", relatedTerms: ["Route / Routing", "UX"], category: "ui", level: "알아두면 좋음" },
  { id: "modal", term: "Modal", koreanName: "모달", shortDescription: "현재 화면 위에 떠서 확인이나 입력을 받는 작은 창.", easyAnalogy: "잠깐 뜨는 팝업 대화 상자.", useCase: "삭제 확인, 로그인, 상세 정보 입력창.", relatedTerms: ["UI", "Tooltip"], category: "ui", level: "알아두면 좋음" },
  { id: "tooltip", term: "Tooltip", koreanName: "툴팁", shortDescription: "마우스를 올리거나 선택했을 때 나타나는 짧은 설명.", easyAnalogy: "박물관 유물 옆의 작은 설명표.", useCase: "아이콘 버튼의 의미를 짧게 안내할 때.", relatedTerms: ["UI"], category: "ui", level: "알아두면 좋음" },
  { id: "a11y", term: "Accessibility", koreanName: "접근성", shortDescription: "장애 여부나 사용 환경과 관계없이 누구나 앱을 사용할 수 있도록 만드는 원칙.", easyAnalogy: "건물의 경사로와 점자 안내.", useCase: "스크린리더 지원, 키보드 조작, 색 대비를 확인할 때.", relatedTerms: ["UI", "UX"], category: "ui", level: "알아두면 좋음" },
  { id: "state", term: "State", koreanName: "상태", shortDescription: "선택값, 로그인 여부, 점수처럼 화면이 현재 기억하고 있는 값.", easyAnalogy: "게임 캐릭터의 현재 HP와 레벨.", useCase: "폼 입력값, 열린 창, 필터 상태 등을 관리할 때.", relatedTerms: ["Component", "Session"], category: "ui", level: "알아두면 좋음" },
  { id: "route", term: "Route / Routing", koreanName: "라우트 / 라우팅", shortDescription: "웹주소와 페이지를 연결하고 화면 이동을 관리하는 방식.", easyAnalogy: "주소 표지판과 도로.", useCase: "/home, /about 같은 페이지 구조를 만들 때.", relatedTerms: ["URL", "Navigation"], category: "ui", level: "알아두면 좋음" },

  // 데이터와 서버
  { id: "backend", term: "Backend", koreanName: "백엔드", shortDescription: "화면 뒤에서 데이터 처리, 사용자 확인, 규칙 실행을 담당하는 부분.", easyAnalogy: "식당의 주방.", useCase: "로그인 확인, 데이터 저장·조회, 결제 처리.", relatedTerms: ["Frontend", "Database", "Server"], category: "data", level: "기초" },
  { id: "fullstack", term: "Full Stack", koreanName: "풀스택", shortDescription: "프론트엔드, 백엔드, 데이터베이스, 배포까지 앱 전체 영역을 함께 다루는 것.", easyAnalogy: "식당의 홀·주방·창고·배송까지 모두 챙기는 것.", useCase: "혼자서 앱 하나를 처음부터 끝까지 만들 때.", relatedTerms: ["Frontend", "Backend", "Deploy / Publish"], category: "data", level: "알아두면 좋음" },
  { id: "database", term: "Database", koreanName: "데이터베이스", shortDescription: "사용자 정보, 결과, 기록 등을 구조적으로 저장하는 공간.", easyAnalogy: "잘 정리된 캐비닛 서랍.", useCase: "회원 정보, 게시글, 학생 활동 기록을 저장할 때.", relatedTerms: ["DB", "SQL", "Schema"], category: "data", level: "기초" },
  { id: "authentication", term: "Authentication", koreanName: "인증", shortDescription: "사용자가 누구인지 확인하는 로그인 기능.", easyAnalogy: "신분증 확인.", useCase: "로그인/회원가입 기능을 붙일 때.", relatedTerms: ["Authorization", "Session"], category: "data", level: "알아두면 좋음" },
  { id: "authorization", term: "Authorization", koreanName: "권한 부여", shortDescription: "로그인한 사용자가 어떤 기능과 데이터에 접근할 수 있는지 결정하는 것.", easyAnalogy: "출입증에 표시된 접근 가능 구역.", useCase: "관리자만 삭제, 학생은 읽기만 허용할 때.", relatedTerms: ["Authentication"], category: "data", level: "알아두면 좋음" },
  { id: "crud", term: "CRUD", fullForm: "Create, Read, Update, Delete", shortDescription: "데이터를 만들고, 읽고, 수정하고, 삭제하는 네 가지 기본 작업.", easyAnalogy: "노트에 쓰기·읽기·고치기·지우기.", useCase: "게시판, 목록, 기록 앱의 기본 기능을 설계할 때.", relatedTerms: ["Database", "API"], category: "data", level: "알아두면 좋음" },
  { id: "schema", term: "Schema", koreanName: "스키마", shortDescription: "데이터베이스에 어떤 항목을 어떤 형식으로 저장할지 정한 구조.", easyAnalogy: "출석부의 열 이름(이름/번호/출석).", useCase: "테이블 열과 데이터 타입을 정할 때.", relatedTerms: ["Table", "Database"], category: "data", level: "알아두면 좋음" },
  { id: "table", term: "Table", koreanName: "테이블", shortDescription: "데이터베이스에서 정보를 행과 열로 저장하는 표.", easyAnalogy: "엑셀 시트.", useCase: "users, posts처럼 정보를 유형별로 저장할 때.", relatedTerms: ["Schema", "SQL"], category: "data", level: "알아두면 좋음" },
  { id: "sql", term: "SQL", fullForm: "Structured Query Language", shortDescription: "관계형 데이터베이스에서 데이터를 조회하고 수정하는 언어.", easyAnalogy: "도서관 사서에게 요청하는 표준 검색어.", useCase: "특정 조건의 데이터를 조회·수정할 때.", relatedTerms: ["Database", "NoSQL"], category: "data", level: "심화" },
  { id: "nosql", term: "NoSQL", fullForm: "Not Only SQL", shortDescription: "표 형태에 제한되지 않고 다양한 구조로 데이터를 저장하는 방식.", easyAnalogy: "자유 형식의 카드 파일함.", useCase: "구조가 자주 바뀌거나 대량 문서를 다룰 때.", relatedTerms: ["SQL", "Database"], category: "data", level: "심화" },
  { id: "db", term: "DB", fullForm: "Database", shortDescription: "Database의 줄임말로 데이터를 저장·관리하는 공간.", relatedTerms: ["Database"], category: "data", level: "기초" },
  { id: "storage", term: "Storage", koreanName: "스토리지", shortDescription: "이미지, 영상, 첨부 파일 등을 저장하는 공간.", easyAnalogy: "학교의 자료실.", useCase: "학생 작품 이미지, 프로필 사진을 업로드할 때.", relatedTerms: ["Database"], category: "data", level: "알아두면 좋음" },
  { id: "localstorage", term: "Local Storage", koreanName: "로컬 스토리지", shortDescription: "사용자의 브라우저 안에 간단한 값을 저장하는 기능.", easyAnalogy: "내 책상 서랍에 붙여둔 메모지.", useCase: "테마 설정, 임시 진행 상태 저장.", relatedTerms: ["Database", "Session"], category: "data", level: "알아두면 좋음" },
  { id: "session", term: "Session", koreanName: "세션", shortDescription: "사용자가 로그인하거나 앱을 이용하는 동안 유지되는 임시 상태.", easyAnalogy: "놀이공원의 하루 입장 팔찌.", useCase: "로그인 유지, 장바구니 유지.", relatedTerms: ["Authentication", "State"], category: "data", level: "알아두면 좋음" },
  { id: "server", term: "Server", koreanName: "서버", shortDescription: "요청을 받아 데이터를 처리하고 결과를 돌려주는 컴퓨터 또는 프로그램.", easyAnalogy: "주문을 받아 요리를 내주는 주방.", useCase: "API 요청을 처리하고 데이터베이스와 연결할 때.", relatedTerms: ["Backend", "Cloud"], category: "data", level: "알아두면 좋음" },
  { id: "cloud", term: "Cloud", koreanName: "클라우드", shortDescription: "인터넷을 통해 서버, 데이터베이스, 저장 공간을 사용하는 방식.", easyAnalogy: "필요할 때 꺼내 쓰는 공용 창고.", useCase: "서버 구축 없이 배포·저장 서비스를 쓸 때.", relatedTerms: ["Hosting", "Server"], category: "data", level: "알아두면 좋음" },

  // AI와 외부 연결
  { id: "api", term: "API", fullForm: "Application Programming Interface", shortDescription: "서로 다른 프로그램이 요청과 응답을 주고받는 연결 통로.", easyAnalogy: "식당에서 주문을 주방에 전달하고 결과를 가져오는 종업원.", useCase: "웹앱에서 Gemini, 날씨, 지도 서비스와 데이터를 주고받을 때.", relatedTerms: ["MCP", "Secret / API Key", "Edge Function / Server Function"], category: "ai", level: "알아두면 좋음" },
  { id: "secret", term: "Secret / API Key", shortDescription: "외부 서비스를 사용할 때 필요한 비밀 인증 정보.", easyAnalogy: "회원 전용 출입 카드.", useCase: "AI, 결제 등 외부 서비스를 코드에서 호출할 때.", relatedTerms: ["Environment Variable", "Edge Function / Server Function"], category: "ai", level: "알아두면 좋음" },
  { id: "edgefn", term: "Edge Function / Server Function", shortDescription: "API 키를 숨기고 서버에서 안전하게 코드를 실행하는 기능.", easyAnalogy: "손님에게 비법 소스를 보여주지 않고 주방에서만 사용하는 것.", useCase: "AI 호출, 결제 처리 등 비밀 키가 필요한 작업.", relatedTerms: ["Secret / API Key", "API"], category: "ai", level: "심화" },
  { id: "ai", term: "AI", fullForm: "Artificial Intelligence", shortDescription: "사람의 판단이나 생성 작업 일부를 컴퓨터가 수행하도록 하는 기술.", relatedTerms: ["LLM", "Generative AI"], category: "ai", level: "기초" },
  { id: "genai", term: "Generative AI", koreanName: "생성형 AI", shortDescription: "글, 이미지, 음성, 코드처럼 새로운 결과물을 만들어내는 AI.", easyAnalogy: "요청에 따라 그림을 그려주는 화가.", useCase: "글쓰기 도우미, 이미지 생성, 코드 자동 완성.", relatedTerms: ["LLM", "Prompt"], category: "ai", level: "기초" },
  { id: "llm", term: "LLM", fullForm: "Large Language Model", shortDescription: "많은 언어 데이터를 학습해 글을 이해하고 생성하는 AI 모델.", easyAnalogy: "방대한 책을 읽은 상담가.", useCase: "챗봇, 요약, 번역 기능을 만들 때.", relatedTerms: ["AI", "Token", "Context Window"], category: "ai", level: "심화" },
  { id: "model", term: "Model", koreanName: "모델", shortDescription: "입력을 분석해 결과를 만들어내도록 학습된 AI 시스템.", relatedTerms: ["LLM", "AI"], category: "ai", level: "알아두면 좋음" },
  { id: "token", term: "Token", koreanName: "토큰", shortDescription: "AI가 글을 읽고 생성할 때 사용하는 작은 텍스트 단위.", easyAnalogy: "글을 잘게 자른 조각.", useCase: "AI 사용량과 비용을 이해할 때.", relatedTerms: ["LLM", "Context Window"], category: "ai", level: "심화" },
  { id: "context", term: "Context Window", koreanName: "컨텍스트 윈도", shortDescription: "AI가 한 번에 참고하고 기억할 수 있는 정보의 범위.", easyAnalogy: "한 번에 펼쳐볼 수 있는 책의 페이지 수.", useCase: "긴 문서를 요약하거나 대화 히스토리를 유지할 때.", relatedTerms: ["Token", "LLM"], category: "ai", level: "심화" },
  { id: "hallucination", term: "Hallucination", koreanName: "환각", shortDescription: "AI가 사실이 아니거나 근거 없는 내용을 그럴듯하게 만드는 현상.", easyAnalogy: "확신에 찬 표정으로 틀린 답을 말하는 것.", useCase: "AI 결과를 반드시 사람이 검토해야 하는 이유.", relatedTerms: ["LLM", "RAG"], category: "ai", level: "심화" },
  { id: "apicall", term: "API Call", koreanName: "API 호출", shortDescription: "앱이 외부 서비스에 요청을 보내고 결과를 받아오는 한 번의 통신.", easyAnalogy: "한 번의 주문과 서빙.", useCase: "AI, 날씨, 지도 등을 호출할 때 사용량을 계산.", relatedTerms: ["API", "Rate Limit"], category: "ai", level: "알아두면 좋음" },
  { id: "mcp", term: "MCP", fullForm: "Model Context Protocol", shortDescription: "AI 앱이 외부 데이터와 도구를 일정한 방식으로 연결해 사용할 수 있도록 만든 공개 연결 규격.", easyAnalogy: "여러 가게와 통하는 공통 주문 규격.", useCase: "AI에 여러 외부 도구를 표준 방식으로 붙일 때.", relatedTerms: ["API", "MCP Client", "MCP Server"], category: "ai", level: "심화" },
  { id: "mcpclient", term: "MCP Client", koreanName: "MCP 클라이언트", shortDescription: "MCP 서버에 도구나 데이터를 요청하는 AI 앱 쪽 구성 요소.", relatedTerms: ["MCP", "MCP Server"], category: "ai", level: "심화" },
  { id: "mcpserver", term: "MCP Server", koreanName: "MCP 서버", shortDescription: "AI가 사용할 수 있는 데이터, 자료, 기능을 MCP 방식으로 제공하는 연결 프로그램.", relatedTerms: ["MCP", "MCP Client"], category: "ai", level: "심화" },
  { id: "rag", term: "RAG", fullForm: "Retrieval-Augmented Generation", shortDescription: "AI가 외부 문서나 데이터에서 관련 정보를 찾아 참고한 뒤 답을 생성하는 방식.", easyAnalogy: "책을 뒤져보고 답하는 학생.", useCase: "학교 자료 기반 챗봇, 사내 문서 검색.", relatedTerms: ["Embedding", "Vector Database"], category: "ai", level: "심화" },
  { id: "embedding", term: "Embedding", koreanName: "임베딩", shortDescription: "문장이나 자료의 의미를 숫자 형태로 바꾸어 비슷한 내용을 찾게 하는 기술.", relatedTerms: ["RAG", "Vector Database"], category: "ai", level: "심화" },
  { id: "vectordb", term: "Vector Database", koreanName: "벡터 데이터베이스", shortDescription: "의미가 비슷한 문서나 자료를 빠르게 찾기 위해 임베딩 값을 저장하는 데이터베이스.", relatedTerms: ["Embedding", "RAG"], category: "ai", level: "심화" },
  { id: "webhook", term: "Webhook", koreanName: "웹훅", shortDescription: "특정 사건이 발생했을 때 다른 서비스로 자동 알림이나 데이터를 보내는 방식.", easyAnalogy: "택배 도착 알림톡.", useCase: "결제 완료 시 이메일 전송 등 자동 연동.", relatedTerms: ["API"], category: "ai", level: "심화" },
  { id: "sdk", term: "SDK", fullForm: "Software Development Kit", shortDescription: "특정 서비스나 기능을 앱에 쉽게 연결하도록 제공하는 개발 도구 모음.", easyAnalogy: "완성된 조립 키트.", useCase: "복잡한 API를 간단히 사용하도록 도와줄 때.", relatedTerms: ["API", "Library"], category: "ai", level: "알아두면 좋음" },
  
  { id: "http", term: "HTTP", fullForm: "HyperText Transfer Protocol", shortDescription: "웹에서 브라우저와 서버가 정보를 주고받을 때 쓰는 통신 규칙.", relatedTerms: ["HTTPS", "API"], category: "ai", level: "알아두면 좋음" },
  { id: "prompt", term: "Prompt", koreanName: "프롬프트", shortDescription: "AI에게 원하는 결과와 조건을 전달하는 제작 지시.", easyAnalogy: "요리사에게 주는 자세한 주문서.", useCase: "AI로 코드·글·이미지를 만들 때.", relatedTerms: ["LLM", "PRD"], category: "ai", level: "기초" },

  // 설계와 제작
  { id: "prd", term: "PRD", fullForm: "Product Requirements Document", shortDescription: "만들 제품의 목적, 대상, 기능, 화면과 기준을 정리한 설계 문서.", easyAnalogy: "건축 설계도.", useCase: "AI에게 명확한 지시를 주기 전 정리 단계.", relatedTerms: ["Requirement", "Prompt"], category: "design", level: "기초" },
  { id: "mvp", term: "MVP", fullForm: "Minimum Viable Product", shortDescription: "가장 중요한 문제 하나를 해결하도록 핵심 기능만 구현한 첫 제품.", easyAnalogy: "샘플 시식용 요리.", useCase: "빠르게 반응을 확인하고 개선하고 싶을 때.", relatedTerms: ["Prototype", "Iteration"], category: "design", level: "기초" },
  { id: "requirement", term: "Requirement", koreanName: "요구사항", shortDescription: "앱이 반드시 갖추어야 할 기능과 조건.", relatedTerms: ["PRD", "Acceptance Criteria"], category: "design", level: "알아두면 좋음" },
  { id: "userflow", term: "User Flow", koreanName: "사용자 흐름", shortDescription: "사용자가 앱에 들어와 목표를 완료하기까지 거치는 단계.", easyAnalogy: "지하철 노선도.", useCase: "회원가입, 결제 등 시나리오 설계.", relatedTerms: ["UX", "Wireframe"], category: "design", level: "알아두면 좋음" },
  { id: "wireframe", term: "Wireframe", koreanName: "와이어프레임", shortDescription: "화면의 구성과 배치를 간단한 선과 상자로 표현한 초안.", relatedTerms: ["Prototype", "Layout"], category: "design", level: "알아두면 좋음" },
  { id: "prototype", term: "Prototype", koreanName: "프로토타입", shortDescription: "아이디어와 사용 흐름을 시험하기 위해 만든 초기 형태.", relatedTerms: ["MVP", "Wireframe"], category: "design", level: "알아두면 좋음" },
  { id: "ac", term: "Acceptance Criteria", koreanName: "수용 기준", shortDescription: "기능이 제대로 완성되었다고 판단하기 위한 구체적인 조건.", relatedTerms: ["Requirement", "PRD"], category: "design", level: "심화" },
  { id: "iteration", term: "Iteration", koreanName: "반복 개선", shortDescription: "만들고 시험한 뒤 문제를 수정하는 과정을 여러 번 반복하는 것.", relatedTerms: ["MVP", "Prototype"], category: "design", level: "알아두면 좋음" },
  { id: "refactor", term: "Refactoring", koreanName: "리팩터링", shortDescription: "기능은 유지하면서 코드를 더 읽기 쉽고 안정적으로 정리하는 작업.", relatedTerms: ["Debugging"], category: "design", level: "심화" },
  { id: "techstack", term: "Tech Stack", koreanName: "기술 스택", shortDescription: "앱 제작에 사용하는 언어, 프레임워크, 데이터베이스, 배포 도구의 조합.", relatedTerms: ["Framework", "Library"], category: "design", level: "알아두면 좋음" },
  { id: "framework", term: "Framework", koreanName: "프레임워크", shortDescription: "앱을 일정한 구조와 규칙에 따라 쉽게 만들도록 제공되는 개발 기반.", easyAnalogy: "미리 뼈대를 갖춘 조립식 주택.", relatedTerms: ["Library", "Tech Stack"], category: "design", level: "알아두면 좋음" },
  { id: "library", term: "Library", koreanName: "라이브러리", shortDescription: "특정 기능을 구현할 때 가져다 쓰는 코드 모음.", relatedTerms: ["Framework", "SDK"], category: "design", level: "알아두면 좋음" },
  { id: "debugging", term: "Debugging", koreanName: "디버깅", shortDescription: "오류의 원인을 찾고 수정하는 과정.", easyAnalogy: "고장난 기계에서 원인을 찾아 고치는 과정.", relatedTerms: ["Log", "Refactoring"], category: "design", level: "알아두면 좋음" },

  // 코드와 버전 관리
  { id: "ide", term: "IDE", fullForm: "Integrated Development Environment", shortDescription: "화면, 파일, 코드, 실행 도구를 함께 제공하는 개발 작업 공간.", easyAnalogy: "잘 갖춰진 공작실.", relatedTerms: ["CLI"], category: "code", level: "알아두면 좋음" },
  { id: "cli", term: "CLI", fullForm: "Command-Line Interface", shortDescription: "버튼 대신 명령어를 입력해 컴퓨터에 작업을 지시하는 방식.", easyAnalogy: "글로만 주문을 넣는 창구.", relatedTerms: ["IDE"], category: "code", level: "심화" },
  { id: "repo", term: "Repository", koreanName: "리포지토리", shortDescription: "코드와 변경 기록을 함께 보관하는 프로젝트 저장소.", easyAnalogy: "프로젝트 보관함.", relatedTerms: ["Git", "GitHub"], category: "code", level: "알아두면 좋음" },
  { id: "git", term: "Git", shortDescription: "파일과 코드의 변경 이력을 내 컴퓨터에서 기록하고 관리하는 버전 관리 도구.", easyAnalogy: "저장 시점을 남기는 타임머신.", relatedTerms: ["GitHub", "Commit", "Version Control"], category: "code", level: "알아두면 좋음" },
  { id: "github", term: "GitHub", shortDescription: "Git 저장소를 인터넷에 올려 저장, 공유, 협업하는 온라인 서비스.", easyAnalogy: "온라인 공용 사물함.", relatedTerms: ["Git", "Repository"], category: "code", level: "알아두면 좋음" },
  { id: "vcs", term: "Version Control", koreanName: "버전 관리", shortDescription: "파일의 변경 기록을 저장하고 이전 상태로 돌아갈 수 있게 관리하는 방식.", relatedTerms: ["Git", "Commit"], category: "code", level: "알아두면 좋음" },
  { id: "commit", term: "Commit", koreanName: "커밋", shortDescription: "현재 변경 내용을 하나의 기록 단위로 저장하는 작업.", relatedTerms: ["Git", "Push"], category: "code", level: "알아두면 좋음" },
  { id: "push", term: "Push", koreanName: "푸시", shortDescription: "내 컴퓨터의 Git 변경 기록을 GitHub 같은 원격 저장소로 올리는 작업.", relatedTerms: ["Pull", "GitHub"], category: "code", level: "알아두면 좋음" },
  { id: "pull", term: "Pull", koreanName: "풀", shortDescription: "원격 저장소의 최신 변경 내용을 내 컴퓨터로 가져오는 작업.", relatedTerms: ["Push", "Clone"], category: "code", level: "알아두면 좋음" },
  { id: "clone", term: "Clone", koreanName: "클론", shortDescription: "원격 저장소의 프로젝트 전체를 내 컴퓨터로 복사하는 작업.", relatedTerms: ["Repository", "Fork"], category: "code", level: "알아두면 좋음" },
  { id: "branch", term: "Branch", koreanName: "브랜치", shortDescription: "기존 코드에 영향을 주지 않고 별도의 작업 흐름을 만드는 기능.", easyAnalogy: "이야기의 평행 세계.", relatedTerms: ["Merge"], category: "code", level: "심화" },
  { id: "merge", term: "Merge", koreanName: "머지", shortDescription: "서로 다른 브랜치의 변경 내용을 하나로 합치는 작업.", relatedTerms: ["Branch", "Merge Conflict"], category: "code", level: "심화" },
  { id: "conflict", term: "Merge Conflict", koreanName: "병합 충돌", shortDescription: "같은 부분을 서로 다르게 수정해 자동으로 합칠 수 없는 상태.", relatedTerms: ["Merge"], category: "code", level: "심화" },
  { id: "fork", term: "Fork", koreanName: "포크", shortDescription: "다른 사람의 저장소를 내 계정으로 복사해 독립적으로 수정하는 기능.", relatedTerms: ["Clone", "Pull Request / PR"], category: "code", level: "심화" },
  { id: "pr", term: "Pull Request / PR", koreanName: "풀 리퀘스트", shortDescription: "내가 수정한 내용을 원래 프로젝트에 합쳐달라고 요청하는 기능.", relatedTerms: ["Merge", "GitHub"], category: "code", level: "심화" },
  { id: "oss", term: "Open Source", koreanName: "오픈 소스", shortDescription: "소스 코드를 공개해 다른 사람이 확인, 수정, 활용할 수 있도록 한 방식.", relatedTerms: ["License", "GitHub"], category: "code", level: "알아두면 좋음" },
  { id: "license", term: "License", koreanName: "라이선스", shortDescription: "코드나 자료를 어떤 조건으로 사용하고 수정할 수 있는지 정한 규칙.", relatedTerms: ["Open Source"], category: "code", level: "알아두면 좋음" },

  // 파일과 데이터 형식
  { id: "json", term: "JSON", fullForm: "JavaScript Object Notation", extension: ".json", shortDescription: "프로그램 사이에서 구조화된 데이터를 주고받을 때 많이 사용하는 텍스트 형식.", easyAnalogy: "이름표가 붙은 서랍에 값을 정리해 둔 데이터 상자와 비슷합니다.", useCase: "API 응답, 앱 설정값, 사용자 데이터, 데이터베이스 처리 결과를 표현할 때 자주 사용합니다.", example: `{\n  "name": "김교사",\n  "subject": "과학",\n  "grade": 2\n}`, exampleLang: "json", caution: "쉼표, 따옴표, 중괄호 위치가 틀리면 오류가 발생할 수 있습니다.", relatedTerms: ["API", "Object", "Array", "Key", "Value"], category: "file", level: "기초", keywords: [".json", "json"] },
  { id: "markdown", term: "Markdown", fullForm: "Markdown Document", extension: ".md", shortDescription: "간단한 기호를 사용해 제목, 목록, 강조, 링크 등을 표현하는 문서 작성 형식.", easyAnalogy: "복잡한 워드 편집 없이 기호만으로 문서 구조를 표시하는 메모 방식입니다.", useCase: "README, 프로젝트 설명서, PRD, 수업 자료, AI 프롬프트 문서를 작성할 때 사용합니다.", example: `# 제목\n## 소제목\n- 목록\n**굵게**\n[링크 이름](주소)`, exampleLang: "markdown", caution: ".md는 Markdown 문서의 대표적인 파일 확장자입니다.", relatedTerms: ["README", "Documentation", "PRD"], category: "file", level: "기초", keywords: [".md", "md", "markdown"] },
  { id: "readme", term: "README", shortDescription: "프로젝트의 목적, 실행 방법, 기능, 주의사항을 안내하는 대표 설명 문서.", easyAnalogy: "새 프로젝트를 처음 연 사람에게 보여주는 사용 설명서입니다.", useCase: "GitHub 저장소의 첫 화면에서 프로젝트를 설명할 때 주로 사용합니다.", caution: "보통 README.md라는 이름으로 작성합니다.", relatedTerms: ["Markdown", "Repository", "GitHub", "Documentation"], category: "file", level: "기초", keywords: ["readme", "readme.md"] },
  { id: "yaml", term: "YAML", fullForm: "YAML Ain't Markup Language", extension: ".yaml / .yml", shortDescription: "들여쓰기와 간단한 문법으로 설정값과 구조를 표현하는 텍스트 형식.", easyAnalogy: "설정 내용을 사람이 읽기 쉽게 줄과 들여쓰기로 정리한 파일입니다.", useCase: "GitHub Actions, 배포 설정, Docker, CI/CD 설정 파일에서 자주 사용합니다.", example: `name: Deploy\non:\n  push:\n    branches:\n      - main`, exampleLang: "yaml", caution: "YAML은 들여쓰기가 매우 중요하며 탭과 공백을 혼용하면 오류가 생길 수 있습니다.", relatedTerms: ["CI/CD", "GitHub Actions", "Configuration"], category: "file", level: "알아두면 좋음", keywords: [".yaml", ".yml", "yml"] },
  { id: "csv", term: "CSV", fullForm: "Comma-Separated Values", extension: ".csv", shortDescription: "표 형태의 데이터를 쉼표로 구분해 저장하는 텍스트 파일 형식.", easyAnalogy: "엑셀 표를 글자와 쉼표만으로 저장한 형태입니다.", useCase: "학생 명렬, 점수표, 설문 결과, 데이터베이스 자료를 가져오거나 내보낼 때 사용합니다.", example: `name,class,score\n김학생,1,85\n이학생,1,92`, exampleLang: "csv", caution: "데이터 안에 쉼표가 들어갈 경우 따옴표 처리가 필요할 수 있습니다.", relatedTerms: ["Spreadsheet", "Database", "Import", "Export"], category: "file", level: "기초", keywords: [".csv", "csv"] },
  { id: "xml", term: "XML", fullForm: "eXtensible Markup Language", extension: ".xml", shortDescription: "태그를 사용해 데이터의 구조와 의미를 표현하는 텍스트 형식.", easyAnalogy: "HTML처럼 여는 태그와 닫는 태그 사이에 데이터를 넣어 정리하는 방식입니다.", useCase: "일부 오래된 API, 문서 형식, 설정 파일, 데이터 교환에 사용됩니다.", example: `<student>\n  <name>김학생</name>\n  <score>85</score>\n</student>`, exampleLang: "xml", relatedTerms: ["HTML", "API", "JSON"], category: "file", level: "알아두면 좋음", keywords: [".xml", "xml"] },
  { id: "txt", term: "TXT", fullForm: "Plain Text File", extension: ".txt", shortDescription: "서식 없이 글자만 저장하는 가장 기본적인 텍스트 파일 형식.", easyAnalogy: "글자만 적을 수 있는 가장 단순한 메모장 파일입니다.", useCase: "간단한 메모, 로그, 프롬프트, 데이터 임시 저장에 사용합니다.", relatedTerms: ["Log", "Markdown", "Plain Text"], category: "file", level: "기초", keywords: [".txt", "txt"] },
  { id: "htmlfile", term: "HTML 파일", extension: ".html", shortDescription: "웹페이지의 구조와 내용을 담고 있는 파일.", easyAnalogy: "웹페이지의 뼈대가 들어 있는 문서입니다.", useCase: "제목, 문단, 버튼, 이미지, 링크 등 웹페이지 요소를 정의합니다.", relatedTerms: ["HTML", "CSS", "JavaScript"], category: "file", level: "기초", keywords: [".html", "html"] },
  { id: "cssfile", term: "CSS 파일", extension: ".css", shortDescription: "웹페이지의 색상, 크기, 글꼴, 간격, 배치 스타일을 담는 파일.", easyAnalogy: "웹페이지의 옷과 꾸밈을 정하는 문서입니다.", useCase: "HTML 요소의 모양과 반응형 레이아웃을 설정할 때 사용합니다.", relatedTerms: ["HTML", "Responsive", "UI"], category: "file", level: "기초", keywords: [".css", "css"] },
  { id: "jsfile", term: "JavaScript 파일", extension: ".js", shortDescription: "웹페이지의 동작과 상호작용을 구현하는 코드 파일.", easyAnalogy: "버튼을 눌렀을 때 움직이거나 계산하고 화면을 바꾸게 하는 동작 설명서입니다.", useCase: "클릭 이벤트, 데이터 처리, API 호출, 화면 변경을 구현할 때 사용합니다.", relatedTerms: ["Frontend", "API", "Function"], category: "file", level: "기초", keywords: [".js", "js", "javascript"] },
  { id: "tsfile", term: "TypeScript 파일", extension: ".ts / .tsx", shortDescription: "JavaScript에 데이터 형식 검사를 추가해 오류를 줄이도록 만든 언어와 파일 형식.", easyAnalogy: "JavaScript에 값의 종류를 미리 확인하는 안전장치를 더한 방식입니다.", useCase: "React, Lovable, 현대적인 웹앱 프로젝트에서 자주 사용합니다.", caution: ".tsx는 JSX 문법이 포함된 TypeScript 화면 컴포넌트 파일에 자주 사용됩니다.", relatedTerms: ["JavaScript", "React", "Component", "Type"], category: "file", level: "알아두면 좋음", keywords: [".ts", ".tsx", "typescript", "ts", "tsx"] },
  { id: "jsxtsx", term: "JSX / TSX", extension: ".jsx / .tsx", shortDescription: "JavaScript 또는 TypeScript 안에서 HTML과 비슷한 화면 구조를 작성하는 문법과 파일 형식.", easyAnalogy: "화면 구조와 동작 코드를 한곳에서 함께 작성하는 방식입니다.", useCase: "React 컴포넌트의 버튼, 카드, 화면 구조를 만들 때 사용합니다.", relatedTerms: ["React", "Component", "JavaScript", "TypeScript"], category: "file", level: "알아두면 좋음", keywords: [".jsx", ".tsx", "jsx", "tsx"] },
  { id: "envfile", term: "환경 변수 파일", extension: ".env", shortDescription: "API 키, 서버 주소, 환경별 설정값을 코드와 분리해 저장하는 파일.", easyAnalogy: "앱의 비밀번호와 설정값을 따로 보관하는 비밀 설정 메모입니다.", useCase: "API 키, 데이터베이스 주소, 서비스 설정값을 관리할 때 사용합니다.", caution: ".env 파일과 실제 API 키를 GitHub 공개 저장소에 올리면 안 됩니다.", relatedTerms: ["Environment Variable", "Secret / API Key", "GitHub"], category: "file", level: "알아두면 좋음", keywords: [".env", "env", "dotenv"] },
  { id: "packagejson", term: "package.json", extension: "package.json", shortDescription: "JavaScript 프로젝트의 이름, 실행 명령어, 설치된 라이브러리 정보를 기록하는 설정 파일.", easyAnalogy: "이 프로젝트에 어떤 재료와 실행 방법이 필요한지 적힌 목록표입니다.", useCase: "React, Vite, Node.js 프로젝트에서 라이브러리 설치와 실행 명령을 관리합니다.", relatedTerms: ["npm", "Dependency", "Script", "Library"], category: "file", level: "알아두면 좋음", keywords: ["package.json", "npm"] },
  { id: "lockfile", term: "Lock 파일", extension: "package-lock.json / pnpm-lock.yaml / yarn.lock", shortDescription: "프로젝트가 사용하는 라이브러리의 정확한 버전을 고정해 기록하는 파일.", easyAnalogy: "누가 실행해도 같은 재료 버전을 사용하도록 정해 둔 목록입니다.", useCase: "컴퓨터나 배포 환경이 달라도 동일한 라이브러리 구성을 재현할 때 사용합니다.", caution: "일반적으로 직접 수정하지 않고 패키지 관리 도구가 자동으로 관리합니다.", relatedTerms: ["Dependency", "package.json", "npm"], category: "file", level: "심화", keywords: ["package-lock", "yarn.lock", "pnpm-lock", "lock"] },
  { id: "configfile", term: "Config 파일", fullForm: "Configuration File", shortDescription: "앱이나 개발 도구가 어떻게 동작할지 설정하는 파일.", easyAnalogy: "프로그램의 세부 규칙을 정해 두는 설정표입니다.", useCase: "빌드, 배포, 코드 검사, 데이터베이스, 프레임워크 설정에 사용합니다.", example: `vite.config.ts\ntsconfig.json\nvercel.json`, exampleLang: "text", relatedTerms: ["Build", "Deploy / Publish", "Environment Variable"], category: "file", level: "알아두면 좋음", keywords: ["config", "설정"] },
  { id: "binary", term: "Binary File", koreanName: "바이너리 파일", shortDescription: "사람이 글자로 바로 읽기 어려운 컴퓨터용 데이터 형식의 파일.", easyAnalogy: "이미지, 영상, 실행 파일처럼 메모장으로 내용을 확인하기 어려운 파일입니다.", example: `.png  .jpg  .pdf  .zip  .exe`, exampleLang: "text", relatedTerms: ["Text File", "Upload", "Storage"], category: "file", level: "기초", keywords: ["binary", "바이너리"] },
  { id: "fileext", term: "File Extension", koreanName: "파일 확장자", shortDescription: "파일 이름 끝에 붙어 파일의 종류를 알려주는 부분.", easyAnalogy: "파일이 문서인지 이미지인지 코드인지 알려주는 꼬리표입니다.", example: `.md   .json   .html   .png   .csv`, exampleLang: "text", relatedTerms: ["File Format", "MIME Type"], category: "file", level: "기초", keywords: ["확장자", "extension"] },
  { id: "mime", term: "MIME Type", fullForm: "Multipurpose Internet Mail Extensions Type", shortDescription: "브라우저와 서버가 파일의 실제 데이터 종류를 구분할 때 사용하는 표준 정보.", easyAnalogy: "파일 확장자보다 더 정확하게 콘텐츠 종류를 알려주는 인터넷용 이름표입니다.", example: `application/json\ntext/html\nimage/png\napplication/pdf`, exampleLang: "text", relatedTerms: ["HTTP", "Upload", "File Extension"], category: "file", level: "심화", keywords: ["mime", "content-type"] },

  // 배포와 운영
  { id: "deploy", term: "Deploy / Publish", koreanName: "배포", shortDescription: "다른 사람이 접속할 수 있도록 웹앱을 인터넷에 공개하는 과정.", easyAnalogy: "공연장 개막.", useCase: "완성된 앱을 사용자에게 열어줄 때.", relatedTerms: ["Hosting", "Domain"], category: "deploy", level: "알아두면 좋음" },
  { id: "hosting", term: "Hosting", koreanName: "호스팅", shortDescription: "웹사이트와 앱 파일을 인터넷에서 접속할 수 있도록 서버에 올려두는 서비스.", easyAnalogy: "가게가 입점할 상가.", relatedTerms: ["Deploy / Publish", "Cloud"], category: "deploy", level: "알아두면 좋음" },
  { id: "domain", term: "Domain", koreanName: "도메인", shortDescription: "사용자가 웹사이트에 접속할 때 입력하는 주소.", easyAnalogy: "가게 이름과 간판.", relatedTerms: ["URL", "DNS"], category: "deploy", level: "기초" },
  { id: "url", term: "URL", fullForm: "Uniform Resource Locator", shortDescription: "인터넷에 있는 특정 페이지나 파일의 전체 주소.", relatedTerms: ["Domain", "Route / Routing"], category: "deploy", level: "기초" },
  { id: "dns", term: "DNS", fullForm: "Domain Name System", shortDescription: "사람이 입력한 도메인 주소를 실제 서버 주소와 연결하는 시스템.", easyAnalogy: "전화번호부.", relatedTerms: ["Domain"], category: "deploy", level: "심화" },
  { id: "subdomain", term: "Subdomain", koreanName: "서브도메인", shortDescription: "하나의 도메인 앞에 이름을 붙여 별도의 사이트처럼 사용하는 주소.", relatedTerms: ["Domain"], category: "deploy", level: "알아두면 좋음" },
  { id: "https", term: "HTTPS", fullForm: "HyperText Transfer Protocol Secure", shortDescription: "브라우저와 서버 사이의 데이터를 암호화해 전송하는 안전한 통신 방식.", relatedTerms: ["HTTP"], category: "deploy", level: "알아두면 좋음" },
  { id: "envvar", term: "Environment Variable", koreanName: "환경 변수", shortDescription: "API 키나 설정값을 코드 밖에서 안전하게 관리하기 위한 값.", relatedTerms: ["Secret / API Key"], category: "deploy", level: "알아두면 좋음" },
  { id: "prod", term: "Production", koreanName: "프로덕션", shortDescription: "실제 사용자가 이용하는 정식 운영 환경.", relatedTerms: ["Development", "Staging"], category: "deploy", level: "알아두면 좋음" },
  { id: "dev", term: "Development", koreanName: "개발 환경", shortDescription: "기능을 만들고 시험하는 작업 환경.", relatedTerms: ["Production", "Staging"], category: "deploy", level: "알아두면 좋음" },
  { id: "staging", term: "Staging", koreanName: "스테이징", shortDescription: "정식 배포 전에 실제 운영과 비슷한 조건에서 마지막으로 시험하는 환경.", relatedTerms: ["Production", "Development"], category: "deploy", level: "심화" },
  { id: "build", term: "Build", koreanName: "빌드", shortDescription: "개발 중인 코드를 브라우저가 실행할 수 있는 형태로 변환하는 과정.", relatedTerms: ["Deploy / Publish", "CI/CD"], category: "deploy", level: "알아두면 좋음" },
  { id: "cicd", term: "CI/CD", fullForm: "Continuous Integration / Continuous Delivery", shortDescription: "코드 변경을 자동으로 검사하고 빌드하여 배포하는 작업 흐름.", relatedTerms: ["Build", "Deploy / Publish"], category: "deploy", level: "심화" },
  { id: "log", term: "Log", koreanName: "로그", shortDescription: "앱에서 발생한 작업, 오류, 요청 내용을 시간 순서로 남긴 기록.", easyAnalogy: "블랙박스 기록.", relatedTerms: ["Monitoring", "Debugging"], category: "deploy", level: "알아두면 좋음" },
  { id: "monitoring", term: "Monitoring", koreanName: "모니터링", shortDescription: "앱의 오류, 속도, 사용량, 서버 상태를 지속적으로 확인하는 활동.", relatedTerms: ["Log"], category: "deploy", level: "심화" },
  { id: "ratelimit", term: "Rate Limit", koreanName: "요청 제한", shortDescription: "일정 시간 동안 API나 서비스에 보낼 수 있는 요청 횟수의 제한.", relatedTerms: ["API Call", "API"], category: "deploy", level: "심화" },
  { id: "cache", term: "Cache", koreanName: "캐시", shortDescription: "자주 사용하는 데이터를 임시 저장해 앱을 더 빠르게 보여주는 기능.", easyAnalogy: "자주 쓰는 물건을 책상 위에 두는 것.", relatedTerms: ["Storage"], category: "deploy", level: "알아두면 좋음" },
];

type Comparison = {
  id: string;
  title: string;
  items: { label: string; desc: string }[];
  analogy?: string;
  summary: string;
  caution?: string;
};

const comparisons: Comparison[] = [
  { id: "cmp-git", title: "Git과 GitHub", items: [
    { label: "Git", desc: "내 컴퓨터에서 코드와 파일의 변경 이력을 기록하는 버전 관리 도구." },
    { label: "GitHub", desc: "Git으로 관리한 저장소를 인터넷에 저장하고 공유·협업하는 서비스." },
  ], analogy: "Git은 변경 이력을 기록하는 기능, GitHub는 그 기록을 보관하고 함께 쓰는 온라인 공간입니다.", summary: "Git은 도구, GitHub는 서비스." },
  { id: "cmp-repo", title: "Repository와 GitHub", items: [
    { label: "Repository", desc: "하나의 프로젝트 코드와 변경 기록을 담는 저장소." },
    { label: "GitHub", desc: "여러 Repository를 온라인에서 저장하고 관리하는 플랫폼." },
  ], summary: "Repository는 프로젝트 보관함, GitHub는 그 보관함을 제공하는 서비스." },
  { id: "cmp-api-mcp", title: "API와 MCP", items: [
    { label: "API", desc: "한 프로그램이 다른 프로그램의 기능이나 데이터를 요청하는 연결 방식." },
    { label: "MCP", desc: "AI 앱이 여러 외부 도구와 데이터 소스를 공통된 규칙으로 연결하도록 만든 공개 프로토콜." },
  ], analogy: "API가 개별 가게마다 다른 주문 방식이라면, MCP는 AI가 여러 가게와 연결할 때 쓰는 공통 주문 규격입니다.", summary: "API는 서비스 간 연결 방법, MCP는 AI와 도구 연결을 표준화한 규격.", caution: "MCP가 API를 없애는 것은 아닙니다. MCP 서버가 실제 외부 서비스와 통신할 때 내부적으로 API를 사용할 수도 있습니다." },
  { id: "cmp-api-sdk", title: "API와 SDK", items: [
    { label: "API", desc: "서비스가 제공하는 기능을 호출하기 위한 규칙과 접점." },
    { label: "SDK", desc: "그 API를 더 쉽게 사용하도록 코드, 예제, 도구를 묶어 제공한 개발 도구 세트." },
  ], summary: "API는 사용할 기능의 규칙, SDK는 그 기능을 쉽게 쓰게 해주는 도구 모음." },
  { id: "cmp-fs", title: "Frontend, Backend, Full Stack", items: [
    { label: "Frontend", desc: "사용자가 보고 조작하는 화면." },
    { label: "Backend", desc: "화면 뒤에서 데이터와 규칙을 처리하는 기능." },
    { label: "Full Stack", desc: "Frontend와 Backend, Database, 배포까지 전체 영역을 함께 다루는 것." },
  ], summary: "화면은 Frontend, 처리·저장은 Backend, 전체를 연결하면 Full Stack." },
  { id: "cmp-authn-authz", title: "Authentication과 Authorization", items: [
    { label: "Authentication", desc: "사용자가 누구인지 확인하는 과정." },
    { label: "Authorization", desc: "확인된 사용자에게 어떤 기능과 데이터를 허용할지 정하는 과정." },
  ], analogy: "인증은 신분증 확인, 권한은 출입 가능한 공간을 정하는 것입니다.", summary: "인증은 누구인가, 권한은 무엇을 할 수 있는가." },
  { id: "cmp-storage-db", title: "Local Storage와 Database", items: [
    { label: "Local Storage", desc: "현재 사용자의 브라우저에 간단한 값을 저장." },
    { label: "Database", desc: "서버에서 여러 사용자의 데이터를 구조적으로 저장하고 관리." },
  ], summary: "개인 기기에 간단히 저장하면 Local Storage, 여러 사용자의 기록을 관리하면 Database." },
  { id: "cmp-deploy", title: "Deploy, Hosting, Domain", items: [
    { label: "Deploy", desc: "앱을 인터넷에서 실행할 수 있도록 올리는 과정." },
    { label: "Hosting", desc: "배포한 앱 파일과 서버를 실제로 보관하고 제공하는 서비스." },
    { label: "Domain", desc: "사용자가 앱에 접속할 때 입력하는 주소." },
  ], summary: "Deploy는 올리는 과정, Hosting은 올려두는 공간, Domain은 찾아가는 주소." },
  { id: "cmp-envs", title: "Development, Staging, Production", items: [
    { label: "Development", desc: "기능을 만들고 수정하는 개발 환경." },
    { label: "Staging", desc: "정식 공개 전에 실제 환경처럼 시험하는 환경." },
    { label: "Production", desc: "실제 사용자가 이용하는 정식 환경." },
  ], summary: "개발 → 최종 시험 → 실제 운영." },
  { id: "cmp-prompt-prd-code", title: "Prompt, PRD, Code", items: [
    { label: "Prompt", desc: "AI에게 지금 수행할 작업을 설명하는 지시." },
    { label: "PRD", desc: "앱 전체의 목적, 대상, 기능, 화면과 기준을 정리한 설계 문서." },
    { label: "Code", desc: "설계와 지시를 실제로 작동하게 만드는 명령의 집합." },
  ], summary: "PRD는 전체 설계, Prompt는 작업 지시, Code는 실제 구현." },
  { id: "cmp-lovable-ai", title: "Lovable AI와 외부 AI API", items: [
    { label: "Lovable AI", desc: "러버블 안에서 별도의 API 키 설정을 줄이고 생성형 AI 기능을 빠르게 붙이는 방식." },
    { label: "외부 AI API", desc: "Gemini, OpenAI, Claude 등 외부 회사의 API 키와 모델을 직접 연결하는 방식." },
  ], summary: "빠른 MVP는 Lovable AI, 모델·비용·이전성을 직접 관리하려면 외부 API.", caution: "Lovable AI도 내부적으로 AI 모델과 서버 자원을 사용하는 기능이므로 사용량과 비용을 확인해야 합니다." },
  { id: "cmp-json-csv", title: "JSON과 CSV", items: [
    { label: "JSON", desc: "중첩 구조와 다양한 데이터 형식을 표현하기 좋음." },
    { label: "CSV", desc: "행과 열로 된 단순한 표 데이터를 저장하기 좋음." },
  ], summary: "복잡한 앱 데이터는 JSON, 명렬·점수표 같은 표 데이터는 CSV." },
  { id: "cmp-md-html", title: "Markdown과 HTML", items: [
    { label: "Markdown", desc: "간단한 기호로 빠르게 문서를 작성하는 형식." },
    { label: "HTML", desc: "웹페이지의 구조와 요소를 세밀하게 표현하는 언어." },
  ], summary: "간단한 문서 작성은 Markdown, 웹페이지 구조 제작은 HTML." },
  { id: "cmp-json-yaml", title: "JSON과 YAML", items: [
    { label: "JSON", desc: "프로그램이 읽고 처리하기 쉽고 API 데이터에 많이 사용됨." },
    { label: "YAML", desc: "사람이 읽기 쉬운 설정 파일에 많이 사용되며 들여쓰기가 중요함." },
  ], summary: "데이터 교환은 JSON, 사람이 편집하는 설정은 YAML이 자주 사용됨." },
  { id: "cmp-env-secret", title: ".env와 Secret 저장소", items: [
    { label: ".env", desc: "개발 환경에서 환경 변수를 저장하는 로컬 설정 파일." },
    { label: "Secret 저장소", desc: "배포된 서버 환경에서 API 키와 비밀값을 안전하게 보관하는 기능." },
  ], summary: "로컬 설정은 .env, 운영 비밀값은 서버 측 Secret 저장소.", caution: ".env 파일만 사용한다고 API 키가 자동으로 안전해지는 것은 아닙니다. 브라우저에 전달되는 값은 노출될 수 있으므로 비밀키는 서버 측 Secret 저장소와 Server Function에서 사용해야 합니다." },
  { id: "cmp-pkg-lock", title: "package.json과 package-lock.json", items: [
    { label: "package.json", desc: "프로젝트가 필요로 하는 라이브러리와 실행 명령을 정의." },
    { label: "package-lock.json", desc: "실제로 설치된 라이브러리의 정확한 버전을 기록." },
  ], summary: "package.json은 필요한 재료 목록, lock 파일은 실제 사용한 정확한 버전 기록." },
];

const suggestions = ["AI 연결", "데이터 저장", "로그인", "GitHub", "배포", "풀스택", "API 키", "MCP", "JSON", "Markdown", ".env", "CSV", "package.json", "TSX"];

const guides = [
  { title: "처음이라면", body: "Frontend, Backend, Database, API, Prompt, MVP부터 살펴보세요.", ids: ["frontend", "backend", "database", "api", "prompt", "mvp"] },
  { title: "Lovable을 쓰려면", body: "Full Stack, Authentication, Secret, Deploy, GitHub를 알아두면 좋습니다.", ids: ["fullstack", "authentication", "secret", "deploy", "github"] },
  { title: "AI 기능을 넣으려면", body: "LLM, API Call, Token, MCP, RAG, Hallucination을 살펴보세요.", ids: ["llm", "apicall", "token", "mcp", "rag", "hallucination"] },
  { title: "파일 이름이 낯설다면", body: "JSON, Markdown, CSV, .env, package.json부터 살펴보세요.", ids: ["json", "markdown", "csv", "envfile", "packagejson"] },
];

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-coral/20 text-ink rounded px-0.5">{p}</mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function levelColor(l: Level) {
  if (l === "기초") return "bg-emerald-100 text-emerald-800";
  if (l === "알아두면 좋음") return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

function TermTitle({ t }: { t: Term }) {
  const secondary = t.fullForm ?? t.koreanName;
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="font-semibold text-ink">{t.term}</span>
      {secondary && (
        <span className="text-sm text-muted-text">({secondary})</span>
      )}
      {t.extension && (
        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-cream-strong text-ink border border-hairline">
          {t.extension}
        </span>
      )}
    </span>
  );
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  return (
    <div className="relative group">
      <pre className="text-xs bg-ink/90 text-canvas rounded-md p-3 pr-10 overflow-x-auto font-mono leading-relaxed">
        <code data-lang={lang}>{code}</code>
      </pre>
      <button
        onClick={copy}
        aria-label="코드 복사"
        className="absolute top-2 right-2 p-1.5 rounded bg-canvas/10 hover:bg-canvas/20 text-canvas transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function Mod03() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return terms.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (beginnerOnly && t.level !== "기초") return false;
      if (!query) return true;
      const hay = [
        t.term,
        t.fullForm ?? "",
        t.koreanName ?? "",
        t.shortDescription,
        t.easyAnalogy ?? "",
        t.useCase ?? "",
        (t.relatedTerms ?? []).join(" "),
        (t.keywords ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [q, cat, beginnerOnly]);

  const scrollToTerm = (id: string) => {
    setOpenId(id);
    setTimeout(() => {
      const el = document.getElementById(`term-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <KeyMessage>
        용어는 외우는 것이 아니라, AI와 대화할 때 길을 잃지 않기 위한 지도입니다.
      </KeyMessage>

      <Section title="네 가지 비유로 한 번에">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["HTML", "뼈대", "🦴"],
            ["CSS", "옷", "👕"],
            ["Database", "기억의 창고", "📦"],
            ["API", "번역기·연결 통로", "🔌"],
          ].map(([t, d, e]) => (
            <ConceptCard key={t} title={`${t} = ${d}`}>
              <div className="text-4xl mb-1">{e}</div>
            </ConceptCard>
          ))}
        </div>
      </Section>

      <Section title="용어 사전" eyebrow="검색과 분류">
        {/* Learning guides */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {guides.map((g) => (
            <div key={g.title} className="rounded-lg border border-hairline bg-surface-soft p-4">
              <div className="font-semibold text-ink mb-1">{g.title}</div>
              <p className="text-sm text-body mb-2">{g.body}</p>
              <div className="flex flex-wrap gap-1">
                {g.ids.map((id) => {
                  const t = terms.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => scrollToTerm(id)}
                      className="text-xs px-2 py-0.5 rounded-md bg-canvas border border-hairline hover:border-coral"
                    >
                      {t.term}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Search + toggles */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="용어, 약어, 설명, 비유로 검색 (예: MCP, 풀스택, 로그인)"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-hairline bg-canvas outline-none focus:border-coral text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-body cursor-pointer">
            <input
              type="checkbox"
              checked={beginnerOnly}
              onChange={(e) => setBeginnerOnly(e.target.checked)}
              className="accent-coral"
            />
            기초 용어만 보기
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1 mb-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                cat === c.id
                  ? "bg-surface-cream-strong text-ink font-medium"
                  : "text-muted-text hover:bg-surface-card"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1 mb-4">
          <span className="text-xs text-muted-text mr-1">추천 검색어:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="text-xs px-2 py-0.5 rounded-full border border-hairline hover:border-coral hover:text-coral"
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-text p-6 text-center bg-surface-soft rounded-lg">
            찾는 용어가 없습니다. 다른 표현이나 관련 기능으로 검색해 보세요.
          </p>
        ) : (
          <ul className="divide-y divide-hairline border border-hairline rounded-lg overflow-hidden">
            {filtered.map((t) => {
              const isOpen = openId === t.id;
              return (
                <li key={t.id} id={`term-${t.id}`} className="bg-canvas">
                  <button
                    onClick={() => setOpenId(isOpen ? null : t.id)}
                    aria-expanded={isOpen}
                    aria-controls={`panel-${t.id}`}
                    className="w-full p-4 text-left flex items-start gap-3 hover:bg-surface-soft/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <TermTitle t={t} />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] uppercase tracking-widest text-muted-text px-1.5 py-0.5 rounded bg-surface-soft">
                            {categoryLabel(t.category)}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${levelColor(t.level)}`}>
                            {t.level}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-body mt-1">{highlight(t.shortDescription, q)}</p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 mt-1 text-muted-text shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      id={`panel-${t.id}`}
                      className="px-4 pb-4 pt-1 bg-surface-soft/70 border-t border-hairline"
                    >
                      <div className="space-y-3 text-sm">
                        {t.easyAnalogy && (
                          <div>
                            <div className="text-xs font-semibold text-coral uppercase tracking-wider mb-0.5">쉽게 말하면</div>
                            <p className="text-body">{t.easyAnalogy}</p>
                          </div>
                        )}
                        {t.useCase && (
                          <div>
                            <div className="text-xs font-semibold text-coral uppercase tracking-wider mb-0.5">어디에 쓰이나요?</div>
                            <p className="text-body">{t.useCase}</p>
                          </div>
                        )}
                        {t.example && (
                          <div>
                            <div className="text-xs font-semibold text-coral uppercase tracking-wider mb-1">예시</div>
                            <CodeBlock code={t.example} lang={t.exampleLang} />
                          </div>
                        )}
                        {t.caution && (
                          <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded p-2">
                            ⚠️ {t.caution}
                          </div>
                        )}
                        {t.relatedTerms && t.relatedTerms.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-coral uppercase tracking-wider mb-1">함께 보면 좋은 용어</div>
                            <div className="flex flex-wrap gap-1">
                              {t.relatedTerms.map((rt) => {
                                const target = terms.find((x) => x.term === rt);
                                return target ? (
                                  <button
                                    key={rt}
                                    onClick={() => scrollToTerm(target.id)}
                                    className="text-xs px-2 py-0.5 rounded-md bg-canvas border border-hairline hover:border-coral"
                                  >
                                    {rt}
                                  </button>
                                ) : (
                                  <span key={rt} className="text-xs px-2 py-0.5 rounded-md bg-canvas border border-hairline text-muted-text">
                                    {rt}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={() => window.print()}
          className="mt-4 text-sm text-coral hover:text-coral-active font-medium no-print"
        >
          용어 카드 인쇄하기 →
        </button>
      </Section>

      <Section title="함께 알아두면 좋은 용어의 차이" eyebrow="비교 카드">
        <p className="text-sm text-body mb-4">
          비슷해 보이지만 역할이 다른 용어를 비교해 보면 개발 구조를 더 쉽게 이해할 수 있습니다.
        </p>
        <div className="grid gap-4">
          {comparisons.map((c) => (
            <div key={c.id} className="rounded-lg border border-hairline bg-canvas p-4">
              <h3 className="font-semibold text-ink mb-3">{c.title}</h3>
              <div
                className={`grid gap-3 ${c.items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
              >
                {c.items.map((it, i) => (
                  <div
                    key={it.label}
                    className={`p-3 rounded-md bg-surface-soft ${
                      i < c.items.length - 1 ? "md:border-r md:border-hairline" : ""
                    }`}
                  >
                    <div className="text-xs font-semibold text-coral mb-1">{it.label}</div>
                    <p className="text-sm text-body">{it.desc}</p>
                  </div>
                ))}
              </div>
              {c.analogy && (
                <p className="mt-3 text-sm text-body">
                  <span className="font-semibold text-ink">핵심 비유 · </span>
                  {c.analogy}
                </p>
              )}
              <p className="mt-2 text-sm">
                <span className="inline-block text-[10px] uppercase tracking-widest text-muted-text mr-2">한 줄 정리</span>
                <span className="text-ink font-medium">{c.summary}</span>
              </p>
              {c.caution && (
                <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                  ⚠️ {c.caution}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <ModuleNavigation module={m} />
    </article>
  );
}
