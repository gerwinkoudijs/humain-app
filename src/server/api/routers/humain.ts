import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { editImage } from "@/server/lib/ai/humain/edit-image";
import { generatePost } from "@/server/lib/ai/humain/gen-post";
import { createNewSession } from "@/server/lib/ai/humain/new-session";
import { generateImage } from "@/server/lib/ai/humain/gen-image";
import { generateFromUrl } from "@/server/lib/ai/humain/from-url";

export const humainRouter = createTRPCRouter({
  createNewSession: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        template: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createNewSession(
        ctx.session?.user?.id || "anonymous",
        input.prompt,
        input.template
      );
    }),
  generatePost: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string().min(1),
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await generatePost(input.chatSessionId, input.prompt);
    }),
  generateImage: protectedProcedure
    .input(
      z.object({
        chatSessionId: z.string().min(1),
        //prompt: z.string().min(1),
        imageUrls: z.array(z.string()),
        cta: z.string().min(1),
        printText: z.string().min(1),
        post: z.object({
          title: z.string(),
          text: z.string(),
          hashTags: z.array(z.string()).optional(),
        }),
        retry: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateImage(
        input.chatSessionId,
        //input.prompt,
        input.imageUrls,
        input.cta,
        input.printText,
        {
          title: input.post.title,
          text: input.post.text,
          hashTags: input.post.hashTags,
        },
        input.retry ?? false
      );

      return {
        base64Image: result,
      };
    }),
  editImage: protectedProcedure
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
  // generateImageStep2: protectedProcedure
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

  generateByUrl: protectedProcedure
    .input(
      z.object({
        url: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sess = await createNewSession(
        ctx.session?.user?.id || "anonymous",
        input.url,
        1
      );

      await generateFromUrl(sess.id, input.url);

      return {
        sessionId: sess.id,
      };
    }),
});
