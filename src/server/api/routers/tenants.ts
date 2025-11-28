// src/server/api/routers/tenants.ts
import { z } from "zod";
import { adminProcedure, router } from "../trpc";

export const tenantsRouter = router({
  getTenants: adminProcedure.query(async ({ ctx }) => {
    const tenants = await ctx.db.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return tenants;
  }),

  getTenant: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: input.id },
        include: {
          users: {
            orderBy: {
              name: "asc",
            },
            include: {
              chatSessions: {
                select: {
                  id: true,
                  created_at: true,
                },
              },
            },
          },
        },
      });

      if (!tenant) return null;

      // Calculate current month's posts
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const postsThisMonth = tenant.users.reduce((total, user) => {
        const userPostsThisMonth = user.chatSessions.filter(
          (session) => new Date(session.created_at) >= firstDayOfMonth
        ).length;
        return total + userPostsThisMonth;
      }, 0);

      return {
        ...tenant,
        postsThisMonth,
      };
    }),

  createTenant: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.create({
        data: {
          name: input.name,
          slug: input.name.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      return tenant;
    }),

  updateTenant: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        monthlyPostLimit: z.number().int().min(0).optional(),
        geminiModelName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, monthlyPostLimit, geminiModelName } = input;
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
      }

      if (monthlyPostLimit !== undefined) {
        updateData.monthlyPostLimit = monthlyPostLimit;
      }

      if (geminiModelName !== undefined) {
        updateData.geminiModelName = geminiModelName;
      }

      const tenant = await ctx.db.tenant.update({
        where: { id },
        data: updateData,
      });
      return tenant;
    }),

  deleteTenant: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tenant.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
