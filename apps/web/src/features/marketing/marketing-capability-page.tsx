"use client";

import Link from "next/link";
import { ArrowUpRight, Button } from "@devlab-ai-studio/ui";
import { STUDIO_MARKETING_COPY, type MarketingPageSpec } from "@/constants/marketing-copy";
import { StudioWebRoute } from "@/constants/routes.constants";

/** Shared public SEO capability/legal page view. */
export function MarketingCapabilityPage({ page }: { page: MarketingPageSpec }) {
  return (
    <>
      <section className="studio-mkt-hero">
        <span className="studio-eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <div className="studio-mkt-cta-row">
          <Link href={StudioWebRoute.OVERVIEW}>
            <Button>
              {STUDIO_MARKETING_COPY.NAV.OPEN_CONSOLE} <ArrowUpRight size={15} />
            </Button>
          </Link>
          <Link href={StudioWebRoute.HOME}>
            <Button variant="outline">{STUDIO_MARKETING_COPY.NAV.BACK_HOME}</Button>
          </Link>
        </div>
      </section>

      <section className="studio-mkt-grid-2">
        {page.highlights.map((item) => (
          <article key={item.title} className="studio-mkt-card">
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}
