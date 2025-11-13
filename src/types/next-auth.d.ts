import { Role } from "@prisma/client";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "@auth/core/adapters"; // Import AdapterUser

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tenantId: string | null;
      isImpersonating?: boolean;
      impersonatedBy?: string;
    } & DefaultSession["user"];
    isImpersonating?: boolean;
  }

  interface User {
    role: Role;
    tenantId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    tenantId: string | null;
  }
}

declare module "@auth/core/adapters" { // Augment AdapterUser
  interface AdapterUser {
    role: Role;
    tenantId: string | null;
  }
}
