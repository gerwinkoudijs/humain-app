import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { db } from "../../db";
import path from "path";
import { createReadStream } from "fs";
import { storeImage } from "../../blob";
import { GOOGLE_AI_IMAGE_MODEL } from "../../../config";

export const processTemplate = async (chatSessionId: string) => {
  // Get source image from chat session
  const chatSession = await db.chat_sessions.findUnique({
    where: { id: chatSessionId },
  });

  const imageRefBase64 = chatSession?.image_base64;

  if (!imageRefBase64) {
    throw new Error("No source image found for editing");
  }

  const templateImage = path.join(
    process.cwd(),
    "public",
    `images/template${chatSession.template}/bg.png`
  );

  // Convert image paths to base64 strings
  const imagesBase64Template = await (async () => {
    const stream = createReadStream(templateImage);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return buffer.toString("base64");
  })();

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  // Apply the template (background)
  const aiResult = await ai.models.generateContent({
    model: GOOGLE_AI_IMAGE_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageRefBase64,
        },
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: imagesBase64Template,
        },
      },
      {
        text: `
- Plaats de persoon van de eerste afbeelding in de achtergrond-afbeelding (tweede afbeelding) aan de rechterkant.
- De persoon moet goed zichtbaar zijn en niet uitgeknipt lijken, maar natuurlijk in de achtergrond passen. Maar pas de achtergrond niet aan.
- De persoon mag geen outline of rand hebben, maar moet vloeiend in de achtergrond overlopen. (!)
- Gebruik een afbeeldingsgrootte van 1024x1024.
- Gebruik de achtergrond-afbeelding om de beeldverhouding en de uitvoerresolutie te bepalen.
- ONTHOUD: DE BEELDVERHOUDING MOET VIERKANT ZIJN
`,
      },
    ],
    config: {
      temperature: 0.1,
    },
  });

  const parts = aiResult.candidates?.[0].content?.parts;

  if (!parts?.length) {
    //throw new Error("No image data returned from google ai");
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
    if (part.inlineData) {
      const base64ImageData = part.inlineData.data;

      if (!base64ImageData) continue;

      // Store image to vercel blob and return img url
      const blob = await storeImage(chatSessionId, base64ImageData);

      return blob.url;
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
