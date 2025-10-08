import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  createNewSession,
  editImage,
  generateImage,
  generatePost,
} from "@/server/lib/ai/humain";

export const humainRouter = createTRPCRouter({
  createNewSession: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        template: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createNewSession(input.prompt, input.template);
    }),
  generatePost: publicProcedure
    .input(
      z.object({
        chatSessionId: z.string().min(1),
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await generatePost(input.chatSessionId, input.prompt);
    }),
  generateImage: publicProcedure
    .input(
      z.object({
        chatSessionId: z.string().min(1),
        prompt: z.string().min(1),
        imageUrls: z.array(z.string()),
        cta: z.string().min(1),
        printText: z.string().min(1),
        post: z.object({
          title: z.string(),
          text: z.string(),
          hashTags: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateImage(
        input.chatSessionId,
        input.prompt,
        input.imageUrls,
        input.cta,
        input.printText,
        {
          title: input.post.title,
          text: input.post.text,
          hashTags: input.post.hashTags,
        }
      );

      return {
        base64Image: result,
      };
    }),
  editImage: publicProcedure
    .input(
      z.object({
        chatSessionId: z.string().min(1),
        prompt: z.string(),
        imageUrls: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await editImage(
        input.chatSessionId,
        input.prompt,
        input.imageUrls
      );

      return {
        imageUrl: result,
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
