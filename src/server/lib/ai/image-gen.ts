import OpenAI, { toFile } from "openai";

import { createUrlReadStream } from "@/lib/file";

export const generateImage = async (
  prompt: string,
  fileUrls: string[],
  quality: "high" | "medium" | "low"
) => {
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_SECRET ?? "" });

  const images = await Promise.all(
    fileUrls.map(
      async (fileUrl) =>
        await toFile(createUrlReadStream(fileUrl), null, {
          type: "image/png",
        })
    )
  );

  let response: OpenAI.Images.ImagesResponse;

  if (images.length === 0) {
    response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      quality,
      size: "1024x1024",
    });
  } else {
    response = await openai.images.edit({
      model: "gpt-image-1",
      image: images,
      prompt,
      quality,
      size: "1024x1024",
    });
  }

  // Save the image to a file
  const image_base64 = response.data ? response.data[0].b64_json : undefined;
  if (!image_base64) {
    throw new Error("No image data returned from OpenAI");
  }

  return image_base64;
};
