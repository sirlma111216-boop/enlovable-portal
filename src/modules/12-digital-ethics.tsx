import { moduleByNumber } from "@/data/course";
import {
  ModuleHeader,
  Section,
  LearningObjectives,
  KeyMessage,
  InstructorTip,
  CompletionChecklist,
  ModuleNavigation,
} from "@/components/module-ui";
import { PolicyPractice } from "./12-policy-practice";
import { Shield, Key, AlertOctagon, Scale, Copyright, Accessibility, GraduationCap } from "lucide-react";

const m = moduleByNumber(12)!;

const cards = [
  {
    icon: Shield,
    title: "개인정보 보호",
    items: [
      "학생 실명·연락처·건강·상담·가정 정보 입력 금지",
      "꼭 필요하지 않은 데이터는 수집하지 않기",
      "가명, 번호, 범주형 정보 우선 사용",
    ],
  },
  {
    icon: Key,
    title: "API 키와 보안",
    items: [
      "브라우저 코드에 비밀 키 넣지 않기",
      "서버 secret 사용",
      "권한과 공개 범위 확인",
    ],
  },
  {
    icon: AlertOctagon,
    title: "AI 환각과 오류",
    items: [
      "결과를 사실처럼 확정하지 않기",
      "교과 내용·평가 결과를 교사가 검토하기",
      "중요한 결정에 AI 단독 사용 금지",
    ],
  },
  {
    icon: Scale,
    title: "편향과 공정성",
    items: [
      "학생 수준을 고정된 능력으로 단정하지 않기",
      "성별·배경·장애 등 편향 표현 확인",
      "불이익을 주는 자동 판단 피하기",
    ],
  },
  {
    icon: Copyright,
    title: "저작권과 출처",
    items: [
      "외부 이미지·문항·자료의 사용 권한 확인",
      "필요한 경우 출처 표시",
      "생성 결과도 유사성과 권리 문제 확인",
    ],
  },
  {
    icon: Accessibility,
    title: "접근성",
    items: [
      "키보드 사용 가능",
      "충분한 색 대비",
      "글자 크기 확대",
      "이미지 대체 텍스트",
      "색만으로 정보 구분하지 않기",
    ],
  },
  {
    icon: GraduationCap,
    title: "교육적 타당성",
    items: [
      "멋진 기능보다 학습 목표에 필요한가?",
      "학생의 사고를 대신해 버리지 않는가?",
      "교사와 학생의 관계를 약화시키지 않는가?",
    ],
  },
];

export default function Mod12() {
  return (
    <article className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <ModuleHeader module={m} />

      <LearningObjectives
        items={[
          "학생 데이터와 개인정보 위험을 판단할 수 있다.",
          "AI 환각·편향·저작권·접근성 문제를 점검할 수 있다.",
          "교육용 앱 공개 전 필수 검토 항목을 적용할 수 있다.",
        ]}
      />

      <KeyMessage>AI가 만들어도 검증은 교사가 합니다.</KeyMessage>

      <Section title="7가지 안전·윤리 카드">
        <ul className="grid sm:grid-cols-2 gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.title} className="bg-surface-card rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 text-coral" />
                  <h3 className="font-semibold text-ink">{c.title}</h3>
                </div>
                <ul className="text-sm text-body space-y-1 list-disc list-inside">
                  {c.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </li>
            );
          })}
        </ul>
      </Section>

      <PolicyPractice />



      <section className="bg-coral text-white rounded-lg p-8 sm:p-12 my-10 text-center">
        <p className="serif text-2xl sm:text-3xl leading-snug mb-3">
          개발자가 되는 것이 아니라, AI와 함께 내 수업을 설계하는 감각을 갖는 것.
        </p>
        <p className="text-base sm:text-lg opacity-90">
          교사의 교육 전문성 + AI와의 협업 설계 역량
        </p>
      </section>

      <InstructorTip>
        “이 도구가 학생의 사고를 대신해 버리는가?”라는 질문은 마지막에 한 번 더
        모두에게 던지세요.
      </InstructorTip>

      <CompletionChecklist
        storageKey="vibecoding:mod12:check"
        items={[
          "7가지 윤리 영역을 모두 살펴봤다.",
          "시나리오 6개에 응답했다.",
          "공개 전 10문항을 모두 통과시켰다.",
        ]}
      />

      <ModuleNavigation module={m} />
    </article>
  );
}
