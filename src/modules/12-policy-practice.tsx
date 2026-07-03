import { useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  Eye,
  Copy,
  CheckCheck,
  AlertTriangle,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Section, PracticePanel } from "@/components/module-ui";
import { PolicyModal } from "@/components/policy-modal";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  downloadMarkdown,
  exampleTermsMarkdown,
  examplePrivacyMarkdown,
} from "@/data/policies";

export const FOOTER_PROMPT = `Add a shared legal footer to every page of this web app.

Use the two attached Markdown files as the only source of truth:
1. 이용약관.md
2. 개인정보처리방침.md

Do not invent, rewrite, summarize, or remove clauses from the attached documents.

Footer content:
- Left: copyright notice using the actual service name
- Center: privacy officer or service contact information from the attached documents
- Right: two links labeled "이용약관" and "개인정보처리방침"

Implementation requirements:
1. Create one reusable shared footer component.
2. Render it through the global app layout so it appears consistently on every page.
3. Do not manually duplicate the footer inside individual pages.
4. Match the existing design system, colors, typography, spacing, and responsive layout.
5. Keep all visible UI text in Korean.
6. Use a horizontal three-part layout on desktop.
7. Stack the footer content vertically on mobile.
8. Add a subtle top border and sufficient spacing.
9. Preserve all existing pages, navigation, data, and functionality.

When the user selects "이용약관":
- open an accessible modal
- render the complete Markdown content of 이용약관.md
- display the effective date clearly
- provide Print, Markdown Download, and Close buttons

When the user selects "개인정보처리방침":
- open an accessible modal
- render the complete Markdown content of 개인정보처리방침.md
- display the effective date clearly
- provide Print, Markdown Download, and Close buttons

Modal requirements:
- close button in the top-right corner
- close with the Escape key
- close when the backdrop is selected
- lock background scrolling while open
- trap keyboard focus inside the modal
- return focus to the original footer link after closing
- support long documents with internal scrolling
- use a near-full-screen layout on mobile
- provide readable heading, paragraph, list, and spacing styles

Download requirements:
- download the original attached Markdown content
- preserve Korean characters using UTF-8
- use a real .md filename
- do not download rendered HTML

Important:
- Do not add data collection methods that the app does not use.
- Do not claim that data is stored only in localStorage if the app also uses a cloud database.
- Do not claim that no personal information is processed if nickname, class code, login, analytics, or user records are stored.
- Do not expose API keys, secrets, internal UUIDs, or private database values.
- Do not change unrelated components or pages.

After implementation, test:
- footer visibility on every page
- both policy links
- keyboard and Escape-key behavior
- mobile layout
- print behavior
- Markdown file downloads
- Korean text encoding
- consistency between the displayed documents and downloaded files`;

const EDIT_CHECKLIST = [
  "앱의 정확한 이름과 공개 주소를 입력했는가?",
  "시행일이 실제 공개일과 맞는가?",
  "실제로 받는 정보만 문서에 적었는가?",
  "학생 실명이나 민감정보를 받는 기능이 있는가?",
  "localStorage에 어떤 값을 저장하는지 확인했는가?",
  "Lovable Cloud나 Supabase에 어떤 값을 저장하는지 확인했는가?",
  "생성형 AI나 외부 API로 어떤 정보가 전송되는지 확인했는가?",
  "데이터의 보유 기간과 삭제 방법을 적었는가?",
  "실제 사용 중인 외부 서비스가 모두 포함되었는가?",
  "운영자·개인정보책임자·문의 연락처가 정확한가?",
  "만 14세 미만 학생이 이용하는지 검토했는가?",
  "앱에 없는 기능이나 수집 항목을 문서에서 제거했는가?",
];

const FINAL_CHECKLIST = [
  "홈과 모든 모듈 하단에 푸터가 보이는가?",
  "푸터가 한 번만 표시되는가?",
  "서비스 이름과 주소가 정확한가?",
  "책임자와 문의 연락처가 정확한가?",
  "이용약관 전문이 누락 없이 열리는가?",
  "개인정보처리방침 전문이 누락 없이 열리는가?",
  "시행일이 정확한가?",
  "모달이 ESC 키와 닫기 버튼으로 닫히는가?",
  "모바일에서 문구가 잘리지 않는가?",
  "인쇄할 때 정책 본문만 출력되는가?",
  "Markdown 다운로드 파일이 정상적으로 열리는가?",
  "다운로드한 한국어가 깨지지 않는가?",
  "화면의 문서와 다운로드 문서가 동일한가?",
  "실제 앱의 데이터 처리 방식과 문서가 일치하는가?",
];

const STEPS = [
  { n: 1, label: "예시 파일 내려받기" },
  { n: 2, label: "내 앱에 맞게 수정하기" },
  { n: 3, label: "Lovable에 파일 첨부하기" },
  { n: 4, label: "푸터 제작 프롬프트 입력하기" },
];

export function PolicyPractice() {
  const [check, setCheck] = useLocalStorage<boolean[]>(
    "vibecoding:mod12:policy-edit-check",
    EDIT_CHECKLIST.map(() => false),
  );
  const [finalCheck, setFinalCheck] = useLocalStorage<boolean[]>(
    "vibecoding:mod12:policy-final-check",
    FINAL_CHECKLIST.map(() => false),
  );
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<null | "terms" | "privacy">(null);
  const termsPrevBtn = useRef<HTMLButtonElement>(null);
  const privacyPrevBtn = useRef<HTMLButtonElement>(null);

  const done = useMemo(() => check.filter(Boolean).length, [check]);
  const finalDone = useMemo(() => finalCheck.filter(Boolean).length, [finalCheck]);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(FOOTER_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <Section
      title="공개 전 마지막 단계 — 이용약관과 개인정보처리방침 넣기"
    >
      <p className="text-body mb-8 -mt-2">
        완성한 앱에 정책 문서와 공통 푸터를 추가해 이용자가 언제든 확인할 수
        있게 합니다.
      </p>

      {/* Intro card */}
      <div className="bg-surface-cream-strong rounded-lg p-6 mb-8">
        <h3 className="serif text-xl text-ink mb-2">
          왜 푸터에 정책 문서가 필요할까요?
        </h3>
        <p className="text-body leading-relaxed mb-3">
          공개된 앱은 누가 운영하는지, 문의는 어디에 하는지, 어떤 정보를
          저장하고 처리하는지 이용자가 확인할 수 있어야 합니다.
        </p>
        <div className="flex gap-2 p-3 bg-canvas border border-coral/30 rounded-md">
          <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
          <p className="text-sm text-body-strong">
            AI가 만든 약관을 그대로 게시하지 말고 실제 앱의 기능과 데이터 처리
            방식에 맞게 수정해야 합니다.
          </p>
        </div>
      </div>

      {/* Steps overview */}
      <ol className="grid sm:grid-cols-4 gap-3 mb-10">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="bg-canvas border border-hairline rounded-md p-4 text-center"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ink text-canvas serif text-lg mb-2">
              {s.n}
            </div>
            <p className="text-sm font-medium text-ink">{s.label}</p>
          </li>
        ))}
      </ol>

      {/* STEP 1 */}
      <div className="mb-10">
        <h3 className="serif text-2xl text-ink mb-2">
          ① 예시 Markdown 파일 내려받기
        </h3>
        <p className="text-body mb-5">
          아래 두 파일을 내려받은 뒤 대괄호 안의 내용을 내 앱에 맞게 바꿔
          주세요.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <DownloadCard
            title="이용약관 예시 파일"
            filename="이용약관_예시.md"
            markdown={exampleTermsMarkdown}
            onPreview={() => setPreview("terms")}
            triggerRef={termsPrevBtn}
          />
          <DownloadCard
            title="개인정보처리방침 예시 파일"
            filename="개인정보처리방침_예시.md"
            markdown={examplePrivacyMarkdown}
            onPreview={() => setPreview("privacy")}
            triggerRef={privacyPrevBtn}
          />
        </div>
      </div>

      {/* STEP 2 */}
      <div className="mb-10">
        <h3 className="serif text-2xl text-ink mb-2">
          ② 내 앱의 실제 기능에 맞게 수정하기
        </h3>
        <div className="bg-surface-soft rounded-lg p-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="font-semibold text-ink">문서 수정 체크리스트</p>
            <span className="serif text-xl text-coral">
              12개 중 {done}개 확인
            </span>
          </div>
          <ul className="space-y-1.5">
            {EDIT_CHECKLIST.map((t, i) => (
              <li key={t}>
                <label className="flex items-start gap-3 p-2 rounded-md hover:bg-canvas cursor-pointer">
                  <input
                    type="checkbox"
                    checked={check[i]}
                    onChange={() =>
                      setCheck(check.map((v, idx) => (idx === i ? !v : v)))
                    }
                    className="accent-coral w-4 h-4 mt-0.5"
                  />
                  <span
                    className={
                      check[i]
                        ? "text-muted-text line-through text-sm"
                        : "text-body-strong text-sm"
                    }
                  >
                    {i + 1}. {t}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 bg-coral text-white rounded-lg p-5">
          <p className="serif text-lg">
            문서가 길고 그럴듯한 것보다, 실제 앱의 동작과 정확히 일치하는 것이 더 중요합니다.
          </p>
        </div>
      </div>

      {/* STEP 3 */}
      <div className="mb-10">
        <h3 className="serif text-2xl text-ink mb-2">
          ③ 수정한 두 파일을 Lovable에 첨부하기
        </h3>
        <ol className="list-decimal pl-6 space-y-1.5 text-body mb-4">
          <li>내려받은 두 <code className="text-coral">.md</code> 파일을 문서 편집기에서 엽니다.</li>
          <li>대괄호 안의 내용을 내 앱의 실제 정보로 수정합니다.</li>
          <li>파일명을 알기 쉽게 저장합니다.</li>
          <li>Lovable 프로젝트의 채팅 입력창에서 첨부 버튼을 누릅니다.</li>
          <li>두 Markdown 파일을 모두 선택합니다.</li>
          <li>다음 단계의 푸터 제작 프롬프트를 함께 입력합니다.</li>
        </ol>

        <div className="bg-surface-card rounded-md p-4 mb-4">
          <p className="text-xs uppercase tracking-widest text-muted-text font-medium mb-1">
            권장 파일명
          </p>
          <ul className="flex flex-wrap gap-2 text-sm">
            <li className="px-2 py-1 rounded bg-canvas border border-hairline">
              <Paperclip className="w-3.5 h-3.5 inline mr-1" />
              이용약관.md
            </li>
            <li className="px-2 py-1 rounded bg-canvas border border-hairline">
              <Paperclip className="w-3.5 h-3.5 inline mr-1" />
              개인정보처리방침.md
            </li>
          </ul>
        </div>

        <div className="flex gap-3 p-4 bg-warning/10 border border-warning/40 rounded-lg mb-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-body-strong">
            API 키, 비밀번호, 학생 실명, 학번 또는 상담 기록을 Markdown 파일에
            넣지 마세요.
          </p>
        </div>
        <p className="text-sm text-muted-text">
          두 파일을 첨부하지 않고 프롬프트만 입력하면 Lovable이 실제 문서의
          내용을 알 수 없습니다. 반드시 파일과 프롬프트를 함께 보내세요.
        </p>
      </div>

      {/* STEP 4 */}
      <div className="mb-10">
        <h3 className="serif text-2xl text-ink mb-2">
          ④ Lovable에 푸터 제작 요청하기
        </h3>
        <p className="text-body mb-4">
          수정한 이용약관.md와 개인정보처리방침.md를 첨부한 상태에서 아래 영문
          프롬프트를 복사해 입력하세요.
        </p>

        <div className="bg-surface-dark text-on-dark rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-xs uppercase tracking-widest text-on-dark-soft font-medium">
              푸터 제작 프롬프트 (English)
            </span>
            <button
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-surface-dark-elevated hover:bg-white/10"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "복사됨" : "프롬프트 복사"}
            </button>
          </div>
          <pre className="px-5 py-4 overflow-x-auto text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[420px]">
            {FOOTER_PROMPT}
          </pre>
        </div>
        {copied && (
          <p className="mt-2 text-sm text-success" role="status">
            푸터 제작 프롬프트가 복사되었습니다. 수정한 두 Markdown 파일과 함께 Lovable에 입력하세요.
          </p>
        )}
      </div>

      {/* PREVIEW */}
      <PracticePanel title="완성되면 이런 구조가 됩니다">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-coral text-white font-medium">
              예시
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-text font-medium">
              데스크톱 미리보기
            </span>
          </div>
          <div className="border-t border-hairline bg-surface-cream-strong/60 rounded-md">
            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-[13px] text-muted-text">
              <p className="md:flex-1">© 2026 my-service.com. All rights reserved.</p>
              <p className="md:text-center md:flex-1">
                개인정보책임자: 홍길동 교사 (○○학교) | 문의: 00-0000-0000
              </p>
              <p className="md:text-right md:flex-1 space-x-3">
                <span className="font-semibold text-ink">이용약관</span>
                <span className="text-muted-soft">|</span>
                <span className="font-semibold text-ink">개인정보처리방침</span>
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-coral text-white font-medium">
              예시
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-text font-medium">
              모바일 미리보기
            </span>
          </div>
          <div className="max-w-xs mx-auto sm:mx-0 border-t border-hairline bg-surface-cream-strong/60 rounded-md">
            <div className="px-4 py-4 space-y-2 text-xs text-muted-text">
              <p>© 2026 my-service.com. All rights reserved.</p>
              <p>개인정보책임자: 홍길동 교사 (○○학교) | 문의: 00-0000-0000</p>
              <p className="space-x-3">
                <span className="font-semibold text-ink">이용약관</span>
                <span className="font-semibold text-ink">개인정보처리방침</span>
              </p>
            </div>
          </div>
        </div>
      </PracticePanel>

      {/* FINAL CHECK */}
      <div className="mb-6">
        <h3 className="serif text-2xl text-ink mb-3">푸터 적용 후 확인할 것</h3>
        <div className="bg-surface-soft rounded-lg p-5">
          <div className="flex items-baseline justify-between mb-3">
            <p className="font-semibold text-ink">최종 확인 체크리스트</p>
            <span className="serif text-xl text-coral">
              14개 중 {finalDone}개 확인
            </span>
          </div>
          <ul className="space-y-1.5">
            {FINAL_CHECKLIST.map((t, i) => (
              <li key={t}>
                <label className="flex items-start gap-3 p-2 rounded-md hover:bg-canvas cursor-pointer">
                  <input
                    type="checkbox"
                    checked={finalCheck[i]}
                    onChange={() =>
                      setFinalCheck(
                        finalCheck.map((v, idx) => (idx === i ? !v : v)),
                      )
                    }
                    className="accent-coral w-4 h-4 mt-0.5"
                  />
                  <span
                    className={
                      finalCheck[i]
                        ? "text-muted-text line-through text-sm"
                        : "text-body-strong text-sm"
                    }
                  >
                    {i + 1}. {t}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preview modals share the same PolicyModal for consistency */}
      <PolicyModal
        open={preview === "terms"}
        onClose={() => setPreview(null)}
        title="이용약관 예시 파일 미리보기"
        effectiveDate="교사가 지정"
        markdown={exampleTermsMarkdown}
        filename="이용약관_예시.md"
        returnFocusTo={termsPrevBtn.current}
      />
      <PolicyModal
        open={preview === "privacy"}
        onClose={() => setPreview(null)}
        title="개인정보처리방침 예시 파일 미리보기"
        effectiveDate="교사가 지정"
        markdown={examplePrivacyMarkdown}
        filename="개인정보처리방침_예시.md"
        returnFocusTo={privacyPrevBtn.current}
      />
    </Section>
  );
}

function DownloadCard({
  title,
  filename,
  markdown,
  onPreview,
  triggerRef,
}: {
  title: string;
  filename: string;
  markdown: string;
  onPreview: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="bg-canvas border border-hairline rounded-lg p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-coral" />
        <h4 className="font-semibold text-ink">{title}</h4>
      </div>
      <p className="text-xs text-muted-text mb-4 flex-1">
        파일명: <code className="text-ink">{filename}</code>
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => downloadMarkdown(filename, markdown)}
          className="inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-md bg-coral text-white hover:bg-coral-active w-full"
        >
          <Download className="w-3.5 h-3.5" />
          {filename} 다운로드
        </button>
        <button
          ref={triggerRef}
          onClick={onPreview}
          className="inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-md border border-hairline hover:bg-surface-card w-full"
        >
          <Eye className="w-3.5 h-3.5" /> 내용 미리보기
        </button>
      </div>
    </div>
  );
}

// Exposed for the resources page bundle.
export { EDIT_CHECKLIST, FINAL_CHECKLIST };

export const attachInstructions = `# Lovable 파일 첨부 방법

1. 내려받은 두 .md 파일을 문서 편집기에서 엽니다.
2. 대괄호 안의 내용을 내 앱의 실제 정보로 수정합니다.
3. 파일명을 알기 쉽게 저장합니다 (권장: 이용약관.md, 개인정보처리방침.md).
4. Lovable 프로젝트의 채팅 입력창에서 첨부 버튼을 누릅니다.
5. 두 Markdown 파일을 모두 선택합니다.
6. 푸터 제작 프롬프트를 함께 입력합니다.

주의: API 키, 비밀번호, 학생 실명·학번, 상담 기록을 Markdown 파일에 넣지 마세요.
`;
