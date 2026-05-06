import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(req: NextRequest) {
  return await auth0.middleware(req);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except Next.js internals and static assets.
     * auth0.middleware redirects unauthenticated requests to /auth/login
     * and handles the /auth/* callback routes itself.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
