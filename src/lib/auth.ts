import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/lib/db";
import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      console.log("Sign in attempt for user:", user.email);
      const dbUser = await db.user.findUnique({
        where: {
          email: user.email,
        },
      });
      if (!dbUser || !dbUser.tenantId) {
        return "/auth/error?error=AccessDenied";
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.tenantId = user.tenantId;

      // Check if this is an impersonation session
      const userSessions = await db.session.findMany({
        where: { userId: user.id },
        orderBy: { expires: 'desc' },
        take: 1,
      });

      if (userSessions.length > 0) {
        session.isImpersonating = userSessions[0].isImpersonating;
      }

      return session;
    },
  },
};

export const { auth } = NextAuth(authOptions);
