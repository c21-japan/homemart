import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const status = {
    ok: true,
    clerkDisabled: process.env.DISABLE_CLERK === "1",
    hasClerkKeys: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY,
  };
  return NextResponse.json(status, { status: 200 });
}
