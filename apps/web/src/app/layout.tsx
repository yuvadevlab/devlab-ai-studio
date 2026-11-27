import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StudioProviders } from "@/components/studio-providers";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";
import "./globals.css";

// eslint-disable-next-line react-refresh/only-export-components
export const viewport: Viewport = {
  themeColor: STUDIO_SITE_CONFIG.THEME_COLOR,
};

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  metadataBase: new URL(STUDIO_SITE_CONFIG.BASE_URL),
  title: {
    default: STUDIO_SITE_CONFIG.TITLE,
    template: STUDIO_SITE_CONFIG.TITLE_TEMPLATE,
  },
  description: STUDIO_SITE_CONFIG.DESCRIPTION,
  applicationName: STUDIO_SITE_CONFIG.NAME,
  authors: [{ name: STUDIO_SITE_CONFIG.AUTHOR, url: STUDIO_SITE_CONFIG.AUTHOR_URL }],
  creator: STUDIO_SITE_CONFIG.AUTHOR,
  publisher: STUDIO_SITE_CONFIG.AUTHOR,
  keywords: [...STUDIO_SITE_CONFIG.KEYWORDS],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: STUDIO_SITE_CONFIG.BASE_URL,
    siteName: STUDIO_SITE_CONFIG.SITE_NAME,
    title: STUDIO_SITE_CONFIG.OG_TITLE,
    description: STUDIO_SITE_CONFIG.OG_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: STUDIO_SITE_CONFIG.OG_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: STUDIO_SITE_CONFIG.OG_TITLE,
    description: STUDIO_SITE_CONFIG.OG_DESCRIPTION,
    images: ["/opengraph-image"],
    creator: STUDIO_SITE_CONFIG.TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StudioProviders>{children}</StudioProviders>
      </body>
    </html>
  );
}
