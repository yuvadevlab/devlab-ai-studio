"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDevLabAuth } from "@yuva-devlab/auth-client";
import {
  Activity,
  AppWindow,
  Boxes,
  Button,
  Cpu,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Sliders,
  StudioSelectField,
  Sun,
  Terminal,
  useTheme,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import { fetchAnalyticsSummary, fetchApps } from "@/lib/studio-api";

const NAV_ITEMS = [
  { href: StudioWebRoute.OVERVIEW, label: STUDIO_WEB_COPY.NAV.OVERVIEW, icon: LayoutDashboard },
  { href: StudioWebRoute.PROVIDERS, label: STUDIO_WEB_COPY.NAV.PROVIDERS, icon: Cpu },
  { href: StudioWebRoute.MODELS, label: STUDIO_WEB_COPY.NAV.MODELS, icon: Boxes },
  { href: StudioWebRoute.APPS, label: STUDIO_WEB_COPY.NAV.APPS, icon: AppWindow },
  { href: StudioWebRoute.PROFILES, label: STUDIO_WEB_COPY.NAV.PROFILES, icon: Sliders },
  { href: StudioWebRoute.TELEMETRY, label: STUDIO_WEB_COPY.NAV.TELEMETRY, icon: Activity },
  { href: StudioWebRoute.PLAYGROUND, label: STUDIO_WEB_COPY.NAV.PLAYGROUND, icon: Terminal },
] as const;

const PAGE_TITLES: Record<string, string> = {
  [StudioWebRoute.OVERVIEW]: STUDIO_WEB_COPY.NAV.OVERVIEW,
  [StudioWebRoute.PROVIDERS]: STUDIO_WEB_COPY.NAV.PROVIDERS,
  [StudioWebRoute.MODELS]: STUDIO_WEB_COPY.NAV.MODELS,
  [StudioWebRoute.APPS]: STUDIO_WEB_COPY.NAV.APPS,
  [StudioWebRoute.PROFILES]: STUDIO_WEB_COPY.NAV.PROFILES,
  [StudioWebRoute.TELEMETRY]: STUDIO_WEB_COPY.NAV.TELEMETRY,
  [StudioWebRoute.PLAYGROUND]: STUDIO_WEB_COPY.NAV.PLAYGROUND,
};

/** Persistent Studio shell with sidebar navigation, app switcher, topbar, and footer. */
export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useDevLabAuth();
  const { activeAppSlug, setActiveAppSlug } = useActiveApp();
  const { data: apps = [] } = useQuery({
    queryKey: [StudioQueryKey.APPS],
    queryFn: fetchApps,
  });

  const selectedApp = apps.find((app) => app.slug === activeAppSlug) ?? apps[0];
  const { data: summary } = useQuery({
    queryKey: [StudioQueryKey.ANALYTICS_SUMMARY, selectedApp?.slug ?? ""],
    queryFn: () => fetchAnalyticsSummary(selectedApp?.slug ?? ""),
    enabled: Boolean(selectedApp?.slug),
  });

  const currentPage = pathname.startsWith(StudioWebRoute.MODELS)
    ? STUDIO_WEB_COPY.NAV.MODELS
    : (PAGE_TITLES[pathname] ?? STUDIO_WEB_COPY.NAV.OVERVIEW);
  const budgetUsd = selectedApp ? Number(selectedApp.monthlyBudgetUsd) : 0;
  const spendUsd = summary ? Number(summary.totalCostUsd) : 0;
  const budgetPct = budgetUsd > 0 ? Math.min(100, Math.max(0, (spendUsd / budgetUsd) * 100)) : 0;
  const operatorName = user?.name || STUDIO_WEB_COPY.BRAND.OPERATOR_NAME;
  const operatorRole = user?.email || STUDIO_WEB_COPY.BRAND.OPERATOR_ROLE;
  const operatorInitials = operatorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <Link
          href={StudioWebRoute.OVERVIEW}
          className="studio-brand"
          aria-label={STUDIO_WEB_COPY.NAV.OVERVIEW}
        >
          <span className="studio-brand-mark">
            <Hexagon size={20} strokeWidth={2.2} />
          </span>
          <span className="studio-brand-name">
            {STUDIO_WEB_COPY.BRAND.NAME_PREFIX}
            <span>{STUDIO_WEB_COPY.BRAND.NAME_ACCENT}</span>
          </span>
          <span className="studio-brand-build">{STUDIO_WEB_COPY.BRAND.BUILD_BADGE}</span>
        </Link>

        <div className="studio-sidebar-label">{STUDIO_WEB_COPY.BRAND.WORKSPACE_LABEL}</div>
        <StudioSelectField
          ariaLabel={STUDIO_WEB_COPY.BRAND.WORKSPACE_LABEL}
          value={selectedApp?.slug ?? ""}
          onValueChange={setActiveAppSlug}
          placeholder={STUDIO_WEB_COPY.BRAND.NO_APP_SELECTED}
          options={apps.map((app) => ({ value: app.slug, label: app.slug }))}
        />

        <div className="studio-sidebar-label">{STUDIO_WEB_COPY.BRAND.PLATFORM_LABEL}</div>
        <nav className="studio-navigation" aria-label={STUDIO_WEB_COPY.BRAND.PLATFORM_LABEL}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === StudioWebRoute.MODELS
                ? pathname.startsWith(StudioWebRoute.MODELS)
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`studio-nav-item${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {href === StudioWebRoute.TELEMETRY ? <span className="studio-live-dot" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="studio-sidebar-bottom">
          <div className="studio-usage-line">
            <span>{STUDIO_WEB_COPY.BRAND.BUDGET_LABEL}</span>
            <strong>
              {selectedApp
                ? `$${spendUsd.toFixed(2)} / $${budgetUsd.toLocaleString()}`
                : `$${budgetUsd.toLocaleString()}`}
            </strong>
          </div>
          <div className="studio-usage-track">
            <span style={{ width: `${budgetPct.toFixed(1)}%` }} />
          </div>
          <div className="studio-user-row">
            <span className="studio-avatar">
              {operatorInitials || STUDIO_WEB_COPY.BRAND.OPERATOR_INITIALS}
            </span>
            <span className="studio-user-copy">
              <strong>{operatorName}</strong>
              <small>{operatorRole}</small>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={STUDIO_WEB_COPY.BRAND.THEME_TOGGLE_LABEL}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={STUDIO_WEB_COPY.BRAND.SIGN_OUT_LABEL}
              onClick={logout}
            >
              <LogOut size={15} />
            </Button>
          </div>
        </div>
      </aside>

      <div className="studio-main-column">
        <header className="studio-topbar">
          <div className="studio-breadcrumb">
            <span>{STUDIO_WEB_COPY.BRAND.BREADCRUMB_ROOT}</span>
            <span>/</span>
            <strong>{currentPage}</strong>
          </div>
          <div className="studio-topbar-actions">
            {selectedApp ? (
              <span className="studio-topbar-app">
                <span className="studio-live-dot" />
                {selectedApp.slug}
              </span>
            ) : null}
            <span className="studio-topbar-separator" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(StudioWebRoute.PROVIDERS)}
            >
              <Plus size={14} /> {STUDIO_WEB_COPY.BRAND.NEW_PROVIDER_CTA}
            </Button>
          </div>
        </header>

        <main className="studio-main">{children}</main>

        <footer className="studio-footer">
          <span>{STUDIO_WEB_COPY.BRAND.FOOTER_TEXT}</span>
          <span>{selectedApp?.slug ?? STUDIO_WEB_COPY.BRAND.NO_APP_SELECTED}</span>
        </footer>
      </div>
    </div>
  );
}
