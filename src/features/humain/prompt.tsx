"use client";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useState } from "react";

export const Prompt = (props: {
  uploadUrls: string[];
  onImageResult: (base64Image: string) => void;
}) => {
  const {
    isPending: generateVisualPending,
    mutate: generateVisual,
    data: generateVisualResult,
  } = api.humain.generateImage.useMutation();

  const [prompt, setPrompt] = useState<string>("");

  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center mb-[32px] gap-8">
        {/* {props.uploadUrls.map((url) => (
          <div key={url}>{url}</div>
        ))} */}

        <div className="flex flex-col items-start justify-center mx-[32px] gap-4">
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
                await generateVisual(
                  {
                    prompt: prompt,
                    imageUrls: props.uploadUrls,
                  },
                  {
                    onSuccess: (data) => {
                      props.onImageResult(data.base64Image ?? "");
                    },
                  }
                )
              }
            >
              {generateVisualPending ? "Generating..." : "Generate"}
            </div>
          </div>

          {generateVisualResult?.base64Image && (
            <div className="bg-neutral-100 w-full p-4 rounded-lg">
              <Image
                src={`data:image/png;base64,${generateVisualResult.base64Image}`}
                //src={generateVisualResult?.base64Image}
                alt="Generated Visual"
                width={500}
                height={500}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
