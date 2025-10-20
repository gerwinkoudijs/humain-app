import { GoogleGenAI } from "@google/genai";
import { Readable } from "stream";
import { db } from "../../db";
import { processTemplate } from "./process-template";

export const editImage = async (
  chatSessionId: string,
  prompt: string,
  imageUrls: string[],
  isNew: boolean = false
) => {
  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "user",
      text: prompt,
      type: "edit_prompt",
    },
  });

  // Get source image from chat session
  const chatSession = await db.chat_sessions.findUnique({
    where: { id: chatSessionId },
  });

  const imageRefBase64 = chatSession?.image_base64;

  if (!imageRefBase64) {
    throw new Error("No source image found for editing");
  }

  // Get the prompt history
  // const editPrompts = await db.chat_messages.findMany({
  //   where: { chat_session_id: chatSessionId, type: "edit_prompt" },
  //   orderBy: { created_at: "asc" },
  //   select: { text: true },
  // });
  // const editPromptHistory = editPrompts.map((p) => p.text).join("\n* ");

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  // Convert image paths to base64 strings
  const imageUrlsBase64 = await Promise.all(
    imageUrls.map(async (fileUrl) => {
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

  const aiResult1 = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageRefBase64,
        },
      },
      ...imageUrlsBase64.map((base64Data) => ({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      })),

      {
        text: `
- Gebruik de eerste afbeelding als basis (BELANGRIJK!)
- Gebruik de extra referentie afbeelding indien aanwezig.
- Voeg de volgende BELANGRIJKE bewerkingen toe:
${prompt}

- LET TOP: BEWERKT DE ACHTERGROND NIET!
`,
      },
    ],
    config: {
      temperature: 0.1,
    },
  });

  const parts1 = aiResult1.candidates?.[0].content?.parts;

  if (!parts1?.length) {
    await db.chat_messages.create({
      data: {
        chat_session_id: chatSessionId,
        role: "system",
        type: "error",
        text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
        data: JSON.stringify(aiResult1?.candidates),
      },
    });
    return "";
  }

  for (const part of parts1) {
    if (part.inlineData) {
      const base64ImageData = part.inlineData.data;

      if (!base64ImageData) continue;

      // Update source image
      await db.chat_sessions.update({
        where: { id: chatSessionId },
        data: {
          image_base64: base64ImageData,
        },
      });

      const blobUrl = await processTemplate(chatSessionId);

      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          text: "Hier is de bijgewerkte afbeelding:",
          prompt: prompt,
          data: blobUrl,
          data_type: "image_url",
          type: "response",
          token_count: aiResult1.usageMetadata?.totalTokenCount,
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
      data: JSON.stringify(aiResult1?.candidates),
    },
  });
};
