"use client";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useState } from "react";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";

export const GeneratePost = (props: {
  onPostSelected: (title: string, post: string) => void;
  uploadUrls: string[];
  onImageResult: (base64Image: string) => void;
}) => {
  const {
    isPending: generatePostPending,
    mutate: generatePost,
    data: generatePostResult,
  } = api.humain.generatePost.useMutation();

  const {
    isPending: generateVisualPending,
    mutate: generateVisual,
    data: generateVisualResult,
  } = api.humain.generateImage.useMutation();

  const {
    isPending: editImagePending,
    mutate: editImage,
    data: editImageResult,
  } = api.humain.editImage.useMutation();

  const [prompt, setPrompt] = useState<string>("");
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [editPromptHistory, setEditPromptHistory] = useState<string>("");

  const [selectedPost, setSelectedPost] = useState<{
    title: string;
    text: string;
    index: number;
    socialMediaImagePrompt?: string;
    ctaText?: string;
    printText?: string;
    hashTags?: string[];
  }>();

  // if (generateVisualPending) return <div>Generating image...</div>;

  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center mb-[32px] gap-8">
        {/* {props.uploadUrls.map((url) => (
          <div key={url}>{url}</div>
        ))} */}

        <div className="flex flex-col items-start justify-center mx-[32px] gap-4">
          {!selectedPost ? (
            <div className="flex flex-col gap-2 items-start justify-center">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[600px] h-[120px]"
                cols={180}
                rows={5}
              />
              <div
                className=" bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors text-white px-4 py-1 rounded-lg"
                onClick={async () =>
                  await generatePost(
                    {
                      prompt: prompt,
                    },
                    {
                      onSuccess: (data) => {},
                    }
                  )
                }
              >
                {generatePostPending ? "Generating..." : "Generate"}
              </div>
            </div>
          ) : null}

          {!selectedPost ? (
            <div className="grid grid-cols-2 gap-4">
              {(generatePostResult?.posts ?? []).map((post, ix) => (
                <div
                  key={ix}
                  className="bg-neutral-100 w-[500px] p-4 rounded-lg cursor-pointer hover:bg-neutral-200 transition-all text-[16px]"
                  onClick={async () => {
                    props.onPostSelected(post.title, post.text);

                    setSelectedPost({ ...post, index: ix });

                    await generateVisual(
                      {
                        prompt: post.socialMediaImagePrompt,
                        imageUrls: props.uploadUrls,
                        cta: post.ctaText,
                        printText: post.printText,
                      },
                      {
                        onSuccess: (data) => {
                          props.onImageResult(data.base64Image ?? "");
                        },
                      }
                    );
                  }}
                >
                  <b>
                    {ix + 1}. {post.title}
                  </b>
                  <br />
                  {ix + 1}. {post.text}{" "}
                  <span>
                    {(post.hashTags ?? []).map((word, wordIndex) =>
                      word.startsWith("#") ? (
                        <span key={wordIndex} className="text-blue-600">
                          {word}{" "}
                        </span>
                      ) : (
                        `${word} `
                      )
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="bg-neutral-200 p-0 w-[500px] h-[500px] flex items-center justify-center overflow-hidden">
                {!editImagePending &&
                (editImageResult?.base64Image ||
                  generateVisualResult?.base64Image) ? (
                  <Image
                    src={`data:image/png;base64,${
                      editImageResult?.base64Image ??
                      generateVisualResult?.base64Image
                    }`}
                    //src={generateVisualResult?.base64Image}
                    alt="Generated Visual"
                    width={500}
                    height={500}
                  />
                ) : (
                  <Loader />
                )}
              </div>
              <div
                className="bg-neutral-100 w-[500px] p-4 cursor-pointer hover:bg-neutral-200 transition-all text-[16px]"
                onClick={async () => {}}
              >
                <b>
                  {selectedPost.index + 1}. {selectedPost.title}
                </b>
                <br />
                <span>
                  <span>
                    {selectedPost.text}{" "}
                    {(selectedPost.hashTags ?? []).map((word, wordIndex) =>
                      word.startsWith("#") ? (
                        <span key={wordIndex} className="text-blue-600">
                          {word}{" "}
                        </span>
                      ) : (
                        `${word} `
                      )
                    )}
                  </span>
                </span>
              </div>
              {generateVisualResult?.base64Image && (
                <div className="flex flex-col gap-2 items-start justify-center mt-4">
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[600px] h-[120px]"
                    cols={180}
                    rows={5}
                  />
                  <div
                    className=" bg-blue-600 hover:bg-blue-500 cursor-pointer transition-colors text-white px-4 py-1 rounded-lg"
                    onClick={async () => {
                      const editPromptWithHistory =
                        (editPromptHistory ?? "") + "\n* " + (editPrompt ?? "");

                      setEditPromptHistory(editPromptWithHistory);

                      await editImage(
                        {
                          imageBase64: generateVisualResult.base64Image!,
                          prompt: editPromptWithHistory,
                          cta: selectedPost.ctaText ?? "",
                        },
                        {
                          onSuccess: (data) => {},
                        }
                      );
                    }}
                  >
                    {editImagePending ? "Generating edit..." : "Edit image"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
