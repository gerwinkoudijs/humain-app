// src/server/api/routers/impersonation.ts
import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const impersonationRouter = router({
  startImpersonation: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get the user to impersonate
      const targetUser = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: { tenant: true },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Don't allow impersonating other admins
      if (targetUser.role === "ADMIN" || targetUser.role === "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot impersonate admin users",
        });
      }

      return {
        success: true,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
          tenantId: targetUser.tenantId,
          tenant: targetUser.tenant,
        },
      };
    }),
});
