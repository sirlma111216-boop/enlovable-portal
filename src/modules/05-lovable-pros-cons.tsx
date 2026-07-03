import { useState } from "react";
import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  ConceptCard,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
  PracticePanel,
} from "@/components/module-ui";
import { Check, X, Wrench, Sparkles, Database, Rocket, MessageSquare, Github, BrainCircuit, TrendingUp, Server, ShieldAlert, AlertCircle, AlertTriangle } from "lucide-react";

const m = moduleByNumber(5)!;

type Verdict = "mvp" | "shrink" | "expert";
type Project = {
  text: string;
  answer: Verdict;
  feedback: string;
  altFeedback: string;
  tags: string[];
};
const projects: Project[] = [
  {
    text: "수업 중 토론 역할을 무작위로 배정하는 미니 도구",
    answer: "mvp",
    feedback:
      "개인정보가 거의 필요하지 않고, 입력과 출력이 단순한 수업 운영 도구입니다. Lovable로 빠르게 구현하고 바로 수업에서 시험하기 좋습니다.",
    altFeedback:
      "위험 요소가 적고 기능이 단순해 굳이 범위를 더 줄이거나 전문 개발까지 갈 필요는 없습니다. Lovable로 바로 MVP를 만들어 수업에서 시험해 보세요.",
    tags: ["낮은 위험", "단순한 기능", "수업용 MVP"],
  },
  {
    text: "교사가 학생의 익명 서술형 답변을 입력하면 피드백 초안을 생성하는 도구",
    answer: "mvp",
    feedback:
      "학생 실명을 사용하지 않고 교사가 최종 결과를 검토한다면 Lovable AI의 장점을 활용하기 좋은 MVP입니다. AI 결과를 그대로 확정하지 않는 검토 절차가 필요합니다.",
    altFeedback:
      "익명 데이터와 교사 검토가 전제된다면 Lovable AI로 충분히 다룰 수 있는 범위입니다. 처음부터 범위를 크게 줄이거나 외부 개발로 넘길 필요는 없습니다.",
    tags: ["Lovable AI 활용", "교사 검토 필요", "익명 데이터"],
  },
  {
    text: "단어 학습 카드와 자가 점검 게임",
    answer: "mvp",
    feedback:
      "화면, 입력, 점수 계산과 같은 흐름이 단순하고 사용자 규모도 작아 Lovable에 잘 맞는 학습용 앱입니다.",
    altFeedback:
      "단순한 학습 게임이라 굳이 범위를 더 줄이거나 전문 개발이 필요하지 않습니다. Lovable로 바로 만들어 시험해 보세요.",
    tags: ["학습 게임", "단순한 데이터", "빠른 배포"],
  },
  {
    text: "프로젝트 주제를 추천하고 학생의 자기평가 기록을 저장하는 도구",
    answer: "shrink",
    feedback:
      "주제 추천 기능은 Lovable AI로 쉽게 시험할 수 있지만, 학생별 장기 기록과 개인정보 저장 기능은 최소화해야 합니다. 먼저 익명 또는 기기 내 저장 방식으로 MVP를 만드는 것이 적절합니다.",
    altFeedback:
      "학생별 기록 저장은 신중해야 하지만, 주제 추천 자체는 Lovable로 충분히 시험할 수 있습니다. 저장 범위를 줄인 프로토타입으로 접근하는 것이 균형 잡힌 선택입니다.",
    tags: ["AI 추천", "데이터 저장 주의", "범위 축소"],
  },
  {
    text: "학생 실명과 상담 기록을 함께 관리하고 AI가 상담 전략을 추천하는 통합 시스템",
    answer: "expert",
    feedback:
      "학생 실명과 상담 기록은 민감정보에 해당합니다. 단순한 프로토타입을 넘어 실제 운영하려면 개인정보 보호, 접근 권한, 저장 위치, 보안 정책을 전문적으로 검토해야 합니다.",
    altFeedback:
      "민감정보와 상담 기록이 결합된 시스템은 MVP나 프로토타입 수준으로 접근하기에는 위험이 큽니다. 전문 개발과 별도의 보안·개인정보 검토가 필요합니다.",
    tags: ["민감정보", "복잡한 권한", "고위험"],
  },
  {
    text: "전 학년 성적 입력, 통지표 자동 발송, 보호자 확인, 결제 기능을 함께 제공하는 시스템",
    answer: "expert",
    feedback:
      "성적, 보호자 정보, 자동 발송, 결제 기능은 오류의 영향이 크고 권한 구조도 복잡합니다. 초기 Lovable 프로젝트로 다루기에는 위험도가 높습니다.",
    altFeedback:
      "성적과 결제, 보호자 알림이 동시에 얽힌 시스템은 MVP나 프로토타입만으로는 안전하게 다루기 어렵습니다. 전문 개발과 운영 설계를 함께 검토해야 합니다.",
    tags: ["성적 데이터", "결제", "높은 오류 영향"],
  },
  {
    text: "교사 10명이 사용하는 형성평가 피드백 도우미",
    answer: "mvp",
    feedback:
      "소규모 사용자 환경에서 AI 기능의 효과와 비용을 검증하기 좋은 프로젝트입니다. 다만 사용량이 늘어날 경우 Lovable AI 크레딧과 운영 비용을 점검해야 합니다.",
    altFeedback:
      "10명 규모라면 Lovable로 충분히 다룰 수 있는 범위입니다. 처음부터 범위를 줄이거나 외부 개발로 넘기기보다, MVP로 만들어 사용량과 효과를 검증해 보세요.",
    tags: ["소규모 사용자", "AI MVP", "비용 검증"],
  },
  {
    text: "전국의 교사와 학생 수천 명이 매일 사용하는 AI 문항 생성 서비스",
    answer: "shrink",
    feedback:
      "아이디어 검증용 MVP는 Lovable로 만들 수 있지만, 대규모 사용자와 반복적인 AI 호출은 비용과 성능 부담이 큽니다. 소수 사용자를 대상으로 먼저 기능과 사용량을 검증해야 합니다.",
    altFeedback:
      "완성형 서비스로 처음부터 만들면 비용·성능 부담이 큽니다. 그렇다고 Lovable이 아예 안 되는 영역도 아니므로, 소수 대상 프로토타입으로 범위를 줄여 시작하는 것이 적절합니다.",
    tags: ["대규모 사용자", "높은 AI 호출량", "비용 위험"],
  },
];

const labels: Record<Verdict, string> = {
  mvp: "Lovable로 바로 MVP 제작",
  shrink: "범위를 줄여 프로토타입 제작",
  expert: "전문 개발·별도 검토 필요",
};

export default function Mod05() {
  const [picks, setPicks] = useState<Record<number, Verdict | null>>({});
  const [showCriteria, setShowCriteria] = useState(false);
  const allAnswered = projects.every((_, i) => picks[i]);

  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "러버블이 적합한 교육용 프로젝트를 구분할 수 있다.",
          "장점과 한계를 균형 있게 설명할 수 있다.",
          "러버블이 대신해 주지 못하는 교사의 책임을 이해할 수 있다.",
        ]}
      />

      <KeyMessage>
        러버블은 만능 도구가 아닙니다. 명확한 요구사항과 사람의 검증이 함께 가야
        합니다.
      </KeyMessage>

      <Section title="장점과 한계">
        <div className="grid md:grid-cols-2 gap-4">
          <ConceptCard title="장점">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-5">
              <p className="font-semibold text-ink mb-1.5 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-success mt-0.5 shrink-0" />
                프론트엔드부터 AI·백엔드·배포까지, 풀스택 제작이 쉽다
              </p>
              <p className="text-xs text-body leading-relaxed">
                여러 개발 도구를 따로 설정하지 않아도 하나의 작업 흐름 안에서 작동하는 웹앱을 빠르게 만들 수 있습니다.
              </p>
            </div>

            <ul className="space-y-3">
              <li>
                <p className="font-semibold text-ink flex items-start gap-2 mb-1">
                  <Database className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                  백엔드와 데이터베이스 연결이 간편하다
                </p>
                <p className="text-xs text-muted-text leading-relaxed">
                  Lovable Cloud나 Supabase를 활용해 로그인, 데이터 저장, 사용자별 기록 기능 등을 비교적 쉽게 구현할 수 있다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-ink flex items-start gap-2 mb-1">
                  <Rocket className="w-4 h-4 text-coral mt-0.5 shrink-0" />
                  배포 과정이 매우 간단하다
                </p>
                <p className="text-xs text-muted-text leading-relaxed">
                  별도의 서버 설정에 익숙하지 않아도 작동하는 웹앱을 빠르게 배포하고 공유할 수 있다.
                </p>
              </li>
              <li className="bg-coral/10 border border-coral/25 rounded-lg p-3">
                <p className="font-semibold text-ink flex items-start gap-2 mb-1 flex-wrap">
                  <BrainCircuit className="w-4 h-4 text-coral mt-0.5 shrink-0" />
                  <span className="flex-1">Lovable AI로 생성형 AI 기능을 빠르게 추가할 수 있다</span>
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-pill bg-coral text-white font-medium">
                    MVP에 강점
                  </span>
                </p>
                <p className="text-xs text-body leading-relaxed">
                  초기 프로토타입에서는 외부 AI 서비스의 API 키를 별도로 준비하지 않고도 AI 기능을 구현할 수 있다.
                </p>
              </li>
              <li className="bg-surface-cream-strong border border-hairline rounded-lg p-3">
                <p className="font-semibold text-ink flex items-start gap-2 mb-1">
                  <Rocket className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  MVP 제작에 특히 유리하다
                </p>
                <p className="text-xs text-body leading-relaxed">
                  아이디어를 짧은 시간 안에 실제 작동하는 형태로 만들고 수업이나 사용자 환경에서 시험할 수 있다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-ink flex items-start gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-amber mt-0.5 shrink-0" />
                  대화형 수정이 가능하다
                </p>
                <p className="text-xs text-muted-text leading-relaxed">
                  자연어로 기능과 화면 수정을 반복하며 빠르게 개선할 수 있다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-ink flex items-start gap-2 mb-1">
                  <Github className="w-4 h-4 text-ink mt-0.5 shrink-0" />
                  GitHub와 연결해 확장할 수 있다
                </p>
                <p className="text-xs text-muted-text leading-relaxed">
                  코드를 저장하고 이후 다른 개발 환경에서 이어서 작업할 수 있다.
                </p>
              </li>
            </ul>
          </ConceptCard>

          <ConceptCard title="단점과 한계" tone="dark">
            <div className="bg-warning/15 border border-warning/40 rounded-lg p-4 mb-5">
              <p className="font-semibold text-on-dark flex items-start gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                크레딧 소모가 빠르고, 사용량이 늘수록 비용 부담이 커질 수 있다
              </p>
              <p className="text-xs text-on-dark-soft leading-relaxed">
                수정과 재생성을 반복하거나 여러 프로젝트를 동시에 개발하면 유료 크레딧이 예상보다 빠르게 소모될 수 있습니다.
              </p>
            </div>

            <ul className="space-y-3">
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  여러 앱을 개발하면 비용 부담이 커진다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  프로젝트 수가 늘거나 복잡한 기능을 자주 수정할수록 제작 비용을 예측하기 어려울 수 있다.
                </p>
              </li>
              <li className="bg-warning/15 border border-warning/40 rounded-lg p-3">
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1 flex-wrap">
                  <Server className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <span className="flex-1">Lovable AI는 상용 서비스 단계에서 비용 위험이 있다</span>
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-pill bg-warning text-surface-dark font-medium">
                    확장 시 주의
                  </span>
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  MVP에서는 편리하지만 사용자가 많아지고 AI 호출이 늘어나면 Cloud & AI 사용 비용을 지속적으로 관리해야 한다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-on-dark-soft mt-0.5 shrink-0" />
                  플랫폼 의존성이 생길 수 있다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  Lovable의 Cloud, AI, 배포 기능에 크게 의존하면 다른 플랫폼으로 이전할 때 추가 작업이 필요할 수 있다.
                </p>
              </li>
              <li className="bg-error/15 border border-error/30 rounded-lg p-3">
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1 flex-wrap">
                  <BrainCircuit className="w-4 h-4 text-error mt-0.5 shrink-0" />
                  <span className="flex-1">AI의 코드 생성 성능이 항상 최상급인 것은 아니다</span>
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-pill bg-error text-white font-medium">
                    복잡한 작업 주의
                  </span>
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  복잡한 로직이나 정교한 수정에서는 다른 주요 코딩 AI 도구보다 결과의 정확도나 문제 해결 능력이 부족하게 느껴질 수 있다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  기능을 한꺼번에 많이 요청하면 오류 가능성이 커진다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  기능을 작은 단계로 나누어 요청하고 매 단계 테스트해야 한다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-on-dark-soft mt-0.5 shrink-0" />
                  생성된 코드와 보안 설정은 사람이 검토해야 한다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  자동 생성된 데이터 처리, 인증, 권한, API 설정을 그대로 신뢰해서는 안 된다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <Wrench className="w-4 h-4 text-on-dark-soft mt-0.5 shrink-0" />
                  복잡한 앱은 반복적인 수정과 테스트가 필요하다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  간단한 MVP는 빠르게 만들 수 있지만 안정적인 상용 서비스는 별도의 검증과 개발 역량이 필요하다.
                </p>
              </li>
              <li>
                <p className="font-semibold text-on-dark flex items-start gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-on-dark-soft mt-0.5 shrink-0" />
                  학생 개인정보와 API 키는 자동으로 안전해지지 않는다
                </p>
                <p className="text-xs text-on-dark-soft leading-relaxed">
                  민감한 정보는 입력하지 않고, API 키와 비밀값은 서버 측 보안 저장소에서 관리해야 한다.
                </p>
              </li>
            </ul>
          </ConceptCard>
        </div>

        <div className="mt-6 bg-surface-soft border border-hairline rounded-lg p-6">
          <h3 className="serif text-xl text-ink mb-3">Lovable은 언제 가장 강력한가?</h3>
          <p className="text-sm text-body leading-relaxed mb-5">
            수업 아이디어를 빠르게 검증하고 첫 번째 작동형 웹앱을 만드는 MVP 단계에서는 매우 강력합니다. 그러나 다수의 사용자가 지속적으로 이용하는 상용 서비스로 확장할 때는 크레딧, AI 호출 비용, 보안, 성능, 플랫폼 의존성을 별도로 검토해야 합니다.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-canvas border border-hairline rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2">아이디어 → MVP 제작</p>
              <p className="font-semibold text-ink mb-1">추천도: 매우 높음</p>
              <p className="text-xs text-body">풀스택 구현, AI 연결, 배포가 빠르고 간편함</p>
            </div>
            <div className="bg-canvas border border-hairline rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-2">MVP → 실제 수업 적용</p>
              <p className="font-semibold text-ink mb-1">추천도: 높음</p>
              <p className="text-xs text-body">소규모 사용자 환경에서 기능을 시험하고 개선하기 좋음</p>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-warning font-medium mb-2">대규모·상용 서비스</p>
              <p className="font-semibold text-ink mb-1">추천도: 신중한 검토 필요</p>
              <p className="text-xs text-body">크레딧, AI 사용량, 서버 비용, 보안, 성능 검토 필요</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="러버블이 강한 프로젝트 / 신중하게 접근할 프로젝트">
        <p className="text-sm text-body mb-4">
          Lovable은 풀스택 MVP와 수업용 프로토타입 제작에 강합니다. 다만 사용자 수, 데이터 민감도, 기능 복잡도, 운영 비용이 커질수록 별도의 검토가 필요합니다.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left card */}
          <div className="bg-success/5 border border-success/30 rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold text-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-success" /> Lovable이 특히 강한 프로젝트
              </h4>
              <span className="text-[10px] uppercase tracking-wider bg-success/15 text-success px-2 py-0.5 rounded-full font-medium">
                MVP·프로토타입에 강점
              </span>
            </div>
            <p className="text-sm text-body-strong mb-3 italic">
              “아이디어를 빠르게 작동하는 풀스택 웹앱으로 만들어야 할 때”
            </p>
            <ul className="space-y-2.5 text-sm text-body flex-1">
              {[
                ["입력 → 처리 → 출력 흐름이 분명한 교육용 앱", "형성평가, 피드백 생성, 문항 추천, 수업 기록 정리처럼 사용 흐름이 명확한 앱"],
                ["수업용 시뮬레이션과 학습 게임", "퀴즈, 카드 활동, 개념 분류, 랜덤 역할 배정 등 소규모 수업 도구"],
                ["교사용 업무 보조 도구", "루브릭 작성, 피드백 초안, 자료 분류, 수업 계획 보조 도구"],
                ["백엔드와 데이터 저장이 필요한 소규모 앱", "로그인, 기록 저장, 간단한 데이터베이스, 사용자별 결과 조회가 필요한 앱"],
                ["생성형 AI가 포함된 MVP", "Lovable AI를 활용해 외부 API 키 없이 AI 분석·추천·피드백 기능을 빠르게 시험하는 앱"],
                ["빠른 배포와 공유가 중요한 프로젝트", "짧은 시간 안에 웹앱을 만들어 동료 교사나 학생과 바로 시험해야 하는 프로젝트"],
                ["기능을 작게 나누어 발전시킬 수 있는 앱", "첫 버전은 핵심 기능만 만들고, 수업 적용 후 단계적으로 기능을 추가할 수 있는 프로젝트"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-xs text-body mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-success/10 border border-success/30 rounded-md p-3">
              <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">가장 잘 맞는 상황</p>
              <p className="text-sm text-ink">
                소수의 사용자가 이용하는 수업용 앱, 교사용 도구, 아이디어 검증용 MVP를 빠르게 제작할 때 가장 강력합니다.
              </p>
            </div>
          </div>

          {/* Right card */}
          <div className="bg-warning/5 border border-warning/30 rounded-lg p-5 flex flex-col">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold text-ink flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> 신중하게 접근할 프로젝트
              </h4>
              <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium">
                확장 전 검토 필요
              </span>
            </div>
            <p className="text-sm text-body-strong mb-3 italic">
              “만들 수 없는 것이 아니라, 비용·보안·성능을 먼저 점검해야 하는 프로젝트”
            </p>
            <ul className="space-y-2.5 text-sm text-body flex-1">
              {[
                ["민감한 학생 정보를 다루는 시스템", "학생 실명, 상담 기록, 건강 정보, 행동 기록 등 민감정보를 저장하거나 AI에 전달하는 앱"],
                ["다수 사용자가 동시에 이용하는 서비스", "사용자 수와 AI 호출량이 증가하면 Cloud, 데이터베이스, AI 사용 비용이 커질 수 있음"],
                ["AI 기능을 지속적으로 많이 호출하는 앱", "MVP에서는 편리하지만 실제 운영에서는 Lovable AI 크레딧과 호출 비용을 반드시 계산해야 함"],
                ["결제·성적·생활기록처럼 오류 영향이 큰 시스템", "한 번의 오류가 학생이나 사용자에게 큰 영향을 주는 업무는 사람의 검토와 전문 개발이 필요함"],
                ["역할과 권한 체계가 매우 복잡한 서비스", "관리자, 교사, 학생, 보호자 등 사용자의 권한이 세밀하게 나뉘는 앱"],
                ["실시간 처리와 높은 안정성이 필요한 앱", "대규모 동시 접속, 실시간 협업, 결제 처리, 중단 없는 서비스 운영이 필요한 경우"],
                ["기능과 화면을 반복적으로 크게 변경하는 프로젝트", "수정과 재생성을 계속하면 유료 크레딧이 예상보다 빠르게 소모될 수 있음"],
                ["복잡한 알고리즘이나 정교한 코드가 필요한 앱", "복잡한 로직에서는 AI가 만든 코드의 품질과 오류 해결 능력이 부족할 수 있음"],
                ["처음부터 완성형 상용 서비스를 목표로 하는 프로젝트", "MVP 검증 없이 많은 기능을 한꺼번에 구현하면 비용과 오류가 동시에 커질 수 있음"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="text-xs text-body mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-warning/10 border border-warning/30 rounded-md p-3">
              <p className="text-xs font-semibold text-warning uppercase tracking-wider mb-1">핵심 판단 기준</p>
              <p className="text-sm text-ink">
                민감정보, 많은 사용자, 잦은 AI 호출, 복잡한 권한, 높은 안정성이 포함될수록 전문 개발과 별도의 운영 설계가 필요합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal comparison flow */}
        <div className="mt-6 grid md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <p className="text-xs uppercase tracking-widest text-success font-semibold mb-1">빠른 MVP 제작</p>
            <p className="text-sm text-ink font-semibold mb-1">Lovable의 강점이 가장 크게 드러나는 단계</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2 py-3 text-center">
            <TrendingUp className="w-5 h-5 text-body mb-1" />
            <p className="text-[11px] text-body leading-tight">
              사용자 증가<br />· 기능 복잡화<br />· AI 호출 증가
            </p>
          </div>
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <p className="text-xs uppercase tracking-widest text-warning font-semibold mb-1">운영형·상용 서비스</p>
            <p className="text-sm text-ink font-semibold mb-1">비용, 보안, 성능, 플랫폼 의존성을 다시 검토해야 하는 단계</p>
          </div>
        </div>
      </Section>

      <PracticePanel title="직접 해보기 — 이 프로젝트는 Lovable로 어디까지 만들면 좋을까?">
        <p className="text-sm text-body mb-4">
          각 프로젝트의 데이터 민감도, 기능 복잡도, 사용자 규모, AI 사용량을 고려해 가장 적절한 판단을 선택해 보세요.
        </p>

        <div className="mb-4">
          <button
            onClick={() => setShowCriteria((v) => !v)}
            className="text-xs font-semibold px-3 py-2 rounded-md border border-hairline hover:bg-surface-card inline-flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {showCriteria ? "판단 기준 숨기기" : "판단 기준 보기"}
          </button>
          {showCriteria && (
            <div className="mt-3 bg-canvas border border-hairline rounded-md p-4">
              <ol className="list-decimal list-inside space-y-1 text-sm text-ink">
                <li>민감한 개인정보를 다루는가?</li>
                <li>사용자가 많거나 동시에 접속하는가?</li>
                <li>AI 기능을 반복적으로 많이 호출하는가?</li>
                <li>오류 발생 시 학생이나 사용자에게 큰 피해가 생기는가?</li>
              </ol>
              <p className="mt-3 text-xs text-body">
                ‘예’가 많을수록 바로 완성형 서비스를 만들기보다 범위를 줄이거나 전문 검토를 거치는 것이 안전합니다.
              </p>
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {projects.map((p, i) => {
            const chosen = picks[i];
            const isCorrect = chosen === p.answer;
            return (
              <li key={i} className="p-4 rounded-md bg-canvas border border-hairline">
                <p className="text-body-strong mb-2">{p.text}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card border border-hairline text-body">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["mvp", "shrink", "expert"] as Verdict[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setPicks((s) => ({ ...s, [i]: v }))}
                      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                        chosen === v
                          ? "bg-ink text-white border-ink font-semibold"
                          : "border-hairline hover:bg-surface-card"
                      }`}
                    >
                      {labels[v]}
                    </button>
                  ))}
                </div>
                {chosen && (
                  <div
                    className={`mt-3 rounded-md p-3 text-sm border ${
                      isCorrect
                        ? "bg-success/5 border-success/30"
                        : "bg-canvas border-hairline"
                    }`}
                  >
                    <p className="font-semibold text-ink mb-1">
                      {isCorrect ? "좋은 선택입니다" : "이렇게도 생각해 볼 수 있어요"}
                      {" — "}
                      <span className="text-body">권장: {labels[p.answer]}</span>
                    </p>
                    <p className="text-body">
                      {isCorrect ? p.feedback : p.altFeedback}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {allAnswered && (
          <div className="mt-6 bg-surface-card border border-hairline rounded-lg p-5">
            <p className="text-xs uppercase tracking-widest text-body font-semibold mb-2">Lovable 프로젝트 판단 원칙</p>
            <p className="text-sm text-body mb-3">
              Lovable은 빠른 풀스택 MVP 제작에 매우 적합합니다. 그러나 사용자가 많아지고 데이터가 민감해지며 AI 호출과 기능 복잡도가 증가할수록 비용, 보안, 성능, 운영 구조를 별도로 검토해야 합니다.
            </p>
            <p className="text-base font-semibold text-ink border-l-2 border-accent pl-3">
              처음부터 큰 서비스를 만드는 도구가 아니라, 작은 핵심 기능을 빠르게 검증하고 발전시키는 도구로 활용하세요.
            </p>
          </div>
        )}
      </PracticePanel>

      <InstructorTip>
        “러버블이 가능하다”는 곧 “해도 된다”가 아닙니다. 교육적 타당성과 책임의
        경계를 함께 이야기하세요.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod05:check"
        items={[
          "러버블의 장점 3가지를 설명할 수 있다.",
          "한계와 주의점 3가지를 설명할 수 있다.",
          "첫 프로젝트로 적합한 유형과 피할 유형을 구분할 수 있다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}
