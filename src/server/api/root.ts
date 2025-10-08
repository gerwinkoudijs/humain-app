import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { settingsRouter } from "./routers/settings";
import { humainRouter } from "./routers/humain";
import { chatSessionsRouter } from "./routers/chat-sessions";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  settings: settingsRouter,
  humain: humainRouter,
  chatSessions: chatSessionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
