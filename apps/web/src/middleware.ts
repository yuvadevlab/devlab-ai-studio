/**
 * @file apps/web/src/middleware.ts
 * @description Edge middleware enforcing DevLab Portal SSO session checks and token handoff.
 * @module @devlab-ai-studio/web/middleware
 */

import { NextResponse, type NextRequest } from "next/server";
import { AuthQueryParamKey, AuthStorageKey } from "@/constants/auth.constants";
import { buildPortalLoginUrl } from "@/constants/routes.constants";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";
import { isJwtExpired } from "@/lib/jwt";

const PUBLIC_ASSET_PATHS = new Set([
  "/apple-icon",
  "/opengraph-image",
  "/icon.svg",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

const PUBLIC_MARKETING_ROUTES = new Set<string>(STUDIO_SITE_CONFIG.PUBLIC_ROUTES);

/**
 * Enforces DevLab Portal SSO authentication across Studio routes and exchanges
 * incoming Portal SSO token query parameters into session cookies.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ASSET_PATHS.has(pathname) || pathname.startsWith("/apple-icon")) {
    return NextResponse.next();
  }

  const tokenParam =
    request.nextUrl.searchParams.get(AuthQueryParamKey.TOKEN) ||
    request.nextUrl.searchParams.get(AuthQueryParamKey.ACCESS_TOKEN);

  if (tokenParam && tokenParam.trim().length > 0) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete(AuthQueryParamKey.TOKEN);
    cleanUrl.searchParams.delete(AuthQueryParamKey.ACCESS_TOKEN);

    if (isJwtExpired(tokenParam)) {
      return NextResponse.redirect(
        buildPortalLoginUrl({
          redirectUrl: cleanUrl.toString(),
          error: "session_expired",
          prompt: "login",
        }),
      );
    }

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(AuthStorageKey.TOKEN, tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    response.cookies.set(AuthStorageKey.ACCESS_TOKEN_LEGACY, tokenParam, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
    return response;
  }

  const cookieToken =
    request.cookies.get(AuthStorageKey.TOKEN)?.value ||
    request.cookies.get(AuthStorageKey.ACCESS_TOKEN_LEGACY)?.value;

  const isAuthenticated = Boolean(cookieToken && !isJwtExpired(cookieToken));
  if (PUBLIC_MARKETING_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const response = NextResponse.redirect(
      buildPortalLoginUrl({
        redirectUrl: request.url,
        error: cookieToken ? "session_expired" : undefined,
        prompt: cookieToken ? "login" : undefined,
      }),
    );
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    if (cookieToken) {
      response.cookies.delete(AuthStorageKey.TOKEN);
      response.cookies.delete(AuthStorageKey.ACCESS_TOKEN_LEGACY);
    }
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|apple-icon|icon\\.svg|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};
