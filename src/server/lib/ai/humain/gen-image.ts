import { GoogleGenAI } from "@google/genai";
import { Readable } from "stream";

// import { createUrlReadStream } from "@/lib/file";
// import OpenAI, { toFile } from "openai";
import { db } from "../../db";
import { getHumainDesignerPrompt } from "./designer";
import { processTemplate } from "./process-template";
import { storeImage } from "../../blob";
import { GOOGLE_AI_IMAGE_MODEL } from "../../../config";
import { writeFileSync } from "fs";

export const generateImage = async (
  chatSessionId: string,
  //prompt: string,
  fileUrls: string[],
  cta: string,
  printText: string,
  post: {
    title: string;
    text: string;
    hashTags?: string[];
  },
  retry: boolean = false
) => {
  const chatSession = await db.chat_sessions.findUnique({
    where: { id: chatSessionId },
  });

  if (!chatSession) throw new Error("Chat session not found");

  await db.chat_sessions.update({
    where: { id: chatSessionId },
    data: {
      post_title: post.title,
      post_text: post.text,
      post_hashtags: post.hashTags?.join(" "),
    },
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  const finalPrompt = getHumainDesignerPrompt(
    chatSession,
    post.text,
    cta,
    printText
  );

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: retry
        ? "Ok, ik maak nu een nieuwe afbeelding"
        : "Ok, ik maak nu een passende afbeelding",
      prompt: finalPrompt,
      type: "response",
    },
  });

  // Convert image paths to base64 strings
  const imagesBase64 = await Promise.all(
    fileUrls.map(async (fileUrl) => {
      //const stream = createReadStream(fileUrl);
      const stream = await fetch(fileUrl).then((r) =>
        Readable.fromWeb(r.body as any)
      );

      const chunks: Uint8Array[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return buffer.toString("base64");
    })
  );

  const aiResult = await ai.models.generateContent({
    model: GOOGLE_AI_IMAGE_MODEL,
    contents: [
      ...imagesBase64.map((base64Data) => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      })),
      {
        text: finalPrompt,
      },
    ],
    config: {
      temperature: 0.4,
    },
  });

  // writeFileSync("/tmp/debug-ai-result.json", JSON.stringify(aiResult, null, 2));

  const parts = aiResult.candidates?.[0].content?.parts;

  if (!parts?.length) {
    console.error(aiResult);

    await db.chat_messages.create({
      data: {
        chat_session_id: chatSessionId,
        role: "system",
        type: "error",
        text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
        data: aiResult?.text,
      },
    });
    return "";
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      const base64ImageData = part.inlineData.data;

      if (!base64ImageData) continue;

      await db.chat_sessions.update({
        where: { id: chatSessionId },
        data: {
          image_base64: base64ImageData,
        },
      });

      // const blobIntermediate = await storeImage(chatSessionId, base64ImageData);

      const blobUrl = await processTemplate(chatSessionId);

      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          //text: "Hier is je afbeelding voor de social: " + blobIntermediate.url,
          text: "Hier is je afbeelding voor de social:",
          //prompt: prompt,
          data: blobUrl,
          data_type: "image_url",
          type: "response",
          token_count: aiResult.usageMetadata?.totalTokenCount,
        },
      });

      return blobUrl;
    }
  }

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      type: "error",
      text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
      data: aiResult?.text,
    },
  });
};

// export const generateImageOpenAi = async (
//   chatSessionId: string,
//   prompt: string,
//   fileUrls: string[],
//   cta: string,
//   printText: string,
//   post: {
//     title: string;
//     text: string;
//     hashTags?: string[];
//   }
// ) => {
//   // await db.chat_messages.create({
//   //   data: {
//   //     chat_session_id: chatSessionId,
//   //     role: "user",
//   //     text: "Selected Social Post",
//   //     type: "prompt",
//   //     data: { post },
//   //   },
//   // });

//   await db.chat_sessions.update({
//     where: { id: chatSessionId },
//     data: {
//       post_title: post.title,
//       post_text: post.text,
//       post_hashtags: post.hashTags?.join(" "),
//     },
//   });

//   await db.chat_messages.create({
//     data: {
//       chat_session_id: chatSessionId,
//       role: "system",
//       text: "Ok, I will generate the image now",
//       prompt: prompt,
//       type: "response",
//     },
//   });

//   const finalPrompt = getHumainDesignerPrompt(chatSessionId prompt, cta, printText);

//   const openai = new OpenAI({ apiKey: process.env.OPEN_AI_SECRET ?? "" });

//   let base64ImageResult: string | undefined = undefined;

//   if (fileUrls?.length === 0) {
//     const response = await openai.images.generate({
//       model: "gpt-image-1",
//       prompt: finalPrompt,
//       quality: "high",
//       //size: "2048x2048",
//       size: "1024x1024",
//       moderation: "low",
//     });

//     base64ImageResult = response.data ? response.data[0].b64_json : undefined;
//     if (!base64ImageResult) {
//       await db.chat_messages.create({
//         data: {
//           chat_session_id: chatSessionId,
//           role: "system",
//           type: "error",
//           text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
//         },
//       });
//       return "";
//     }
//   } else {
//     const images = await Promise.all(
//       fileUrls.map(
//         async (fileUrl) =>
//           await toFile(createUrlReadStream(fileUrl), null, {
//             type: "image/png",
//           })
//       )
//     );

//     const response = await openai.images.edit({
//       model: "gpt-image-1",
//       prompt: finalPrompt,
//       image: images,
//       quality: "high",
//       //size: "2048x2048",
//       size: "1024x1024",
//     });

//     base64ImageResult = response.data ? response.data[0].b64_json : undefined;
//     if (!base64ImageResult) {
//       await db.chat_messages.create({
//         data: {
//           chat_session_id: chatSessionId,
//           role: "system",
//           type: "error",
//           text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
//         },
//       });
//       return "";
//     }
//   }

//   await db.chat_sessions.update({
//     where: { id: chatSessionId },
//     data: {
//       image_base64: base64ImageResult,
//     },
//   });

//   return await processTemplate(chatSessionId);
// };
