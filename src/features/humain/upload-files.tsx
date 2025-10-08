"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import axios from "axios";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { useRef } from "react";
import { useCallback, useState } from "react";

export function UploadFiles(props: {
  onUploadComplete: (urls: string[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const uploadUrls = useRef<{ name: string; url: string }[]>([]);

  const onUpload = useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      }
    ) => {
      await Promise.all(
        files.map(async (file) => {
          try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await axios.post(
              "/api/file/upload/image",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent.total || 1)
                  );

                  onProgress(file, percentCompleted);
                },
              }
            );

            // console.log("Upload Successful:", response.data.message);

            uploadUrls.current.push({
              name: file.name,
              url: response.data.fileUrl,
            });
            onSuccess(file);
          } catch (error) {
            onError(file, error as Error);
            console.error("Error uploading file:", error);
          }
        })
      );

      props.onUploadComplete(uploadUrls.current.map((item) => item.url));
    },
    []
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    alert(
      `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`
    );
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onUpload={onUpload}
        onFileReject={onFileReject}
        maxFiles={10}
        className="w-full max-w-md"
        multiple
      >
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="flex-col">
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete
                  asChild
                  onClick={() => {
                    uploadUrls.current = uploadUrls.current.filter(
                      (f) => f.name !== file.name
                    );
                    props.onUploadComplete(
                      uploadUrls.current.map((item) => item.url)
                    );
                  }}
                >
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-medium text-sm">Drag & drop an image here</p>
            <p className="text-muted-foreground text-xs">Or click to browse</p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Add image(s)
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  );
}
