import { chat_sessions } from "@generated/prisma";

export const getHumainDesignerPrompt = (
  chatSession: chat_sessions,
  prompt: string,
  socialPostText: string,
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
The main instruction of the image is as follows: "${prompt}"

The image should feature a realistic, cut-out studio product shot featuring a single person 
${
  [2, 3, 4].includes(chatSession.template ?? 0)
    ? "positioned on the middle of the frame, positioned from the waist up. The person is looking slightly to the right. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera."
    : "positioned on the right side (placed on 80% from the left) of the frame, positioned from the waist up.  The person is looking slightly to the left. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera."
}

The person is wearing a Yourstyle product. Person is happy and relaxed. The lighting is natural and crisp. Naturally posed.

Background: the first provided image as the background, DO NOT CHANGE THIS IMAGE

Overall Appearance: Flat design aesthetic; no 3D, texture, or shadows. The composition is calm and stylish, focusing on the product, with only the person, product, solid background, and graphic shapes visible. The image is realistic and photographic, not an illustration or AI drawing. Do not use outlines

**importance: very high**
Add an embroided tekst on the product with the following text: "${printText}"

**importance: critical**
Background: the first provided image as the background, DO NOT CHANGE THIS IMAGE
ALWAYS OUTPUT a 1024x1024 resolution image size, ignore the dimensions from the reference images!!
Use the referenced images as the product(s) the person should wear

##matching social media post text
${socialPostText}

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
