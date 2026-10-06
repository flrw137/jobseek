import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import type { CookieOptions, CookieStore } from "@insforge/sdk/ssr/middleware";
import { updateSession } from "@insforge/sdk/ssr/middleware";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs", "/jobs"];

function createCookieStoreAdapter(
  cookies: RequestCookies | ResponseCookies,
): CookieStore {
  function setCookie(
    name: string,
    value: string,
    options?: CookieOptions,
  ): unknown;
  function setCookie(
    options: { name: string; value: string } & CookieOptions,
  ): unknown;
  function setCookie(
    nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
    options?: CookieOptions,
  ): unknown {
    if (typeof nameOrOptions === "string") {
      cookies.set({ name: nameOrOptions, value: value ?? "", ...options });
      return;
    }

    cookies.set(nameOrOptions);
    return undefined;
  }

  function deleteCookie(name: string): unknown;
  function deleteCookie(options: { name: string } & CookieOptions): unknown;
  function deleteCookie(
    nameOrOptions: string | ({ name: string } & CookieOptions),
  ): unknown {
    cookies.delete(
      typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name,
    );
    return undefined;
  }

  return {
    get: (name: string) => cookies.get(name),
    set: setCookie,
    delete: deleteCookie,
  };
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const isProtectedPage = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthedApiRoute =
    pathname.startsWith("/api/agent") || pathname.startsWith("/api/resume");

  if (!isProtectedPage && !isAuthedApiRoute) {
    return NextResponse.next();
  }

  const placeholder = NextResponse.next();

  const { accessToken } = await updateSession({
    requestCookies: createCookieStoreAdapter(request.cookies),
    responseCookies: createCookieStoreAdapter(placeholder.cookies),
  });

  if (!accessToken) {
    if (isAuthedApiRoute) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Next.js does not propagate middleware cookie mutations to the route handler,
  // so pass the (possibly refreshed) access token as a request header. Server
  // code reads it via createInsforgeServer() so the request that triggered a
  // refresh still runs authenticated.
  request.headers.set("x-insforge-access-token", accessToken);

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Carry the refreshed auth cookies from the placeholder to the real response.
  for (const cookie of placeholder.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (unauthenticated: callback/refresh/signout)
     * - / (homepage - public)
     * - /login (public)
     *
     * Authed API routes (/api/agent, /api/resume) run through the proxy so
     * updateSession refreshes an expired access token before the route handler
     * reads it. They receive a 401 JSON response instead of a /login redirect.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|$|login).*)",
  ],
};
