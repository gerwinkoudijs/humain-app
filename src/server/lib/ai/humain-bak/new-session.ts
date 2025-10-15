import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "../../db";

export const createNewSession = async (prompt: string, template: number) => {
  // Create new chat session and message
  const chatSession = await db.chat_sessions.create({
    data: {
      title: prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt,
      user: "user",
      template,
    },
  });

  await db.chat_messages.create({
    data: {
      chat_session_id: chatSession.id,
      role: "user",
      text: prompt,
      type: "prompt",
    },
  });

  return chatSession;
};
