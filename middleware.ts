import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 認証が必要なルートを定義
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/member(.*)',
  '/attendance(.*)',
  '/part-time-attendance(.*)',
  '/api/leads(.*)',
  '/api/attachments(.*)',
  '/api/photos(.*)',
  '/api/upload(.*)',
  '/api/send-email(.*)',
  '/api/cron(.*)',
  '/api/reporting(.*)',
  '/api/integrations(.*)',
  '/api/webpush(.*)',
  '/api/favorites(.*)',
  '/api/github(.*)',
  '/api/google(.*)',
  '/api/properties(.*)',
  '/api/send-application-status-email(.*)',
  '/api/test-email(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 保護されたルートの場合、認証を要求
  if (isProtectedRoute(req)) {
    await auth.protect(); // auth()ではなく、authを直接使用
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
