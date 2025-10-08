import { db } from "../db";

export const listChatSessions = async () => {
  return await db.chat_sessions.findMany({
    orderBy: { created_at: "desc" },
    take: 30,
  });
};

export const listChatSessionMessages = async (
  sessionId: string,
  fromDate: Date
) => {
  const chatSession = await db.chat_sessions.findUnique({
    where: { id: sessionId },
  });

  if (!chatSession) {
    throw new Error("Chat session not found");
  }

  const chatMessages = await db.chat_messages.findMany({
    orderBy: { created_at: "asc" },
    take: 1000,
    where: {
      chat_session_id: sessionId,
      created_at: {
        gte: fromDate,
      },
      type: {
        not: "log",
      },
    },
    select: {
      id: true,
      chat_session_id: true,
      role: true,
      text: true,
      prompt: true,
      data: true,
      data_type: true,
      type: true,
      created_at: true,
      updated_at: true,
    },
  });

  return { chatSession, chatMessages };
};
