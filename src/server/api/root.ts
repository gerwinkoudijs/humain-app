import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { settingsRouter } from "./routers/settings";
import { humainRouter } from "./routers/humain";
import { chatSessionsRouter } from "./routers/chat-sessions";
import { usersRouter } from "./routers/users";
import { userRouter } from "@/trpc/user";
import { tenantsRouter } from "./routers/tenants";
import { dashboardRouter } from "./routers/dashboard";
import { impersonationRouter } from "./routers/impersonation";
import { userDashboardRouter } from "./routers/user-dashboard";
import { authRouter } from "./routers/auth";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  settings: settingsRouter,
  humain: humainRouter,
  chatSessions: chatSessionsRouter,
  users: usersRouter,
  user: userRouter,
  tenants: tenantsRouter,
  dashboard: dashboardRouter,
  impersonation: impersonationRouter,
  userDashboard: userDashboardRouter,
  auth: authRouter,
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
