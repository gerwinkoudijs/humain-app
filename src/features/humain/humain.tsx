"use client";

import { UploadFiles } from "./upload-files";
import { Prompt } from "./prompt";
import { useState } from "react";
import { PromptStep2 } from "./prompt2";
import { GeneratePost } from "./generate-post";

export const Humain = () => {
  const [uploadUrls, setUploadUrls] = useState<string[]>([]);
  const [base64Image, setBase64Image] = useState<string>();
  const [selectedPost, setSelectedPost] = useState<{
    title: string;
    text: string;
  }>();

  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center gap-8">
        <UploadFiles onUploadComplete={(urls) => setUploadUrls(urls)} />

        <GeneratePost
          onPostSelected={(title, text) => {
            setSelectedPost({ title, text });
          }}
          uploadUrls={uploadUrls}
          onImageResult={(data) => setBase64Image(data)}
        />

        {/* <>
          <Prompt
            uploadUrls={uploadUrls}
            onImageResult={(data) => setBase64Image(data)}
          />
          {!!base64Image && <PromptStep2 base64Image={base64Image} />}
        </> */}
      </div>
    </div>
  );
};
