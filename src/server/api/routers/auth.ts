import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { generateTemporaryPassword, sendPasswordResetEmail } from "@/server/lib/email";

export const authRouter = createTRPCRouter({
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      // Always return success to prevent email enumeration
      if (!user || !user.tenantId) {
        return { success: true };
      }

      // Generate temporary password
      const temporaryPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

      // Delete any existing reset tokens for this user
      await ctx.db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token (storing the hashed password as token)
      await ctx.db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashedPassword,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Update user's password to the temporary one and flag for password change
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePassword: true,
        },
      });

      // Send email with temporary password
      await sendPasswordResetEmail(input.email, temporaryPassword);

      return { success: true };
    }),

  setPassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // If user has existing password, verify current password
      if (user.password && input.currentPassword) {
        const isValid = await bcrypt.compare(input.currentPassword, user.password);
        if (!isValid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
        }
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      });

      // Clean up any password reset tokens
      await ctx.db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      return { success: true };
    }),

  mustChangePassword: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { mustChangePassword: true },
    });

    return { mustChangePassword: user?.mustChangePassword ?? false };
  }),

  checkHasPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { password: true, tenantId: true },
      });

      // Return false if user doesn't exist or has no tenant (can't login anyway)
      if (!user || !user.tenantId) {
        return { hasPassword: false };
      }

      return { hasPassword: !!user.password };
    }),
});
