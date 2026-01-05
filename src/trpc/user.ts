import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/lib/db";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        tenantId: true,
        role: true,
      },
    });
    return user;
  }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          ...input,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          tenantId: true,
          role: true,
        },
      });
      return user;
    }),
});
