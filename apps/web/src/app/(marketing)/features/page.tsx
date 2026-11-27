import type { Metadata } from "next";
import { STUDIO_MARKETING_COPY } from "@/constants/marketing-copy";
import { MarketingCapabilityPage } from "@/features/marketing/marketing-capability-page";

const page = STUDIO_MARKETING_COPY.PAGES.FEATURES;

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: page.slug,
  },
};

/**
 * Public features overview page for DevLab AI Studio.
 */
export default function FeaturesPage() {
  return <MarketingCapabilityPage page={page} />;
}
