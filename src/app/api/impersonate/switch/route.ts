import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { sessionToken } = await req.json();

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Session token required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === "production";
  const cookieName = isSecure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  // Set the new session token as an httpOnly cookie
  cookieStore.set(cookieName, sessionToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return NextResponse.json({ success: true });
}
