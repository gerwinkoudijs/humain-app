import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userDashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get all chat sessions for the user
    const chatSessions = await ctx.db.chat_sessions.findMany({
      where: { userId },
      include: {
        chat_messages: {
          select: {
            id: true,
            token_count: true,
            created_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Calculate time-based statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sessionsLast7Days = chatSessions.filter(
      (session) => new Date(session.created_at) >= sevenDaysAgo
    ).length;

    const sessionsLast30Days = chatSessions.filter(
      (session) => new Date(session.created_at) >= thirtyDaysAgo
    ).length;

    const sessionsThisMonth = chatSessions.filter(
      (session) => new Date(session.created_at) >= firstDayOfMonth
    ).length;

    // Calculate total messages and tokens
    const totalMessages = chatSessions.reduce(
      (acc, session) => acc + session.chat_messages.length,
      0
    );

    const totalTokens = chatSessions.reduce((acc, session) => {
      return (
        acc +
        session.chat_messages.reduce(
          (msgAcc, msg) => msgAcc + (msg.token_count || 0),
          0
        )
      );
    }, 0);

    // Calculate sessions by day for the last 30 days (for chart)
    const sessionsByDay = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = chatSessions.filter((session) => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= date && sessionDate < nextDate;
      }).length;

      sessionsByDay.push({
        date: date.toLocaleDateString("nl-NL", { month: "short", day: "numeric" }),
        count,
      });
    }

    // Get tenant info for monthly limit
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            monthlyPostLimit: true,
          },
        },
      },
    });

    const monthlyLimit = user?.tenant?.monthlyPostLimit || 100;
    const usagePercentage = (sessionsThisMonth / monthlyLimit) * 100;

    // Get recent sessions
    const recentSessions = chatSessions.slice(0, 10).map((session) => ({
      id: session.id,
      title: session.title || "Geen titel",
      created_at: session.created_at,
      messageCount: session.chat_messages.length,
    }));

    return {
      totalSessions: chatSessions.length,
      sessionsLast7Days,
      sessionsLast30Days,
      sessionsThisMonth,
      monthlyLimit,
      usagePercentage,
      totalMessages,
      totalTokens,
      sessionsByDay,
      recentSessions,
    };
  }),
});
