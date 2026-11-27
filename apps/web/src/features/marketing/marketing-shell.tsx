"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight, Button, Hexagon } from "@devlab-ai-studio/ui";
import { STUDIO_MARKETING_COPY } from "@/constants/marketing-copy";
import { StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";

const MARKETING_NAV_ITEMS = [
  { href: "/features", label: STUDIO_MARKETING_COPY.NAV.FEATURES },
  { href: "/ai-gateway", label: STUDIO_MARKETING_COPY.NAV.GATEWAY },
  { href: "/agent-profiles", label: STUDIO_MARKETING_COPY.NAV.PROFILES },
  { href: "/cost-telemetry", label: STUDIO_MARKETING_COPY.NAV.TELEMETRY },
  { href: "/about", label: STUDIO_MARKETING_COPY.NAV.ABOUT },
] as const;

const MARKETING_FOOTER_LINKS = [
  { href: "/about", label: STUDIO_MARKETING_COPY.FOOTER.ABOUT },
  { href: "/privacy-policy", label: STUDIO_MARKETING_COPY.FOOTER.PRIVACY },
  { href: "/terms-of-service", label: STUDIO_MARKETING_COPY.FOOTER.TERMS },
] as const;

/** Public SEO layout shell for marketing and capability pages. */
export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="studio-mkt-page">
      <header className="studio-mkt-header">
        <div className="studio-mkt-header-inner">
          <Link href={StudioWebRoute.HOME} className="studio-brand">
            <span className="studio-brand-mark">
              <Hexagon size={20} strokeWidth={2.2} />
            </span>
            <span className="studio-brand-name">
              {STUDIO_WEB_COPY.BRAND.NAME_PREFIX}
              <span>{STUDIO_WEB_COPY.BRAND.NAME_ACCENT}</span>
            </span>
            <span className="studio-brand-build">{STUDIO_WEB_COPY.BRAND.BUILD_BADGE}</span>
          </Link>

          <nav className="studio-mkt-nav" aria-label={STUDIO_WEB_COPY.BRAND.NAME}>
            {MARKETING_NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "is-active" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link href={StudioWebRoute.OVERVIEW}>
            <Button size="sm">
              {STUDIO_MARKETING_COPY.NAV.OPEN_CONSOLE} <ArrowUpRight size={14} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="studio-mkt-main">{children}</main>

      <footer className="studio-mkt-footer">
        <div className="studio-mkt-footer-inner">
          <span>{STUDIO_MARKETING_COPY.FOOTER.COPYRIGHT}</span>
          <div className="studio-mkt-footer-links">
            {MARKETING_FOOTER_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "is-active" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
