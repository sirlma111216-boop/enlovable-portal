import { useState, useEffect } from "react";
import { X, Copy, CheckCheck, ExternalLink } from "lucide-react";
import { Section } from "@/components/module-ui";
import gd01 from "@/assets/gd01.png.asset.json";
import gd02 from "@/assets/gd02.png.asset.json";
import gd03 from "@/assets/gd03.png.asset.json";
import gd04 from "@/assets/gd04.png.asset.json";

const designPrompt = `첨부한 DESIGN.md를 이 프로젝트의 디자인 기준으로 사용해줘.
색상, 글꼴, 간격, 카드와 버튼 스타일을 참고해서 지금 앱에 자연스럽게 적용해줘.
기존 기능과 콘텐츠, 화면 구성은 그대로 두고, 모든 문구는 한국어로 유지해줘.
원본 사이트의 로고, 브랜드 이름, 이미지는 복제하지 마.`;

const fontPrompt = `첨부한 폰트 파일을 이 프로젝트에 적용해줘.
폰트 이름: [다운로드한 폰트 이름]
제목과 주요 섹션에만 이 폰트를 사용하고, 본문은 읽기 쉬운 한글 폰트를 유지해줘.
한글이 없는 폰트라면 영문에만 사용하고 한글은 기본 폰트로 남겨줘.
기존 레이아웃과 기능은 바꾸지 말고, 모바일에서도 잘 보이게 해줘.`;


const steps = [
  {
    title: "① getdesign.md에서 디자인 찾기",
    img: gd01.url,
    alt: "getdesign.md 첫 화면에서 디자인 목록으로 이동하는 화면",
    desc: "getdesign.md에 접속한 뒤 디자인 목록을 살펴보는 버튼을 선택합니다.",
    tip: "처음에는 앱의 내용과 완전히 같은 디자인보다, 원하는 색상과 분위기가 비슷한 디자인을 골라도 충분합니다.",
    link: { label: "getdesign.md 열기", url: "https://getdesign.md/" },
  },
  {
    title: "② 마음에 드는 디자인 선택하기",
    img: gd02.url,
    alt: "getdesign.md 디자인 목록에서 원하는 디자인을 선택하는 화면",
    desc: "디자인 목록에서 원하는 분위기의 디자인을 선택합니다.",
    tip: "밝은 화면, 어두운 화면, 교육용, 기술적인 느낌처럼 전체적인 분위기를 먼저 살펴보세요.",
  },
  {
    title: "③ DESIGN.md 파일 내려받기",
    img: gd03.url,
    alt: "선택한 디자인의 DESIGN.md 파일을 내려받는 화면",
    desc: "선택한 디자인의 상세 화면에서 'Download DESIGN.md' 버튼을 누릅니다.",
    tip: "DESIGN.md에는 색상, 글꼴, 간격, 버튼과 카드 등의 디자인 규칙이 정리되어 있습니다.",
  },
  {
    title: "④ 내려받은 파일 확인하기",
    img: gd04.url,
    alt: "다운로드 폴더에서 DESIGN.md 파일을 확인한 화면",
    desc: "다운로드 폴더에서 이름이 DESIGN으로 시작하고 확장자가 .md인 파일을 확인합니다.",
    tip: "파일의 내용을 직접 수정하지 않아도 됩니다. 내려받은 파일을 그대로 Lovable에 첨부할 수 있습니다.",
  },
];

const fontSites = [
  { name: "Google Fonts", url: "https://fonts.google.com/", sub: "한글·영문 오픈 폰트" },
  { name: "눈누", url: "https://noonnu.cc/", sub: "다양한 무료 한글 폰트" },
  { name: "Font Squirrel", url: "https://www.fontsquirrel.com/", sub: "다양한 영문 무료 폰트" },
];

function CopyBlock({ code, doneMsg }: { code: string; doneMsg: string }) {
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setMsg(doneMsg);
      setTimeout(() => { setCopied(false); setMsg(""); }, 2000);
    } catch {}
  };
  return (
    <div className="relative">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        프롬프트 복사
      </button>
      <pre className="bg-ink text-canvas rounded-md p-4 pt-10 text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {code}
      </pre>
      {msg && <p className="text-xs text-coral mt-2">{msg}</p>}
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-4 right-4 text-white p-2 rounded-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function DesignModal({ onClose }: { onClose: () => void }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && !lightbox) onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose, lightbox]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-6"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-modal-title"
      >
        <div
          className="bg-canvas w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-hairline shrink-0">
            <div className="min-w-0">
              <h3 id="design-modal-title" className="serif text-xl sm:text-2xl text-ink">
                getdesign.md로 디자인 기준 가져오기
              </h3>
              <p className="text-sm text-body mt-1">
                원하는 디자인을 선택하고 DESIGN.md 파일을 Lovable에 첨부하는 과정입니다.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="shrink-0 p-2 rounded-md hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
            <p className="text-xs text-muted-text bg-surface-soft rounded-md p-3">
              DESIGN.md는 디자인의 색상, 타이포그래피, 간격과 구성 원칙을 참고하기 위한 자료입니다.
              원본 사이트의 로고, 브랜드 이름, 사진과 콘텐츠를 그대로 복제하지 마세요.
            </p>

            {steps.map((s, i) => (
              <div key={s.title} className="bg-surface-card rounded-lg p-4 sm:p-5">
                <h4 className="serif text-lg text-ink">{s.title}</h4>
                <p className="text-sm text-body mt-1">{s.desc}</p>
                <button
                  onClick={() => setLightbox({ src: s.img, alt: s.alt })}
                  className={`block mt-3 rounded-md overflow-hidden bg-canvas border border-hairline hover:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${i === 3 ? "max-w-[180px]" : "w-full"}`}
                  aria-label={`${s.alt} — 확대`}
                >
                  <img src={s.img} alt={s.alt} className={`w-full h-auto object-contain mx-auto ${i === 3 ? "max-h-[100px]" : "max-h-[420px]"}`} loading="lazy" />
                </button>
                {s.link && (
                  <a
                    href={s.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm px-3 py-1.5 rounded-md bg-coral text-white hover:bg-coral-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                  >
                    {s.link.label} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <p className="text-xs text-muted-text mt-3">💡 {s.tip}</p>
              </div>
            ))}

            <div className="bg-surface-cream-strong rounded-lg p-4 sm:p-5">
              <h4 className="serif text-lg text-ink">⑤ Lovable 프로젝트에 첨부하기</h4>
              <p className="text-sm text-body mt-1 mb-3">
                Lovable 채팅 입력창의 첨부 버튼을 눌러 내려받은 DESIGN.md 파일을 추가한 뒤, 아래 프롬프트를 함께 입력합니다.
              </p>
              <CopyBlock code={designPrompt} doneMsg="디자인 적용 프롬프트가 복사되었습니다." />
              <p className="text-xs text-muted-text mt-3">
                DESIGN.md 파일과 위 프롬프트를 함께 보내야 디자인 기준이 더 명확하게 전달됩니다.
              </p>
            </div>

            <div className="border border-hairline rounded-lg p-4">
              <h4 className="font-semibold text-ink text-sm">적용하기 전에 확인하세요</h4>
              <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
                <li>기존 기능과 콘텐츠를 유지하도록 요청하기</li>
                <li>원본 브랜드의 로고·사진·문구는 복제하지 않기</li>
                <li>디자인 적용 후 모바일 화면도 확인하기</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </>
  );
}

export function DesignPrepSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section title="만들기 전, 디자인 준비하기">
      <p className="text-sm text-body -mt-2 mb-4">
        앱의 기능을 정했다면 디자인과 글꼴의 방향을 간단히 선택해 보세요.
      </p>

      <div className="flex flex-col gap-4">
        {/* Card 1 — Design */}
        <div className="bg-surface-card rounded-2xl p-6 flex flex-col">
          <span className="inline-block self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-coral/10 text-coral mb-3">
            DESIGN.md 활용
          </span>
          <h3 className="serif text-xl text-ink">내 맘에 드는 디자인 정하기</h3>
          <p className="text-sm text-body mt-2">
            getdesign.md에서 마음에 드는 디자인의 DESIGN.md 파일을 내려받아 Lovable 프로젝트의 디자인 기준으로 사용할 수 있습니다.
          </p>
          <p className="text-sm text-body mt-3 flex-1">
            디자인 파일을 첨부하면 색상, 글꼴, 간격과 컴포넌트 스타일을 한 번에 전달할 수 있습니다.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-md bg-coral text-white hover:bg-coral-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral self-start"
          >
            자세한 방법 보기
          </button>
        </div>

        {/* Card 2 — Fonts */}
        <div className="bg-surface-card rounded-2xl p-6 flex flex-col">
          <span className="inline-block self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-coral/10 text-coral mb-3">
            폰트 파일 활용
          </span>
          <h3 className="serif text-xl text-ink">내 맘에 드는 폰트 정하기</h3>
          <p className="text-sm text-body mt-2">
            무료 폰트 사이트에서 원하는 글꼴을 내려받아 Lovable에 첨부하고, 앱에 적용해 달라고 요청할 수 있습니다.
          </p>

          <ol className="mt-4 space-y-1.5 text-sm text-body">
            <li><span className="serif text-coral mr-1">1.</span>무료 폰트 사이트에서 원하는 글꼴을 찾습니다.</li>
            <li><span className="serif text-coral mr-1">2.</span>사용 범위를 확인하고 폰트 파일을 내려받습니다.</li>
            <li><span className="serif text-coral mr-1">3.</span>폰트 파일을 Lovable에 첨부한 뒤 적용 프롬프트를 입력합니다.</li>
          </ol>
          <p className="text-xs text-muted-text mt-3">
            가능하면 웹 사용에 적합한 WOFF2 또는 WOFF 파일을 사용하고, 해당 형식이 없다면 TTF 또는 OTF 파일을 사용할 수 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
            {fontSites.map((f) => (
              <a
                key={f.name}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-3 py-2.5 rounded-md border border-hairline bg-canvas hover:border-coral hover:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                <span className="block text-sm font-semibold text-ink">{f.name}</span>
                <span className="block text-[11px] text-muted-text mt-0.5">{f.sub}</span>
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-text mt-3">
            무료 폰트라도 웹 사용, 파일 변환, 재배포와 상업적 이용 범위가 다를 수 있으므로 각 폰트의 라이선스를 확인하세요.
          </p>

          <h4 className="font-semibold text-ink text-sm mt-5 mb-2">Lovable에는 이렇게 요청하세요</h4>
          <CopyBlock code={fontPrompt} doneMsg="폰트 적용 프롬프트가 복사되었습니다." />
          <p className="text-xs text-muted-text mt-2">
            대괄호 안의 '다운로드한 폰트 이름'을 실제 폰트 이름으로 바꿔 사용하세요.
          </p>

          <div className="mt-5 border border-hairline rounded-lg p-4">
            <h4 className="font-semibold text-ink text-sm">처음에는 이렇게 적용하세요</h4>
            <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
              <li>제목용 폰트 1개만 먼저 선택하기</li>
              <li>본문은 읽기 쉬운 기본 한글 폰트 유지하기</li>
              <li>너무 많은 폰트를 한 화면에서 섞지 않기</li>
            </ul>
            <p className="text-sm text-coral font-medium mt-3">
              첫 프로젝트에서는 제목용 폰트 하나만 바꿔도 충분합니다.
            </p>
          </div>
        </div>
      </div>

      {open && <DesignModal onClose={() => setOpen(false)} />}
    </Section>
  );
}
