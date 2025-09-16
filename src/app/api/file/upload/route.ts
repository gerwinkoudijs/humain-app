// app/upload/route.ts

import { NextResponse as NextServerResponse } from "next/server";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
//import { indexDocument } from "@/server/lib/ai/rag";
import { db } from "@/server/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY ?? "" });

export async function POST(req: Request) {
  return new NextServerResponse(
    JSON.stringify({
      message: "DISABLED",
    }),
    { status: 500 }
  );

  // const formData = await req.formData();
  // const file = formData.get("file") as File;

  // if (!file) {
  //   return new NextServerResponse(
  //     JSON.stringify({ message: "No file uploaded" }),
  //     { status: 400 }
  //   );
  // }

  // // Create db document entry
  // const doc = await db.documents.create({
  //   data: {
  //     name: file.name,
  //     status: "uploading to ai processor",
  //   },
  // });

  // try {
  //   // Read the file buffer directly instead of using FileReader
  //   const arrayBuffer = await file.arrayBuffer();

  //   const fileBlob = new Blob([arrayBuffer], { type: file.type });

  //   console.log("Uploading file:", file.name, "of type:", file.type);

  //   const aiFile = await ai.files.upload({
  //     file: fileBlob,
  //     config: {
  //       displayName: file.name,
  //     },
  //   });

  //   console.log("File uploaded successfully:", aiFile.name);

  //   await db.documents.update({
  //     data: {
  //       status: "waiting for ai processor to be ready processing the file",
  //     },
  //     where: {
  //       id: doc.id,
  //     },
  //   });

  //   // Wait for the file to be processed.
  //   let getFile = await ai.files.get({ name: aiFile.name! });
  //   while (getFile.state === "PROCESSING") {
  //     getFile = await ai.files.get({ name: aiFile.name! });
  //     console.log(`current file status: ${getFile.state}`);
  //     console.log("File is still processing, retrying in 5 seconds");

  //     await new Promise((resolve) => {
  //       setTimeout(resolve, 5000);
  //     });
  //   }
  //   if (aiFile.state === "FAILED") {
  //     throw new Error("File processing failed.");
  //   }

  //   console.log("File processing completed:", aiFile.state);

  //   // Add the file to the contents.
  //   const content: any[] = ["convert this document to markdown"];

  //   await db.documents.update({
  //     data: {
  //       status: "parsing text from file",
  //     },
  //     where: {
  //       id: doc.id,
  //     },
  //   });

  //   if (aiFile.uri && aiFile.mimeType) {
  //     const fileContent = createPartFromUri(aiFile.uri, aiFile.mimeType);
  //     content.push(fileContent);
  //   }

  //   console.log("Generating content with AI model...");

  //   const response = await ai.models.generateContent({
  //     //model: "gemini-2.5-pro-preview-06-05",
  //     model: "gemini-2.5-flash-preview-05-20",
  //     contents: content,
  //     config: {
  //       thinkingConfig: {
  //         includeThoughts: false,
  //         thinkingBudget: 200,
  //       },
  //     },
  //   });

  //   console.log("READY response from AI model", response.text);

  //   if (!response.text) {
  //     throw new Error("AI response is empty.");
  //   }

  //   console.log("indexing document:", file.name);

  //   await indexDocument(doc.id, file.name, response.text);

  //   return new NextServerResponse(
  //     JSON.stringify({
  //       message: "File uploaded successfully",
  //       fileUrl: `/uploads/${file.name}`,
  //     }),
  //     { status: 200 }
  //   );
  // } catch (error) {
  //   console.error("Error saving file:", error);

  //   await db.documents.update({
  //     data: {
  //       status: "error processing file: " + (error as Error).message,
  //     },
  //     where: {
  //       id: doc.id,
  //     },
  //   });

  //   return new NextServerResponse(
  //     JSON.stringify({
  //       message: "Error uploading file",
  //     }),
  //     { status: 500 }
  //   );
  // }
}
