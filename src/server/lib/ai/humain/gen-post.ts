import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { yourstyleInfo } from "../../../../data/yourstyle_info";
import { db } from "../../db";
import { GOOGLE_AI_MODEL } from "@/server/config";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});
export const generatePost = async (chatSessionId: string, text: string) => {
  // const summary = await generateObject({
  //   schema: z.object({
  //     summary: z.string(),
  //   }),
  //   //model: google(aiModel),
  //   model: google("gemini-2.5-flash-latest"),
  //   providerOptions: {
  //     google: {
  //       thinkingConfig: {
  //         thinkingBudget: 0,
  //       },
  //     },
  //   },
  //   prompt: `Genereer een korte samenvatting (max 50 tekens) over deze text, de context is een ai social media image generator: ${text}`,
  // });

  const prompt = `Genereer een pakkende social media post voor Yourstyle, een Nederlands bedrijf dat gepersonaliseerde (bedrukt of borduurde tekst) kleding en accessoires aanbiedt.
    De post moet over het volgende gaan: ${text}
    \n\n
      Gebruik maximaal 300 tekens. Bedankt ALTIJD 4 opties met 10 relevante hashtags (aleen in hashTags veld plaatsen!). En een bijbehorende korte titel. De post moet de unieke waardepropositie van Yourstyle benadrukken, namelijk het vermogen om kleding en accessoires te personaliseren met borduurwerk en prints. De toon moet vriendelijk, uitnodigend en creatief zijn.
      \n\n
      Maak ook een hele korte call-to-action (ctaText) die de lezer aanmoedigt om actie te ondernemen, zoals "Shop nu!" of "Personaliseer zelf!".
      \n\n
      Maak ook een korte tekst (printText) die op het kledingstuk geborduurd of gedrukt kan worden. Deze tekst moet kort, krachtig en grappig en relevant zijn voor de post en Yourstyle.
      \n\n
      \n\n
      Hier is wat extra informatie over Yourstyle: ${yourstyleInfo} \n\n`;

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: "Ok, ik bedenk nu 4 social media berichten",
      prompt,
      type: "response",
    },
  });

  const result = await generateObject({
    schema: z.object({
      posts: z.array(
        z.object({
          title: z.string(),
          text: z.string(),
          hashTags: z.array(z.string()),
          //socialMediaImagePrompt: z.string(),
          ctaText: z.string(),
          printText: z.string(),
        })
      ),
    }),
    //model: google(aiModel),
    model: google(GOOGLE_AI_MODEL),
    providerOptions: {
      google: {
        // thinkingConfig: {
        //   thinkingBudget: 0,
        // },
      },
    },
    prompt,
  });

  console.log("Generated posts:", JSON.stringify(result));

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "user",
      text,
      prompt,
      type: "log",
      token_count: result.usage.inputTokens,
    },
  });

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: "Hier zijn 4 social media berichten. Kies er een om een afbeelding te genereren:",
      prompt: "",
      data: { posts: result.object.posts },
      // data            Json?   @default("{}") TODO
      type: "response",
      token_count: result.usage.outputTokens,
    },
  });

  return { posts: result.object.posts, chatSessionId };
};
