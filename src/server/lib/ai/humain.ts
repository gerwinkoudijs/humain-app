import { apiPost } from "@/lib/api";
import { GoogleGenAI, MediaResolution } from "@google/genai";
import { createReadStream } from "fs";
import OpenAI from "openai";
import path from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { yourstyleInfo } from "../../../data/yourstyle_info";
import { Readable } from "stream";
//import { config } from "../../../lib/config";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY ?? "",
});

export const generatePost = async (text: string) => {
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
    model: google("gemini-2.5-flash-preview-05-20"),
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    },
    prompt: `Genereer een pakkende social media post voor Yourstyle, een Nederlands bedrijf dat gepersonaliseerde (bedrukt of borduurde tekst) kleding en accessoires aanbiedt.
    De post moet over het volgende gaan: ${text}
    \n\n
      Gebruik maximaal 300 tekens. Bedankt ALTIJD 4 opties met 10 relevante hashtags (in hashTags veld). En een bijbehorende korte titel. De post moet de unieke waardepropositie van Yourstyle benadrukken, namelijk het vermogen om kleding en accessoires te personaliseren met borduurwerk en prints. De toon moet vriendelijk, uitnodigend en creatief zijn.
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
      Hier is wat extra informatie over Yourstyle: ${yourstyleInfo} \n\n`,
  });

  return { posts: result.object.posts };
};

export const generateImage = async (
  prompt: string,
  fileUrls: string[],
  cta: string,
  printText: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  console.log("Generating image with prompt:", {
    prompt,
    cta,
    print: printText,
  });

  const finalPrompt = getHumainDesignerPrompt(prompt, cta, printText);

  // const images = [
  //   //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
  //   //path.join(process.cwd(), "public", "images/white.png"),
  //   //path.join(process.cwd(), "public", "images/sweater.jpeg"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
  // ];

  // // Convert image paths to base64 strings
  // const imagesBase64Template = await Promise.all(
  //   images.map(async (imagePath) => {
  //     const stream = createReadStream(imagePath);
  //     const chunks: Uint8Array[] = [];
  //     for await (const chunk of stream) {
  //       chunks.push(chunk);
  //     }
  //     const buffer = Buffer.concat(chunks);
  //     return buffer.toString("base64");
  //   })
  // );

  // const images = [
  //   path.join(process.cwd(), "public", "images/yourstyle_bg_2048x2048.png"),
  //   //path.join(process.cwd(), "public", "images/sweater.jpeg"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
  //   //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
  // ];

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
    model: "gemini-2.5-flash-image-preview",
    contents: [
      // ...imagesBase64Template.map((base64Data) => ({
      //   inlineData: {
      //     mimeType: "image/png",
      //     data: base64Data,
      //   },
      // })),
      ...imagesBase64.map((base64Data) => ({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      })),
      // {
      //   inlineData: {
      //     mimeType: "image/jpeg",
      //     data: imageRefBase64.replace("data:image/jpeg;base64,", ""),
      //   },
      // },

      //{ text: prompt },
      {
        text: finalPrompt,
      },
    ],
    config: {
      temperature: 0.4,

      //outputMimeType: "image/png",
      //imageSize: "2048x2048",
      // personGeneration: PersonGeneration.ALLOW_ALL,
    },
  });
  //console.log("AI RESULT", aiResult.candidates);
  const parts = aiResult.candidates?.[0].content?.parts;

  if (!parts?.length) {
    console.error(aiResult);
    throw new Error("No image data returned from google ai");
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      //await generateImageStep2(part.inlineData.data);
      return await editImage(part.inlineData.data, "-", cta);
      //return part.inlineData.data;
    }
  }

  throw new Error("No image data returned from google ai");
};

export const editImage = async (
  imageRefBase64: string,
  prompt: string,
  cta: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

  const images = [
    path.join(process.cwd(), "public", "images/yourstyle_template.png"),
    //path.join(process.cwd(), "public", "images/white.png"),
    //path.join(process.cwd(), "public", "images/sweater.jpeg"),
    //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
    //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
    //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
    //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
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
    model: "gemini-2.5-flash-image-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageRefBase64,
        },
      },
      ...imagesBase64.map((base64Data) => ({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      })),

      {
        // text: `place the person from the first image in the template image (second image) on the right\n\n
        // add the following text (note: this is in Dutch!) in the yellow panel,  use a black font color, size accordingly: "${cta}"
        // use 1024x1024 image size
        // use the template image to determine the aspect ratio and output resolution
        // ASPECT RATIO SHOULD BE SQUARE
        // and add the following IMPORTANT edits: ${prompt}

        // **REMEMBER: ASPECT RATIO SHOULD BE SQUARE**
        // `,
        text: `
- Plaats de persoon van de eerste afbeelding in de sjabloonafbeelding (tweede afbeelding) aan de rechterkant.
- Voeg de volgende tekst toe in het gele vlak, gebruik een zwarte letterkleur, font 'Montserrat', pas de grootte dienovereenkomstig aan, let op de spelling! De tekst: "Shop nu!"
- Gebruik een afbeeldingsgrootte van 1024x1024.
- Gebruik de sjabloonafbeelding om de beeldverhouding en de uitvoerresolutie te bepalen.
- DE BEELDVERHOUDING MOET VIERKANT ZIJN.
- En voeg de volgende BELANGRIJKE bewerkingen toe:
${prompt}
- ONTHOUD: DE BEELDVERHOUDING MOET VIERKANT ZIJN
`,
      },
    ],
    config: {
      temperature: 0.1,
      //outputMimeType: "image/png",
      //imageSize: "2048x2048",
      // personGeneration: PersonGeneration.ALLOW_ALL,
    },
  });
  //console.log("AI RESULT", aiResult.candidates);
  const parts = aiResult.candidates?.[0].content?.parts;

  if (!parts?.length) {
    throw new Error("No image data returned from google ai");
  }

  for (const part of parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image data returned from google ai");
};

const getHumainDesignerPrompt = (
  prompt: string,
  cta: string,
  printText: string
) => {
  return `

##system role
I will act as Yourstyle's in-house creative AI, generating visually consistent images for social media posts that perfectly match the Yourstyle brand's style.
Yourstyle is the expert in personalising (by embroiding and prints) all kinds of textile products 

##prompt guidelines

**importance: normal**

It should genereate a matching social media image for the social media post text prompt I provide below.

The image should feature a realistic, cut-out studio product shot featuring a single person positioned on the right side (placed on 80% from the left) of the frame, positioned from the waist up. The person is wearing a Yourstyle product. Person is happy. The lighting is natural and crisp.
The person is looking slightly to the left. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera.

Background: transparent

Overall Appearance: Flat design aesthetic; no 3D, texture, or shadows. The composition is calm and stylish, focusing on the product, with only the person, product, solid background, and graphic shapes visible. The image is realistic and photographic, not an illustration or AI drawing. Do not use outlines

**importance: very high**
Add an embroided tekst on the product with the following text: "${printText}"

**importance: critical**
Background: use transparent
ALWAYS OUTPUT a 1024x1024 resolution image size, ignore the dimensions from the reference images!!
Use the referenced images as the product(s) the person should wear

##matching social media post text prompt
${prompt}

##final image prompt

 
`;
};

// const getHumainDesignerPrompt = (prompt: string) => {
//   return `

// ##system role
// I will act as Yourstyle's in-house creative AI, generating visually consistent images for social media posts that perfectly match the Yourstyle brand's style.
// Yourstyle is the expert in personalising (by embroiding and prints) all kinds of textile products

// ##prompt guidelines

// **importance: normal**

// It should genereate a matching social media image for the social media post text prompt I provide below.

// The image should feature a realistic, cut-out studio product shot featuring a single person positioned on the right side (placed on 80% from the left) of the frame, positioned from the waist up. The person is wearing a Yourstyle product. Person is happy. The lighting is natural and crisp.
// The person is looking slightly to the left. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera.

// Background: use solid hex color: #014c3d

// Overall Appearance: Flat design aesthetic; no 3D, texture, or shadows. The composition is calm and stylish, focusing on the product, with only the person, product, solid background, and graphic shapes visible. The image is realistic and photographic, not an illustration or AI drawing. Do not use outlines

// **importance: very high**
// Add an embroided tekst on the product with a funny tagline as defined in the prompt below

// **importance: critical**
// Background: use solid hex color: #014c3d
// ALWAYS OUTPUT a 1024x1024 resolution image size, ignore the dimensions from the reference images!!
// Use the referenced images as the product(s) the person should wear

// ##matching social media post text prompt
// ${prompt}

// ##final image prompt
// Realistische portretfoto van een Europese persoon. Persoon staat rechts in beeld, een beetje schuin gedraaid naar rechts, iets naar voren.
// Persoon kijkt iets naar links, glimlacht ontspannen en heeft een natuurlijke, frisse uitstraling. De achtergrond is een effen kleur #014c3d. De foto heeft een heldere, natuurlijke belichting en een vlak ontwerp zonder texturen of schaduwen, waardoor de focus op de hoodie en de geborduurde tekst ligt. De compositie is rustig en stijlvol, met alleen de vrouw, de hoodie en de effen achtergrond zichtbaar.

// `;
// };

// export const generateImageOpenAi = async (
//   prompt: string,
//   fileUrls: string[]
// ) => {
//   console.log("Generating image with prompt:", prompt);

//   //const finalPrompt = `${humainDesignerPrompt} ${prompt} ## Extra notes after previous results: - change text to "Scumbag" - use a dark male model`;
//   const finalPrompt = getHumainDesignerPrompt(prompt);
//   const openai = new OpenAI({ apiKey: process.env.OPEN_AI_SECRET ?? "" });

//   const response = await openai.images.generate({
//     model: "gpt-image-1",
//     prompt: finalPrompt,
//     quality: "high",
//     //size: "2048x2048",
//     size: "1024x1024",
//     moderation: "low",
//   });

//   // const response = await openai.images.edit({
//   //   model: "gpt-image-1",
//   //   prompt: finalPrompt,
//   //   image: images,
//   //   quality: "high",
//   //   size: "2048x2048",
//   // });

//   const image_base64 = response.data ? response.data[0].b64_json : undefined;
//   if (!image_base64) {
//     throw new Error("No image data returned from OpenAI");
//   }

//   return image_base64;
// };

// export const generateImageStep2See = async (imageRefBase64: string) => {
//   const images = [
//     path.join(process.cwd(), "public", "images/yourstyle_bg_2048x2048.png"),
//     //path.join(process.cwd(), "public", "images/sweater.jpeg"),
//     //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
//   ];

//   // Convert image paths to base64 strings
//   const imagesBase64 = await Promise.all(
//     images.map(async (imagePath) => {
//       const stream = createReadStream(imagePath);
//       const chunks: Uint8Array[] = [];
//       for await (const chunk of stream) {
//         chunks.push(chunk);
//       }
//       const buffer = Buffer.concat(chunks);
//       return buffer.toString("base64");
//     })
//   );

//   const response = await apiPost<any>(
//     "https://api.wavespeed.ai/api/v3/bytedance/seedream-v4/edit",
//     {
//       prompt:
//         "replace the background of the first image with the second image (do not alter the second image!), vectorize the background and add a CTA left bottom in a yellow rounded panel saying 'Shop Now!'; improve the photo quality of the final image result",
//       size: "2048*2048",
//       enable_base64_output: true,
//       enable_sync_mode: true,
//       images: [imageRefBase64, ...imagesBase64],
//     },
//     { Authorization: `Bearer ${process.env.API_KEY_WAVESPEED}` }
//   );

//   const image_base64 = response?.data?.outputs
//     ? response.data.outputs[0]
//     : undefined;
//   if (!image_base64) {
//     throw new Error("No image data returned");
//   }

//   return image_base64;
// };

// export const generateImageStep2 = async (imageRefBase64: string) => {
//   const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

//   const images = [
//     path.join(process.cwd(), "public", "images/yourstyle_template.png"),
//     //path.join(process.cwd(), "public", "images/sweater.jpeg"),
//     //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
//   ];

//   // Convert image paths to base64 strings
//   const imagesBase64 = await Promise.all(
//     images.map(async (imagePath) => {
//       const stream = createReadStream(imagePath);
//       const chunks: Uint8Array[] = [];
//       for await (const chunk of stream) {
//         chunks.push(chunk);
//       }
//       const buffer = Buffer.concat(chunks);
//       return buffer.toString("base64");
//     })
//   );

//   const aiResult = await ai.models.generateContent({
//     model: "gemini-2.5-flash-image-preview",
//     contents: [
//       ...imagesBase64.map((base64Data) => ({
//         inlineData: {
//           mimeType: "image/png",
//           data: base64Data,
//         },
//       })),
//       {
//         inlineData: {
//           mimeType: "image/jpeg",
//           data: imageRefBase64.replace("data:image/jpeg;base64,", ""),
//         },
//       },

//       //{ text: prompt },
//       {
//         text: `place the person from the second image in the template image (first image) on the right and add a text in the yellow panel: "Shop now! Get 20% Off" use a black font color`,
//         //text: 'vervang de tekst op de tas volledig door "Yourstyle maakt je dag leuker!" ',
//       },
//     ],
//     config: {
//       temperature: 0.4,
//       //outputMimeType: "image/png",
//       //imageSize: "2048x2048",
//       // personGeneration: PersonGeneration.ALLOW_ALL,
//     },
//   });
//   //console.log("AI RESULT", aiResult.candidates);
//   const parts = aiResult.candidates?.[0].content?.parts;

//   if (!parts?.length) {
//     throw new Error("No image data returned from google ai");
//   }

//   for (const part of parts) {
//     if (part.inlineData) {
//       return part.inlineData.data;
//     }
//   }

//   throw new Error("No image data returned from google ai");
// };

// export const generateImageXX = async (prompt: string, fileUrls: string[]) => {
//   console.log("Generating image with prompt:", prompt);

//   const finalPrompt = getHumainDesignerPrompt(prompt);

//   const response = await apiPost<any>(
//     "https://api.wavespeed.ai/api/v3/bytedance/seedream-v4",
//     {
//       prompt: finalPrompt,
//       size: "2048*2048",
//       enable_base64_output: true,
//       enable_sync_mode: true,
//     },
//     { Authorization: `Bearer ${process.env.API_KEY_WAVESPEED}` }
//   );

//   const image_base64 = response?.data?.outputs
//     ? response.data.outputs[0]
//     : undefined;
//   if (!image_base64) {
//     throw new Error("No image data returned");
//   }

//   return image_base64;
// };

// export const generateImageXXX = async (prompt: string) => {
//   const finalPrompt = getHumainDesignerPrompt(prompt);

//   const images = [
//     path.join(process.cwd(), "public", "images/yourstyle_bg_2048x2048.png"),
//     //path.join(process.cwd(), "public", "images/sweater.jpeg"),
//     //path.join(process.cwd(), "public", "images/yourstyle_font.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_logo.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_template.png"),
//     //path.join(process.cwd(), "public", "images/yourstyle_ref.png"),
//   ];

//   // Convert image paths to base64 strings
//   const imagesBase64 = await Promise.all(
//     images.map(async (imagePath) => {
//       const stream = createReadStream(imagePath);
//       const chunks: Uint8Array[] = [];
//       for await (const chunk of stream) {
//         chunks.push(chunk);
//       }
//       const buffer = Buffer.concat(chunks);
//       return buffer.toString("base64");
//     })
//   );

//   const response = await apiPost<any>(
//     "https://api.wavespeed.ai/api/v3/bytedance/seedream-v4/edit",
//     {
//       prompt: finalPrompt,
//       size: "2048*2048",
//       enable_base64_output: true,
//       enable_sync_mode: true,
//       images: [...imagesBase64],
//     },
//     { Authorization: `Bearer ${process.env.API_KEY_WAVESPEED}` }
//   );

//   const image_base64 = response?.data?.outputs
//     ? response.data.outputs[0]
//     : undefined;
//   if (!image_base64) {
//     throw new Error("No image data returned");
//   }

//   return image_base64;
// };
