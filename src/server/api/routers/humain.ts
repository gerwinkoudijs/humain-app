import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  editImage,
  generateImage,
  //generateImageStep2,
  generatePost,
} from "@/server/lib/ai/humain";

export const humainRouter = createTRPCRouter({
  generatePost: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await generatePost(input.prompt);
    }),
  generateImage: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        imageUrls: z.array(z.string()),
        cta: z.string().min(1),
        printText: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateImage(
        input.prompt,
        input.imageUrls,
        input.cta,
        input.printText
      );

      return {
        base64Image: result,
      };
    }),
  editImage: publicProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        prompt: z.string(),
        cta: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await editImage(
        input.imageBase64,
        input.prompt,
        input.cta
      );

      return {
        base64Image: result,
      };
    }),
  // generateImageStep2: publicProcedure
  //   .input(
  //     z.object({
  //       imageBase64: z.string(),
  //       prompt: z.string(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const result = await generateImageStep2(input.imageBase64, input.prompt);

  //     return {
  //       base64Image: result,
  //     };
  //   }),
});
