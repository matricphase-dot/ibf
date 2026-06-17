import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuth = !!req.nextauth.token;
    
    // Add CSP Headers
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set("Content-Security-Policy", cspHeader);

    // If user is logged in
    if (isAuth) {
      const role = req.nextauth.token?.role;

      // Accessing auth pages while logged in -> redirect based on role
      if (pathname.startsWith("/auth/")) {
        if (role === "FOUNDER") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        } else {
          return NextResponse.redirect(new URL("/projects", req.url));
        }
      }

      // Students attempting to access founder-only pages -> redirect to projects
      if (role === "STUDENT" && (pathname === "/dashboard" || pathname.startsWith("/projects/new"))) {
        return NextResponse.redirect(new URL("/projects", req.url));
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        
        // Define paths that do not require authentication
        const publicPaths = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/projects",
        ];
        
        const isPublicPath = publicPaths.includes(pathname);
        const isNextAuthPath = pathname.startsWith("/api/auth/");
        const isRegisterApi = pathname === "/api/register";
        const isProjectsApi = pathname === "/api/projects";

        // Let public pages and registration/auth APIs pass without a token
        if (isPublicPath || isNextAuthPath || isRegisterApi || isProjectsApi) {
          return true;
        }

        // Must have token for all protected paths (dashboard, chat, other APIs)
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
