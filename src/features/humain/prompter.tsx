"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UploadFiles } from "./upload-files";

export const Prompter = (props: {
  isEditing?: boolean;
  onPrompt: (prompt: string, uploadUrls: string[]) => void;
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [uploadUrls, setUploadUrls] = useState<string[]>([]);
  const [clear, setClear] = useState<string>();

  return (
    <div className="flex gap-4 items-start justify-center">
      <div className="flex flex-col items-start gap-4">
        <div className="relative w-full">
          <div
            className={`textarea p-3 border-1 rounded-xl w-full min-w-[600px] max-w-[600px] min-h-[132px] focus:outline-none focus:ring-2 focus:ring-primary text-sm`}
            role="textbox"
            contentEditable
            onInput={(e) => setPrompt(e.currentTarget.textContent ?? "")}
            data-placeholder={
              props.isEditing
                ? `Describe the changes you want to apply to the image.\r\nOptional: Upload image(s) to use with the changes`
                : `Describe the product or service you want to create a social media post for.\r\nOptional: Upload image(s) to use in the design`
            }
            dangerouslySetInnerHTML={
              clear !== undefined ? { __html: "" } : undefined
            }
          ></div>
          <Button
            className="absolute bottom-2 right-2 "
            onClick={async () => {
              props.onPrompt(prompt, uploadUrls);

              setPrompt("");
              setUploadUrls([]);

              setClear("");
              setTimeout(() => setClear(undefined), 100);
            }}
          >
            {/* {generatePostPending ? "Generating..." : "Generate"} */}
            Generate
          </Button>
        </div>
      </div>

      {clear !== undefined ? null : (
        <UploadFiles onUploadComplete={(urls) => setUploadUrls(urls)} />
      )}
    </div>
  );
};
