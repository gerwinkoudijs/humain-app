import { chat_sessions } from "@generated/prisma";

export const getHumainDesignerPrompt = (
  chatSession: chat_sessions,
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

It should genereate a matching social media image for the social media post text prompt provided below (see ##matching social media post text).

The image should look like a realistic, cut-out studio photoshoot featuring a single person 
${
  [2, 3, 4].includes(chatSession.template ?? 0)
    ? "positioned on the middle of the frame, positioned from the waist up. The person is looking slightly to the right. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera."
    : "positioned on the right side (placed on 80% from the left) of the frame, positioned from the waist up.  The person is looking slightly to the left. And standing relaxed, not too posed. Turned slightly to the left, not straight to the camera."
}

The person is wearing a Yourstyle product (from referenced images if available). Person is happy and relaxed. The lighting is natural and crisp. Naturally posed.

Overall Appearance: 
- Flat design aesthetic; no 3D, no texture, and no shadows. 
- The composition is calm and stylish, focusing on the product, with only the person, product.
- The image is realistic and photographic, not an illustration or AI drawing. 
- Do not use outlines

**importance: very high**
Add an embroided tekst on the product with the following text: "${printText}"

**importance: critical**
Background: none (white)
ALWAYS OUTPUT a 1024x1024 resolution image size, ignore the dimensions from the reference images!!
Use any extra referenced images as the product(s) the person should wear

##matching social media post text
${socialPostText}

##final image prompt

 
`;
};
