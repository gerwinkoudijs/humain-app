// src/server/api/routers/users.ts
import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { Role } from "@generated/prisma";

export const usersRouter = router({
  getUsers: adminProcedure
    .input(
      z
        .object({
          tenantId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: input?.tenantId
          ? {
              tenantId: input.tenantId,
            }
          : undefined,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          tenantId: true,
          role: true,
          tenant: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return users;
    }),

  inviteUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.nativeEnum(Role),
        tenantId: z.string().uuid(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new Error("A user with this email already exists.");
      }

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          tenant: {
            connect: {
              id: input.tenantId,
            },
          },
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

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.nativeEnum(Role).optional(),
        tenantId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const user = await ctx.db.user.update({
        where: { id },
        data: updateData,
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

  updateUserRole: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        role: z.nativeEnum(Role),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
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

  deleteUser: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
