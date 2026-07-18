import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Browser: recheck after 2 min, CDN: cache 1 hour, stale 24h
  response.headers.set(
    "Cache-Control",
    "public, max-age=120, s-maxage=3600, stale-while-revalidate=86400"
  );
  
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|favicon).*)"],
};
