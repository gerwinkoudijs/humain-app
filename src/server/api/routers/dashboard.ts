// src/server/api/routers/dashboard.ts
import { adminProcedure, router } from "../trpc";
import { Role } from "@generated/prisma";

export const dashboardRouter = router({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const tenantCount = await ctx.db.tenant.count();
    const userCount = await ctx.db.user.count();
    const chatSessionCount = await ctx.db.chat_sessions.count();

    // Time-based chat session counts
    const chatSessionsLast7Days = await ctx.db.chat_sessions.count({
      where: {
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    const chatSessionsLast30Days = await ctx.db.chat_sessions.count({
      where: {
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Usage by tenant
    const tenants = await ctx.db.tenant.findMany({
      include: {
        users: {
          include: {
            chatSessions: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const usageByTenant = tenants.map((tenant) => {
      const sessionCount = tenant.users.reduce(
        (acc, user) => acc + user.chatSessions.length,
        0
      );
      return {
        name: tenant.name,
        value: sessionCount,
        id: tenant.id,
      };
    });

    return {
      tenantCount,
      userCount,
      chatSessionCount,
      chatSessionsLast7Days,
      chatSessionsLast30Days,
      usageByTenant,
    };
  }),
});
