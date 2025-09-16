// app/upload/route.ts

import { NextResponse as NextServerResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return new NextServerResponse(
      JSON.stringify({ message: "No file uploaded" }),
      { status: 400 }
    );
  }

  try {
    const blob = await put(`yourstyleAiVisualImages/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return new NextServerResponse(
      JSON.stringify({
        message: "Image uploaded successfully",
        fileUrl: blob.url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);

    return new NextServerResponse(
      JSON.stringify({
        message: "Error uploading file",
      }),
      { status: 500 }
    );
  }
}
