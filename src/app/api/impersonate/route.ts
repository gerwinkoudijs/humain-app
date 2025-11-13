import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/server/lib/db";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Get target user
  const targetUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Don't allow impersonating other admins
  if (targetUser.role === "ADMIN" || targetUser.role === "OWNER") {
    return NextResponse.json(
      { error: "Cannot impersonate admin users" },
      { status: 403 }
    );
  }

  // Get current session token
  const cookieStore = await cookies();
  const currentSessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  if (!currentSessionToken) {
    return NextResponse.json(
      { error: "No active session found" },
      { status: 400 }
    );
  }

  // Create a new session for the target user
  const newSessionToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  await db.session.create({
    data: {
      sessionToken: newSessionToken,
      userId: targetUser.id,
      expires: expiresAt,
      isImpersonating: true,
      originalAdminSessionToken: currentSessionToken,
    },
  });

  // Return the new session token to be set on the client
  return NextResponse.json({
    success: true,
    sessionToken: newSessionToken,
    targetUserId: targetUser.id,
    targetUserName: targetUser.name,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get current session token
  const cookieStore = await cookies();
  const currentSessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  if (!currentSessionToken) {
    return NextResponse.json(
      { error: "No active session found" },
      { status: 400 }
    );
  }

  // Find the current impersonation session
  const currentSession = await db.session.findUnique({
    where: { sessionToken: currentSessionToken },
  });

  if (!currentSession?.isImpersonating || !currentSession.originalAdminSessionToken) {
    return NextResponse.json(
      { error: "Not currently impersonating" },
      { status: 400 }
    );
  }

  // Get the original admin session token
  const originalSessionToken = currentSession.originalAdminSessionToken;

  // Delete the impersonation session
  await db.session.delete({
    where: { sessionToken: currentSessionToken },
  });

  // Return the original session token to restore
  return NextResponse.json({
    success: true,
    sessionToken: originalSessionToken,
  });
}
