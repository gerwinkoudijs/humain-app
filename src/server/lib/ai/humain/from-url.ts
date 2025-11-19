import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenAI } from "@google/genai";
import { generateObject } from "ai";
import { z } from "zod";
import { storeImage } from "../../blob";
import { db } from "../../db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});
export const generateFromUrl = async (chatSessionId: string, url: string) => {
  const prompt = `Lees de inhoud van deze website: ${url}
    \n\n
      Bepaal de branding, huisstijl en maak een samenvatting en genereer op basis daarvan een prompt om een passende social media afbeelding te genereren\n\n`;

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: "Ok, ik ga nu de website bekijken en op basis daarvan een afbeelding genereren",
      prompt,
      type: "response",
    },
  });

  const result = await generateObject({
    schema: z.object({
      prompt: z.string(),
      branding: z.string(),
      summary: z.string(),
    }),
    //model: google(aiModel),
    model: google("gemini-2.5-flash"),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    },
    prompt,
  });

  if (!result?.object?.prompt) {
    await db.chat_messages.create({
      data: {
        chat_session_id: chatSessionId,
        role: "system",
        type: "error",
        text: "Prompt genereren mislukt. Probeer het nog eens met een andere URL.",
      },
    });
    return "";
  }

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "user",
      text: url,
      prompt,
      type: "log",
      token_count: result.usage.inputTokens,
    },
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  const aiResult = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        text: `Genereer een social media afbeelding voor deze website: ${url}. Lees de website, bepaal de branding en bekijk de afbeelding en huisstijl. Genereer de uiteindelijke afbeelding op basis van deze prompt: ${result.object.prompt}`,
      },
    ],
    config: {
      temperature: 0.4,
    },
  });

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

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",

      text: "Hier is een omschrijving van de website: " + result.object.summary,

      type: "response",
      token_count: aiResult.usageMetadata?.totalTokenCount,
    },
  });

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",

      text:
        "De huisstijl en branding van de website is als volgt: " +
        result.object.branding,

      type: "response",
      token_count: aiResult.usageMetadata?.totalTokenCount,
    },
  });

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

      const blobUrl = await storeImage(chatSessionId, base64ImageData);

      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          //text: "Hier is je afbeelding voor de social: " + blobIntermediate.url,
          text: "Hier is je afbeelding voor de social:",
          //prompt: prompt,
          data: blobUrl.url,
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

  return null;
};
