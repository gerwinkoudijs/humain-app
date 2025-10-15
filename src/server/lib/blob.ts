import { put } from "@vercel/blob";

export const storeImage = async (
  chatSessionId: string,
  base64ImageData: string
) => {
  const blob = await put(
    `yourstyleAiVisualGenerations/${chatSessionId}/${new Date().getTime()}.png`,
    Buffer.from(base64ImageData, "base64"),
    {
      access: "public",
      addRandomSuffix: true,
    }
  );

  return blob;
};
