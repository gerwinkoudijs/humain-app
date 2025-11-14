import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  deletetChatSession,
  listChatSessionMessages,
  listChatSessions,
} from "@/server/lib/chat/chat-sessions";

export const chatSessionsRouter = createTRPCRouter({
  listSessions: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => {
      return await listChatSessions(ctx.session.user.id);
    }),

  deleteSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await deletetChatSession(input.sessionId);
    }),

  listMessages: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        fromDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await listChatSessionMessages(
        input.sessionId,
        input.fromDate ?? new Date(0)
      );
    }),
});
