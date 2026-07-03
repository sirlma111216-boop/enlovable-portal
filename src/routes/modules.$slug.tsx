import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { moduleBySlug } from "@/data/course";
import { useProgress } from "@/hooks/use-progress";

import Mod01 from "@/modules/01-vibe-coding";
import Mod02 from "@/modules/02-why-teachers-need-it";
import Mod03 from "@/modules/03-developer-terms";
import Mod04 from "@/modules/04-tools";
import Mod05 from "@/modules/05-lovable-pros-cons";
import Mod06 from "@/modules/06-lovable-basics";
import Mod07 from "@/modules/07-first-project";
import Mod08 from "@/modules/08-prd-workshop";
import Mod09 from "@/modules/09-backend";
import Mod10 from "@/modules/10-generative-api";
import Mod11 from "@/modules/11-classroom-project";
import Mod12 from "@/modules/12-digital-ethics";

const map: Record<string, () => React.ReactNode> = {
  "01-vibe-coding": Mod01,
  "02-why-teachers-need-it": Mod02,
  "03-developer-terms": Mod03,
  "04-tools": Mod04,
  "05-lovable-pros-cons": Mod05,
  "06-lovable-basics": Mod06,
  "07-first-project": Mod07,
  "08-prd-workshop": Mod08,
  "09-backend": Mod09,
  "10-generative-api": Mod10,
  "11-classroom-project": Mod11,
  "12-digital-ethics": Mod12,
};

export const Route = createFileRoute("/modules/$slug")({
  beforeLoad: ({ params }) => {
    if (!map[params.slug]) throw notFound();
  },
  head: ({ params }) => {
    const m = moduleBySlug(params.slug);
    if (!m) return { meta: [{ title: "모듈을 찾을 수 없습니다" }] };
    const title = `Module ${m.number}. ${m.title} — 내 수업에 코딩 한 스푼`;
    return {
      meta: [
        { title },
        { name: "description", content: m.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: m.summary },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <h1 className="serif text-4xl mb-3">모듈을 찾을 수 없습니다</h1>
      <p className="text-muted-text mb-6">요청하신 모듈이 존재하지 않습니다.</p>
      <Link to="/" className="text-coral hover:text-coral-active font-medium">홈으로 돌아가기 →</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="max-w-2xl mx-auto px-5 py-20 text-center">
      <h1 className="serif text-2xl mb-3">이 모듈을 불러오지 못했습니다</h1>
      <p className="text-sm text-muted-text mb-6">{error.message}</p>
      <Link to="/" className="text-coral hover:text-coral-active font-medium">홈으로</Link>
    </div>
  ),
  component: ModuleRoute,
});

function ModuleRoute() {
  const { slug } = Route.useParams();
  const { visit } = useProgress();
  useEffect(() => {
    visit(slug);
  }, [slug, visit]);

  const Comp = map[slug];
  if (!Comp) return null;
  return <Comp />;
}
