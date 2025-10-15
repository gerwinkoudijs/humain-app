"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChatContainer } from "./chat-container";
import { Prompter } from "./prompter";
import { chat_messages } from "@generated/prisma";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";

export const GeneratePost = (props: {
  onPostSelected: (title: string, post: string) => void;
  onImageResult: (base64Image: string) => void;
}) => {
  const params = useParams();
  const urlSessionId = params.sessionId as string;

  const router = useRouter();

  const {
    isPending: createNewSessionPending,
    mutate: createNewSession,
    data: createNewSessionResult,
  } = api.humain.createNewSession.useMutation();

  const {
    isPending: generatePostPending,
    mutate: generatePost,
    data: generatePostResult,
  } = api.humain.generatePost.useMutation();

  const {
    isPending: editImagePending,
    mutate: editImage,
    data: editImageResult,
  } = api.humain.editImage.useMutation();

  const [chatSessionId, setChatSessionId] = useState<string>(urlSessionId);
  const [initialPrompt, setInitialPrompt] = useState<string>();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [template, setTemplate] = useState<number>();
  const [thinking, setThinking] = useState<boolean>();

  const {
    isLoading: messagesLoading,
    data: messages,
    refetch: refetchMessages,
  } = api.chatSessions.listMessages.useQuery(
    {
      sessionId: chatSessionId!,
    },
    {
      enabled: !!chatSessionId,
      refetchInterval: 10_000,
    }
  );

  const isEditing = !!messages?.chatSession?.post_text;

  const effectiveTemplate = messages?.chatSession?.template ?? template;

  if (messagesLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!effectiveTemplate) {
    return (
      <div className="flex flex-col items-start justify-center gap-2">
        <div className="text-xl font-semibold text-stone-700">
          Kies een sjabloon:
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Image
            src="/images/template1/bg.png"
            width={200}
            height={200}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setTemplate(1)}
          />
          <Image
            src="/images/template2/bg.png"
            width={200}
            height={200}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setTemplate(2)}
          />
          <Image
            src="/images/template3/bg.png"
            width={200}
            height={200}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setTemplate(3)}
          />
          <Image
            src="/images/template4/bg.png"
            width={200}
            height={200}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setTemplate(4)}
          />
          <Image
            src="/images/template5/bg.png"
            width={200}
            height={200}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => setTemplate(5)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center mb-[32px] gap-8">
        <div className="flex flex-col gap-2 w-full max-w-[820px]">
          <div className="flex w-full justify-start">
            <div className=" rounded-xl bg-primary/10 p-2 px-4">
              Geselecteerde sjabloon:
            </div>
          </div>
          <Image
            src={`/images/template${effectiveTemplate}/bg.png`}
            width={75}
            height={75}
            alt=""
            className="rounded-xl hover:scale-105 transition-all cursor-pointer"
          />
        </div>
        {messages?.chatSession && messages?.chatMessages ? (
          <ChatContainer
            session={messages.chatSession}
            messages={messages.chatMessages as chat_messages[]}
            loading={messagesLoading}
            chatSessionId={chatSessionId!}
            thinking={!!thinking}
            onThinkingStart={() => setThinking(true)}
            onThinkingStop={() => setThinking(false)}
            imageUrls={imageUrls}
          />
        ) : initialPrompt ? (
          <div className="flex flex-col gap2 w-full max-w-[820px]">
            <div className="flex w-full justify-start">
              <div className=" rounded-xl bg-stone-100 p-2 px-4">
                {initialPrompt}
              </div>
            </div>
          </div>
        ) : null}
        <Prompter
          isEditing={isEditing}
          onPrompt={async (prompt, uploadUrls) => {
            if (isEditing) {
              setThinking(true);

              setTimeout(() => {
                refetchMessages();
              }, 1_000);

              setTimeout(() => {
                refetchMessages();
              }, 3_000);

              await editImage(
                {
                  chatSessionId: chatSessionId!,
                  prompt,
                  imageUrls: uploadUrls,
                },
                {
                  onSuccess: (data) => {
                    setThinking(false);
                    refetchMessages();
                  },
                  onError: (error) => {
                    setThinking(false);
                    refetchMessages();
                  },
                }
              );

              return;
            }

            setImageUrls(uploadUrls);

            // Add prompt to chat session
            setInitialPrompt(prompt);

            setThinking(true);

            await createNewSession(
              { prompt, template: template ?? 1 },
              {
                onSuccess: async (data) => {
                  setChatSessionId(data.id);

                  window.history.replaceState({}, "", `/sessions/${data.id}`);

                  setTimeout(() => {
                    refetchMessages();
                  }, 1_000);

                  setTimeout(() => {
                    refetchMessages();
                  }, 3_000);

                  await generatePost(
                    {
                      chatSessionId: data.id,
                      prompt,
                    },
                    {
                      onSuccess: (data) => {
                        setThinking(false);
                        refetchMessages();
                      },
                    }
                  );
                },
              }
            );
          }}
        />
      </div>
    </div>
  );
};
