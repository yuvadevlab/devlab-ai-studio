import type { Metadata } from "next";
import { STUDIO_MARKETING_COPY } from "@/constants/marketing-copy";
import { MarketingCapabilityPage } from "@/features/marketing/marketing-capability-page";

const page = STUDIO_MARKETING_COPY.PAGES.GATEWAY;

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: {
    canonical: page.slug,
  },
};

/**
 * Public AI Gateway capability page for DevLab AI Studio.
 */
export default function AiGatewayPage() {
  return <MarketingCapabilityPage page={page} />;
}
