import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { yourstyleInfo } from "../../../data/yourstyle_info";
import { db } from "../../lib/db";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});

export const generatePost = async (chatSessionId: string, text: string) => {
  // const summary = await generateObject({
  //   schema: z.object({
  //     summary: z.string(),
  //   }),
  //   //model: google(aiModel),
  //   model: google("gemini-2.5-flash-lite"),
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
      Maak ook een korte omschrijving (socialMediaImagePrompt) van de ideale social media image die bij deze post past. Geef dit in maximaal 50 woorden. 
      De omschrijving moet duidelijk maken dat de afbeelding een realistische, uitgeknipte studio productfoto moet zijn van een persoon die een Yourstyle product draagt,
      met een transparante achtergrond en een vlak ontwerp zonder texturen of schaduwen. De persoon moet gelukkig zijn en ontspannen glimlachen, met natuurlijke,
       frisse uitstraling en heldere, natuurlijke belichting. De persoon kijkt naar de camera en moet iets gedraaid staan en ontspannen staan, niet te geposeerd. 
      De compositie moet rustig en stijlvol zijn, met alleen de persoon, het product en de effen achtergrond zichtbaar. 
      Plaats de persoon aan de rechterkant van het beeld (80% van links) en zorg ervoor dat ze van de taille omhoog zichtbaar is.
      \n\n
      Hier is wat extra informatie over Yourstyle: ${yourstyleInfo} \n\n`;

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: "Ok, I will generate 4 social media posts now",
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
          socialMediaImagePrompt: z.string(),
          ctaText: z.string(),
          printText: z.string(),
        })
      ),
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

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "user",
      text,
      prompt,
      type: "log",
      token_count: result.usage.promptTokens,
    },
  });

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSessionId,
      role: "system",
      text: "Here are 4 social media posts. Choose one to generate a matching image:",
      prompt: "",
      data: { posts: result.object.posts },
      // data            Json?   @default("{}") TODO
      type: "response",
      token_count: result.usage.completionTokens,
    },
  });

  return { posts: result.object.posts, chatSessionId };
};
