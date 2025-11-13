import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listSettings, updateSetting } from "@/server/lib/settings";
import z from "zod";

export const settingsRouter = createTRPCRouter({
  listSettings: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return await listSettings(input.category);
    }),

  updateSetting: protectedProcedure
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
