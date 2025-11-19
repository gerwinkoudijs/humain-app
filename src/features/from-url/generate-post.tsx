"use client";

import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const GeneratePost = (props: {
  onPostSelected: (title: string, post: string) => void;
  onImageResult: (base64Image: string) => void;
}) => {
  const params = useParams();
  const router = useRouter();
  const urlSessionId = params.sessionId as string;

  const {
    isPending: generateByUrlPending,
    mutate: generateByUrl,
    data: generateByUrlResult,
  } = api.humain.generateByUrl.useMutation();

  const [url, setUrl] = useState<string>("");

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <div className="text-stone-700">
        Voer de URL in van de website waarvoor je een post wilt genereren:
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input
          id="url"
          type="url"
          value={url}
          className="w-[400px]"
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <Button
        className=""
        onClick={async () => {
          await generateByUrl(
            { url },
            {
              onSuccess(data) {
                router.push(`/sessions/${data.sessionId}`);
              },
            }
          );
        }}
        disabled={generateByUrlPending}
      >
        {generateByUrlPending ? "Generating..." : "Generate"}
      </Button>
    </div>
  );
};
