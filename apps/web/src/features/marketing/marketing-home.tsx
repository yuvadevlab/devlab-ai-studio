"use client";

import Link from "next/link";
import { ArrowUpRight, Button } from "@devlab-ai-studio/ui";
import { STUDIO_MARKETING_COPY } from "@/constants/marketing-copy";
import { StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";

/** Public SEO landing page with structured JSON-LD schema and core platform pillars. */
export function MarketingHome() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: STUDIO_SITE_CONFIG.NAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: STUDIO_SITE_CONFIG.DESCRIPTION,
        url: STUDIO_SITE_CONFIG.BASE_URL,
        author: {
          "@type": "Organization",
          name: STUDIO_SITE_CONFIG.AUTHOR,
          url: STUDIO_SITE_CONFIG.AUTHOR_URL,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: STUDIO_MARKETING_COPY.FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="studio-mkt-hero">
        <span className="studio-eyebrow">{STUDIO_MARKETING_COPY.HERO.EYEBROW}</span>
        <h1>{STUDIO_MARKETING_COPY.HERO.TITLE}</h1>
        <p>{STUDIO_MARKETING_COPY.HERO.SUBTITLE}</p>
        <div className="studio-mkt-cta-row">
          <Link href={StudioWebRoute.OVERVIEW}>
            <Button>
              {STUDIO_MARKETING_COPY.HERO.PRIMARY_CTA} <ArrowUpRight size={15} />
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline">{STUDIO_MARKETING_COPY.HERO.SECONDARY_CTA}</Button>
          </Link>
        </div>
      </section>

      <section className="studio-mkt-grid" aria-label={STUDIO_MARKETING_COPY.NAV.FEATURES}>
        {STUDIO_MARKETING_COPY.PILLARS.map((pillar) => (
          <Link key={pillar.href} href={pillar.href} className="studio-mkt-card">
            <span className="studio-eyebrow">{pillar.eyebrow}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.description}</p>
          </Link>
        ))}
      </section>

      <section className="studio-mkt-faq">
        <h2>FAQ</h2>
        <div className="studio-mkt-grid">
          {STUDIO_MARKETING_COPY.FAQS.map((faq) => (
            <article key={faq.question} className="studio-mkt-card">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
