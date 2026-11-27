import type { Metadata } from "next";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";
import { MarketingHome } from "@/features/marketing/marketing-home";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: STUDIO_SITE_CONFIG.TITLE,
  description: STUDIO_SITE_CONFIG.DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

/**
 * Public landing page for DevLab AI Studio.
 */
export default function MarketingHomePage() {
  return <MarketingHome />;
}
