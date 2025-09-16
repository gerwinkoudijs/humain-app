import { MessageFeedback, MessageStatus } from "@generated/prisma";
import { db } from "./db";
import { addMessageFeedback } from "./ai/rag";

export const listMessages = async (page: number, size: number) => {
  const count = await db.messages.count({
    where: {
      status: { not: MessageStatus.DELETED },
    },
  });

  return {
    count,
    messages: await db.messages.findMany({
      take: size,
      skip: page * size,
      orderBy: { date: "desc" },
      where: {
        status: { not: MessageStatus.DELETED },
      },
    }),
  };
};

export const listMessagesByConversationId = async (conversationId: string) => {
  return await db.messages.findMany({
    where: {
      conversation_id: conversationId,
      status: { not: MessageStatus.DELETED },
    },
    orderBy: { date: "desc" },
  });
};

export const setFeedback = async (
  messageId: string,
  feedback: MessageFeedback
) => {
  await db.messages.update({
    where: {
      id: messageId,
    },
    data: { feedback },
  });

  await addMessageFeedback(messageId);
};
