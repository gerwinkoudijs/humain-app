import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";
import { db } from "../../lib/db";

export const editImage = async (
  chatSessionId: string,
  prompt: string,
  imageUrls: string[],
  isNew: boolean = false
) => {
  if (prompt) {
    await db.chat_messages.create({
      data: {
        chat_session_id: chatSessionId,
        role: "user",
        text: prompt,
        type: "edit_prompt",
      },
    });
  }

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

  // First edit the source image with the new prompt changes
  let updatedBase64ImageData: string | null = null;

  if (prompt) {
    // Convert image paths to base64 strings
    const imageUrlsBase64 = await Promise.all(
      imageUrls.map(async (fileUrl) => {
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
- Gebruik de extra referentie afbeelding indien aanwezig.
- Voeg de volgende BELANGRIJKE bewerkingen toe:
${prompt}
`,
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const parts1 = aiResult1.candidates?.[0].content?.parts;

    if (!parts1?.length) {
      //throw new Error("No image data returned from google ai");
      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          type: "error",
          text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
          data: aiResult1?.text,
        },
      });
      return "";
    }

    for (const part of parts1) {
      if (part.inlineData) {
        const base64ImageData = part.inlineData.data;

        if (!base64ImageData) continue;

        // Store image to vercel blob and return img url
        const blob = await put(
          `yourstyleAiVisualGenerations/${chatSessionId}/${new Date().getTime()}.png`,
          Buffer.from(base64ImageData, "base64"),
          {
            access: "public",
            addRandomSuffix: true,
          }
        );

        // Update source image
        await db.chat_sessions.update({
          where: { id: chatSessionId },
          data: {
            image_base64: base64ImageData,
          },
        });

        updatedBase64ImageData = base64ImageData;
      }
    }

    if (!updatedBase64ImageData) {
      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          type: "error",
          text: "Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.",
          data: aiResult1?.text,
        },
      });
      return "";
    }
  }

  // Now apply the template (background) and CTA text to the edited image

  // const images = [
  //   path.join(process.cwd(), "public", "images/yourstyle_template.png"),
  // ];
  const images = [
    path.join(
      process.cwd(),
      "public",
      `images/template${chatSession.template}/bg.png`
    ),
  ];

  // Convert image paths to base64 strings
  const imagesBase64 = await Promise.all(
    images.map(async (imagePath) => {
      const stream = createReadStream(imagePath);
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return buffer.toString("base64");
    })
  );

  const aiResult = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: updatedBase64ImageData ?? imageRefBase64,
        },
      },
      ...imagesBase64.map((base64Data) => ({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      })),

      {
        text: `
- Plaats de persoon van de eerste afbeelding in de sjabloonafbeelding (tweede afbeelding) aan de rechterkant.
- Gebruik een afbeeldingsgrootte van 1024x1024.
- Gebruik de sjabloonafbeelding om de beeldverhouding en de uitvoerresolutie te bepalen.
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
      const blob = await put(
        `yourstyleAiVisualGenerations/${chatSessionId}/${new Date().getTime()}.png`,
        Buffer.from(base64ImageData, "base64"),
        {
          access: "public",
          addRandomSuffix: true,
        }
      );

      await db.chat_messages.create({
        data: {
          chat_session_id: chatSessionId,
          role: "system",
          text: isNew
            ? "Here's your social post image:"
            : "Here's the updated image:",
          prompt: prompt,
          data: blob.url,
          data_type: "image_url",
          type: "response",
          token_count: aiResult.usageMetadata?.totalTokenCount,
        },
      });

      return blob.url;
    }
  }

  //throw new Error("Afbeelding genereren mislukt. Probeer het nog eens met een andere prompt.");

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
