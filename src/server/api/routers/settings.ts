import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { listSettings, updateSetting } from "@/server/lib/settings";
import z from "zod";

export const settingsRouter = createTRPCRouter({
  listSettings: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return await listSettings(input.category);
    }),

  updateSetting: publicProcedure
    .input(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateSetting(input.name, input.value);
    }),
});
