import { useEffect, useRef, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { Section } from "@/components/module-ui";
import pl01 from "@/assets/pl01.png.asset.json";
import pl02 from "@/assets/pl02.png.asset.json";
import pl03 from "@/assets/pl03.png.asset.json";
import pl04 from "@/assets/pl04.png.asset.json";
import pl05 from "@/assets/pl05.png.asset.json";

const IMG = {
  pl01: { src: pl01.url, alt: "Lovable 화면 오른쪽 위의 Publish 버튼 위치" },
  pl02: { src: pl02.url, alt: "Lovable 기본 게시 주소를 확인하고 수정하는 화면" },
  pl03: { src: pl03.url, alt: "Publish 창에서 Add custom domain을 선택하는 화면" },
  pl04: { src: pl04.url, alt: "Domains 화면에서 Connect existing domain을 선택하는 화면" },
  pl05: { src: pl05.url, alt: "외부에서 구입한 도메인을 입력하는 화면" },
};

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <button onClick={onClose} aria-label="닫기" className="absolute top-4 right-4 text-white p-2 rounded-md hover:bg-white/10">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function StepImage({ imgKey, onOpen }: { imgKey: keyof typeof IMG; onOpen: (v: { src: string; alt: string }) => void }) {
  const { src, alt } = IMG[imgKey];
  return (
    <button
      onClick={() => onOpen({ src, alt })}
      className="block mt-3 w-full rounded-md overflow-hidden bg-canvas border border-hairline hover:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      aria-label={`${alt} — 확대`}
    >
      <img src={src} alt={alt} className="w-full h-auto object-contain mx-auto max-h-[360px]" loading="lazy" />
    </button>
  );
}

function Modal({ title, subtitle, onClose, returnFocus, children }: { title: string; subtitle?: string; onClose: () => void; returnFocus: React.RefObject<HTMLButtonElement | null>; children: React.ReactNode }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightbox) onClose();
      if (e.key === "Tab" && containerRef.current) {
        const f = containerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
      returnFocus.current?.focus();
    };
  }, [onClose, lightbox, returnFocus]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-0 sm:p-6" onClick={onClose} role="dialog" aria-modal="true">
        <div ref={containerRef} className="bg-canvas w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-hairline shrink-0">
            <div className="min-w-0">
              <h3 className="serif text-xl sm:text-2xl text-ink">{title}</h3>
              {subtitle && <p className="text-sm text-body mt-1">{subtitle}</p>}
            </div>
            <button ref={closeBtnRef} onClick={onClose} aria-label="닫기" className="shrink-0 p-2 rounded-md hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
            {typeof children === "function" ? (children as (o: (v: { src: string; alt: string }) => void) => React.ReactNode)(setLightbox) : children}
          </div>
        </div>
      </div>
      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

function BasicModal({ onClose, returnFocus }: { onClose: () => void; returnFocus: React.RefObject<HTMLButtonElement | null> }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  return (
    <Modal
      title="Lovable 기본 주소로 앱 배포하기"
      subtitle="도메인을 따로 구입하지 않고 Lovable이 제공하는 'lovable.app' 주소를 사용하는 가장 간단한 배포 방법입니다."
      onClose={onClose}
      returnFocus={returnFocus}
    >
      <div className="bg-surface-card rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink"><span className="text-teal-700">1</span> ① Publish 버튼 누르기</h4>
        <p className="text-sm text-body mt-1">프로젝트 미리보기 화면 오른쪽 위의 파란색 Publish 버튼을 누릅니다.</p>
        <button
          onClick={() => setLightbox(IMG.pl01)}
          className="block mt-3 w-full rounded-md overflow-hidden bg-canvas border border-hairline hover:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          aria-label={`${IMG.pl01.alt} — 확대`}
        >
          <img src={IMG.pl01.src} alt={IMG.pl01.alt} className="w-full h-auto object-contain mx-auto max-h-[360px]" loading="lazy" />
        </button>
        <p className="text-xs text-muted-text mt-3">💡 앱을 수정한 뒤 실제 공개 화면에 반영하려면 Publish 또는 Update를 다시 눌러야 할 수 있습니다.</p>
      </div>

      <div className="bg-surface-card rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">② Lovable 기본 주소 확인 또는 수정하기</h4>
        <p className="text-sm text-body mt-1">Your website URL에 표시된 '이름.lovable.app' 주소를 확인합니다. 연필 아이콘을 누르면 앞부분의 이름을 수정할 수 있습니다.</p>
        <button
          onClick={() => setLightbox(IMG.pl02)}
          className="block mt-3 w-full rounded-md overflow-hidden bg-canvas border border-hairline hover:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          aria-label={`${IMG.pl02.alt} — 확대`}
        >
          <img src={IMG.pl02.src} alt={IMG.pl02.alt} className="w-full h-auto object-contain mx-auto max-h-[360px]" loading="lazy" />
        </button>
        <div className="mt-3 text-sm text-body space-y-1">
          <p>기존 주소: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">think-grow-korean.lovable.app</code></p>
          <p>변경 예시: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">science-feedback-tool.lovable.app</code></p>
        </div>
        <p className="text-xs text-muted-text mt-3">⚠️ 프로젝트 이름을 바꾸는 것과 게시 주소를 바꾸는 것은 서로 다를 수 있습니다. 게시 주소 입력 영역에서 직접 수정하세요.</p>
      </div>

      <div className="bg-surface-cream-strong rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">주소가 만들어지면</h4>
        <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
          <li>게시된 주소를 새 탭에서 열어 확인합니다.</li>
          <li>학생이나 동료 교사에게 주소를 공유합니다.</li>
          <li>앱을 수정한 뒤에는 다시 Publish 또는 Update를 실행합니다.</li>
        </ul>
        <p className="text-sm text-coral font-medium mt-3">첫 번째 완성 경험에서는 이 방법만으로도 충분합니다.</p>
      </div>

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </Modal>
  );
}

const domainServices = [
  { name: "가비아에서 도메인 찾기", url: "https://domain.gabia.com/", feat: "한국어 화면과 국내 고객 지원이 편리합니다. 다양한 도메인 확장자와 DNS 관리 기능을 한곳에서 이용할 수 있습니다.", who: "처음 도메인을 구입하는 국내 사용자" },
  { name: "Cloudflare Registrar 열기", url: "https://www.cloudflare.com/ko-kr/products/registrar/", feat: "도메인 등록과 갱신 가격에 별도 마진을 붙이지 않는 정책을 제공하며, DNS·CDN·보안 기능을 함께 관리하기 좋습니다.", who: "DNS와 여러 하위 도메인을 직접 관리하고 싶은 사용자" },
  { name: "카페24 도메인 안내 보기", url: "https://help.cafe24.com/docs/domain/domain-registration-renewal/", feat: "한국어로 도메인 등록·연장 절차를 확인할 수 있으며, 도메인과 호스팅 서비스를 함께 관리하기 편리합니다.", who: "국내 호스팅이나 쇼핑몰 서비스와 함께 이용할 사용자" },
  { name: "Namecheap에서 도메인 찾기", url: "https://www.namecheap.com/domains/", feat: "여러 국제 도메인의 등록·갱신 가격을 비교하기 쉽고, 다양한 도메인 확장자를 제공합니다. 영어 환경에 익숙한 사용자에게 적합합니다.", who: "국제 도메인과 다양한 확장자를 비교하려는 사용자" },
];

function CustomModal({ onClose, returnFocus }: { onClose: () => void; returnFocus: React.RefObject<HTMLButtonElement | null> }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const step = (n: string, title: string, imgKey: keyof typeof IMG, desc: string, tip?: string, warn?: string, extra?: React.ReactNode) => (
    <div className="bg-surface-card rounded-lg p-4 sm:p-5">
      <h4 className="serif text-lg text-ink">{n} {title}</h4>
      <p className="text-sm text-body mt-1">{desc}</p>
      <button
        onClick={() => setLightbox(IMG[imgKey])}
        className="block mt-3 w-full rounded-md overflow-hidden bg-canvas border border-hairline hover:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
        aria-label={`${IMG[imgKey].alt} — 확대`}
      >
        <img src={IMG[imgKey].src} alt={IMG[imgKey].alt} className="w-full h-auto object-contain mx-auto max-h-[360px]" loading="lazy" />
      </button>
      {extra}
      {tip && <p className="text-xs text-muted-text mt-3">💡 {tip}</p>}
      {warn && <p className="text-xs text-muted-text mt-2">⚠️ {warn}</p>}
    </div>
  );
  return (
    <Modal
      title="외부에서 구입한 도메인 연결하기"
      subtitle="이미 보유한 도메인이나 하위 도메인을 Lovable 프로젝트에 연결하는 방법입니다."
      onClose={onClose}
      returnFocus={returnFocus}
    >
      <div className="bg-surface-cream-strong rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">시작하기 전에</h4>
        <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
          <li>외부 업체에서 구입한 도메인</li>
          <li>해당 도메인의 DNS를 수정할 수 있는 계정</li>
          <li>배포된 Lovable 프로젝트</li>
          <li>커스텀 도메인을 지원하는 Lovable 플랜</li>
        </ul>
      </div>

      {step("①", "Publish 버튼 누르기", "pl01", "프로젝트 미리보기 화면 오른쪽 위의 Publish 버튼을 누릅니다.")}
      {step("②", "Add custom domain 선택하기", "pl03", "Publish 창에서 Add custom domain을 선택합니다.", "위쪽의 'lovable.app' 주소는 기본 게시 주소이며, 외부 주소를 붙이려면 Add custom domain으로 들어갑니다.")}
      {step("③", "Connect existing domain 선택하기", "pl04", "Domains 화면에서 Connect existing domain 영역의 Connect domain 버튼을 누릅니다.", undefined, "이 안내는 이미 다른 업체에서 도메인을 구입한 경우입니다. 위쪽의 Buy a new domain은 Lovable 안에서 새 도메인을 구입하는 별도의 기능입니다.")}
      {step("④", "연결할 도메인 입력하기", "pl05", "연결할 도메인 또는 하위 도메인을 정확하게 입력하고 Continue를 누릅니다.", "다른 업체에서 구입한 도메인은 External로 표시됩니다.", "주소 앞에 `https://`를 붙이지 말고 도메인 이름만 입력하세요.",
        <div className="mt-3 text-sm text-body space-y-1">
          <p>전체 도메인: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">labbitory.com</code></p>
          <p>하위 도메인: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">app.labbitory.com</code></p>
          <p>수업 앱 주소: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">science.labbitory.com</code></p>
        </div>
      )}

      <div className="bg-surface-card rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">⑤ 도메인 구매처에서 DNS 설정하기</h4>
        <p className="text-sm text-body mt-1">Continue를 누르면 Lovable이 도메인 소유 확인과 연결에 필요한 DNS 레코드를 안내합니다. 도메인을 구입한 업체의 DNS 관리 화면으로 이동해 안내된 값을 그대로 입력합니다.</p>
        <p className="text-sm font-semibold text-ink mt-3">기본 흐름</p>
        <ol className="text-sm text-body mt-1 space-y-1 list-decimal list-inside">
          <li>Lovable이 보여주는 DNS 레코드를 확인합니다.</li>
          <li>도메인 구매처의 DNS 관리 메뉴를 엽니다.</li>
          <li>Lovable이 요청한 레코드 유형과 값을 입력합니다.</li>
          <li>Lovable로 돌아와 연결 상태를 확인합니다.</li>
          <li>상태가 Live가 되면 연결된 주소를 열어 봅니다.</li>
        </ol>
        <p className="text-sm font-semibold text-ink mt-3">용어 도움말</p>
        <ul className="text-sm text-body mt-1 space-y-1">
          <li><span className="font-medium">DNS</span> — 구입한 도메인이 어느 웹사이트로 연결될지 정하는 인터넷 주소 설정</li>
          <li><span className="font-medium">A 레코드</span> — 도메인을 특정 서버 주소로 연결하는 설정</li>
          <li><span className="font-medium">TXT 레코드</span> — 도메인의 소유권을 확인할 때 주로 사용하는 문자열 설정</li>
        </ul>
        <p className="text-xs text-muted-text mt-3">⚠️ Lovable 화면에 표시되는 실제 레코드 종류와 값을 그대로 사용하세요. 임의의 값을 입력하지 마세요.</p>
        <p className="text-xs text-muted-text mt-1">DNS 변경은 바로 반영되기도 하지만 일정 시간이 걸릴 수 있습니다.</p>
      </div>

      <div className="bg-surface-card rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">도메인은 어디에서 구입하나요?</h4>
        <p className="text-sm text-body mt-1">가격뿐 아니라 다음 해 갱신 가격, DNS 관리 편의성, 개인정보 보호와 고객 지원도 함께 비교하세요.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {domainServices.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border border-hairline bg-canvas hover:border-coral hover:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">{s.name} <ExternalLink className="w-3.5 h-3.5" /></span>
              <p className="text-xs text-body mt-1.5">{s.feat}</p>
              <p className="text-[11px] text-muted-text mt-2">추천 대상: {s.who}</p>
            </a>
          ))}
        </div>
      </div>

      <div className="border border-hairline rounded-lg p-4">
        <h4 className="font-semibold text-ink text-sm">결제 전에 확인하세요</h4>
        <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
          <li>첫해 가격뿐 아니라 다음 해 갱신 가격도 확인하기</li>
          <li>원하는 주소의 철자와 확장자 확인하기</li>
          <li>자동 갱신 여부 확인하기</li>
          <li>WHOIS 개인정보 보호 제공 여부 확인하기</li>
          <li>DNS 레코드를 직접 수정할 수 있는지 확인하기</li>
          <li>학교 또는 기관 명칭을 사용할 경우 내부 규정 확인하기</li>
        </ul>
      </div>

      <div className="bg-surface-cream-strong rounded-lg p-4 sm:p-5">
        <h4 className="serif text-lg text-ink">연결이 완료되었나요?</h4>
        <ul className="text-sm text-body mt-2 space-y-1 list-disc list-inside">
          <li>Lovable에서 도메인 상태가 Live로 표시되는가?</li>
          <li>입력한 주소로 앱이 정상적으로 열리는가?</li>
          <li>HTTPS 자물쇠가 표시되는가?</li>
          <li>모바일에서도 정상적으로 접속되는가?</li>
          <li>하위 도메인을 입력했다면 정확한 주소로 연결되는가?</li>
        </ul>
        <p className="text-xs text-muted-text mt-3">외부에서 구입한 도메인의 <code className="bg-white/60 px-1 rounded">www</code> 주소도 사용하려면 별도의 연결이 필요할 수 있습니다.</p>
      </div>

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </Modal>
  );
}

export function DeploySection() {
  const [openBasic, setOpenBasic] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
  const basicBtn = useRef<HTMLButtonElement>(null);
  const customBtn = useRef<HTMLButtonElement>(null);

  return (
    <Section title="앱 배포하기">
      <p className="text-sm text-body -mt-2">완성한 앱을 인터넷에 공개하고, 다른 사람이 접속할 주소를 정해 봅니다.</p>
      <p className="text-sm text-body mt-2 mb-4">처음에는 Lovable 기본 주소로 빠르게 배포하고, 필요할 때 내가 보유한 도메인을 연결할 수 있습니다.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 방법 1 */}
        <div className="bg-surface-card rounded-2xl p-6 flex flex-col border-l-4 border-teal-600">
          <span className="inline-block self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-600/10 text-teal-700 mb-3">가장 쉬움</span>
          <h3 className="serif text-xl text-ink">방법 1. Lovable 기본 주소 사용</h3>
          <p className="text-sm text-body mt-2">별도의 도메인을 구매하지 않고 '이름.lovable.app' 주소로 앱을 바로 공개합니다.</p>
          <p className="text-sm text-body mt-2">예시: <code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">my-science-tool.lovable.app</code></p>
          <ul className="text-sm text-body mt-3 space-y-1 list-disc list-inside flex-1">
            <li>별도 도메인 구매가 필요 없음</li>
            <li>설정 과정이 짧음</li>
            <li>첫 실습과 프로토타입 공유에 적합</li>
          </ul>
          <p className="text-xs text-muted-text mt-3">이 주소는 커스텀 도메인이 아니라 Lovable이 기본으로 제공하는 게시 주소입니다.</p>
          <button
            ref={basicBtn}
            onClick={() => setOpenBasic(true)}
            className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-md bg-teal-700 text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 self-start"
          >
            기본 주소 배포 방법 보기
          </button>
        </div>

        {/* 방법 2 */}
        <div className="bg-surface-card rounded-2xl p-6 flex flex-col border-l-4 border-coral">
          <span className="inline-block self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-coral/10 text-coral mb-3">브랜드 주소</span>
          <h3 className="serif text-xl text-ink">방법 2. 내가 구입한 도메인 연결</h3>
          <p className="text-sm text-body mt-2">가비아, Cloudflare 등에서 구입한 도메인이나 하위 도메인을 Lovable 앱에 연결합니다.</p>
          <div className="text-sm text-body mt-2 space-y-1">
            <p>예시:</p>
            <p><code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">labbitory.com</code></p>
            <p><code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">app.labbitory.com</code></p>
            <p><code className="bg-surface-soft px-1.5 py-0.5 rounded text-xs">science.labbitory.com</code></p>
          </div>
          <ul className="text-sm text-body mt-3 space-y-1 list-disc list-inside flex-1">
            <li>주소를 기억하고 공유하기 쉬움</li>
            <li>개인 브랜드나 포털에 활용 가능</li>
            <li>여러 앱을 하위 도메인으로 구분 가능</li>
          </ul>
          <p className="text-xs text-muted-text mt-3">외부 커스텀 도메인 연결은 Lovable 유료 플랜이 필요할 수 있습니다.</p>
          <button
            ref={customBtn}
            onClick={() => setOpenCustom(true)}
            className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-md bg-coral text-white hover:bg-coral-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral self-start"
          >
            외부 도메인 연결 방법 보기
          </button>
        </div>
      </div>

      {/* 비교표 */}
      <div className="mt-6 rounded-2xl border border-hairline overflow-hidden">
        <div className="grid grid-cols-3 bg-surface-soft text-xs font-semibold text-ink">
          <div className="p-3">항목</div>
          <div className="p-3 border-l border-hairline">Lovable 기본 주소</div>
          <div className="p-3 border-l border-hairline">외부 도메인</div>
        </div>
        {[
          ["비용", "별도 도메인 구매 비용 없음", "도메인 구입·갱신 비용 발생"],
          ["주소 예시", "my-app.lovable.app", "myapp.com 또는 app.mydomain.com"],
          ["추천 상황", "수업 실습, MVP, 빠른 공유", "공식 서비스, 개인 브랜드, 장기 운영"],
          ["설정 난이도", "매우 쉬움", "DNS 설정 필요"],
        ].map(([k, a, b]) => (
          <div key={k} className="grid grid-cols-3 text-sm border-t border-hairline">
            <div className="p-3 font-medium text-ink">{k}</div>
            <div className="p-3 border-l border-hairline text-body">{a}</div>
            <div className="p-3 border-l border-hairline text-body">{b}</div>
          </div>
        ))}
      </div>

      {/* 강사가 강조할 문장 */}
      <div className="mt-6 rounded-2xl bg-coral/10 border border-coral/30 p-5">
        <p className="text-xs font-semibold text-coral uppercase tracking-wider">강사가 강조할 한 문장</p>
        <p className="serif text-lg text-ink mt-2">
          첫 실습에서는 lovable.app 기본 주소로 완성을 경험하고, 실제 수업 도구로 장기 운영할 때 외부 도메인을 연결하면 됩니다.
        </p>
      </div>

      {openBasic && <BasicModal onClose={() => setOpenBasic(false)} returnFocus={basicBtn} />}
      {openCustom && <CustomModal onClose={() => setOpenCustom(false)} returnFocus={customBtn} />}
    </Section>
  );
}
