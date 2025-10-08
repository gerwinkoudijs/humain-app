"use client";

import { GeneratePost } from "./generate-post";

export const Humain = () => {
  return (
    <div className="w-full flex flex-col grow">
      <div className="flex flex-col items-start justify-center gap-2">
        <GeneratePost
          onPostSelected={(title, text) => {}}
          onImageResult={(data) => {}}
        />
      </div>
    </div>
  );
};
