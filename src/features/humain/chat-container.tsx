import { ReactNode, useState } from "react";
import { chat_messages, chat_sessions } from "@generated/prisma";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Dots } from "@/components/ui/dots";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw } from "lucide-react";

export const ChatContainer = (props: {
  session: chat_sessions;
  chatSessionId: string;
  messages: chat_messages[];
  loading: boolean;
  thinking: boolean;
  onThinkingStart: () => void;
  onThinkingStop: () => void;
  imageUrls: string[];
}) => {
  const {
    isPending: generateVisualPending,
    mutate: generateVisual,
    data: generateVisualResult,
  } = api.humain.generateImage.useMutation();

  const onRetry = async () => {
    props.onThinkingStart();

    // Find the selected post
    const msg = props.messages.find(
      (msg) =>
        msg.role === "system" &&
        msg.data &&
        (msg.data as any).posts &&
        (msg.data as any).posts.length > 0
    );

    if (!msg) {
      props.onThinkingStop();
      return;
    }

    const post = (msg.data as any).posts.find(
      (p: any) => p.title === props.session.post_title
    );

    await generateVisual(
      {
        chatSessionId: props.chatSessionId!,
        prompt: post.socialMediaImagePrompt,
        imageUrls: props.imageUrls,
        cta: post.ctaText,
        printText: post.printText,
        post: {
          title: post.title,
          text: post.text,
          hashTags: post.hashTags ?? [],
        },
        retry: true,
      },
      {
        onSuccess: (data) => {
          props.onThinkingStop();
          // props.onImageResult(data.base64Image ?? "");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[820px]">
      {props.loading && (
        <div className="w-full flex justify-start p-2">
          <Loader />
        </div>
      )}

      {(props.messages ?? []).map((msg, index) =>
        msg.role === "user" ? (
          <UserMessage
            key={msg.id}
            message={msg}
            chatSessionId={props.chatSessionId}
            session={props.session}
            onThinkingStart={props.onThinkingStart}
            onThinkingStop={props.onThinkingStop}
          >
            {msg.text}
          </UserMessage>
        ) : (
          <SystemMessage
            key={msg.id}
            message={msg}
            chatSessionId={props.chatSessionId}
            session={props.session}
            onThinkingStart={props.onThinkingStart}
            onThinkingStop={props.onThinkingStop}
            imageUrls={props.imageUrls}
            onRetry={onRetry}
          >
            {msg.text}
          </SystemMessage>
        )
      )}
      <AnimatePresence initial={true}>
        {props.thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-end"
          >
            <Dots />
          </motion.div>
        )}
      </AnimatePresence>
      {/* <UserMessage>Hey!</UserMessage>
      <SystemMessage>Yo, how are you?</SystemMessage>
      <UserMessage>Yeah good!</UserMessage>
      <SystemMessage>Great!</SystemMessage> */}
    </div>
  );
};

const UserMessage = (props: {
  chatSessionId: string;
  children: ReactNode;
  message: chat_messages;
  session: chat_sessions;
  onThinkingStart: () => void;
  onThinkingStop: () => void;
}) => {
  const json = props.message.data as any;

  return (
    <>
      <div className="flex w-full justify-start">
        <div className=" rounded-xl bg-primary/10 p-2 px-4">
          {props.children}
        </div>
      </div>
      {!!json?.post?.text && (
        <div className="grid grid-cols-2">
          <div className="rounded-xl bg-primary/20 p-2 px-4 mt-2">
            <div className="font-bold mb-1">{json.post.title}</div>
            <div className="mb-1">{json.post.text}</div>
            {json.post.hashTags && (
              <div className="mt-2 text-sm text-gray-500">
                {json.post.hashTags.join(" ")}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SystemMessage = (props: {
  chatSessionId: string;
  children: ReactNode;
  message: chat_messages;
  session: chat_sessions;
  onThinkingStart: () => void;
  onThinkingStop: () => void;
  imageUrls: string[];
  onRetry: () => void;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>();

  const json = props.message.data as any;

  const {
    isPending: generateVisualPending,
    mutate: generateVisual,
    data: generateVisualResult,
  } = api.humain.generateImage.useMutation();

  const userHasSelectedPost = !!props.session.post_text;

  return (
    <>
      <div className="flex w-full justify-end mb-2">
        <div
          className={`rounded-xl ${
            props.message.type === "error"
              ? "bg-red-100 text-red-600"
              : "bg-amber-500/10"
          } p-2 px-4`}
        >
          {props.children}
        </div>
      </div>

      {json?.posts?.length && (
        <div className="grid grid-cols-2 gap-4 mb-2">
          {json.posts.map((post: any, index: number) => (
            <div
              key={index}
              className={`rounded-xl ${
                selectedImageIndex === index ||
                (props.session.post_title === post.title &&
                  props.session.post_text === post.text)
                  ? "bg-primary/20"
                  : "bg-stone-100"
              } p-2 px-4 mt-2 ${
                userHasSelectedPost ? "" : "cursor-pointer hover:bg-stone-200"
              }`}
              onClick={async () => {
                if (userHasSelectedPost) {
                  return;
                }

                setSelectedImageIndex(index);

                props.onThinkingStart();

                await generateVisual(
                  {
                    chatSessionId: props.chatSessionId!,
                    prompt: post.socialMediaImagePrompt,
                    imageUrls: props.imageUrls,
                    cta: post.ctaText,
                    printText: post.printText,
                    post: {
                      title: post.title,
                      text: post.text,
                      hashTags: post.hashTags ?? [],
                    },
                  },
                  {
                    onSuccess: (data) => {
                      props.onThinkingStop();
                      // props.onImageResult(data.base64Image ?? "");
                    },
                  }
                );
              }}
            >
              <div className="font-bold mb-1">{post.title}</div>
              <div className="mb-1">{post.text}</div>
              {post.hashTags && (
                <div className="mt-2 text-sm text-gray-500">
                  {post.hashTags.join(" ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {props.message.data_type === "image_url" && !!props.message.data && (
        <div className="flex w-full justify-end mb-2">
          <div className="flex flex-col  shadow-lg rounded-t-xl overflow-hidden">
            <div className="bg-neutral-200 p-0 w-[500px] h-[500px] flex items-center justify-center overflow-hidden">
              <Image
                src={props.message.data.toString()}
                alt="Generated Visual"
                width={500}
                height={500}
              />
            </div>
            <div
              className="bg-neutral-100 w-[500px] p-4 cursor-pointer transition-all text-[16px]"
              onClick={async () => {}}
            >
              <div>
                {props.session.post_text}{" "}
                <div className="text-blue-400">
                  {props.session.post_hashtags}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {props.message.text?.includes("is je afbeelding voor de social") && (
        <div className="flex w-full justify-end mb-2">
          <div
            className="bg-stone-100 p-2 rounded-lg hover:bg-primary transition-all text-stone-400 hover:text-white cursor-pointer"
            onClick={props.onRetry}
          >
            <RefreshCw className="  " size={14} />
          </div>
        </div>
      )}
    </>
  );
};
