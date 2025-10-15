import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  deletetChatSession,
  listChatSessionMessages,
  listChatSessions,
} from "@/server/lib/chat/chat-sessions";

export const chatSessionsRouter = createTRPCRouter({
  listSessions: publicProcedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => {
      return await listChatSessions();
    }),

  deleteSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await deletetChatSession(input.sessionId);
    }),

  listMessages: publicProcedure
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
