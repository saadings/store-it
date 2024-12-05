"use client";

import { MAX_FILE_SIZE } from "@/constants";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import { uploadFile } from "@/server/actions/file.actions";
import type { ClassValue } from "clsx";
import { useMutation } from "convex/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Thumbnail from "./Thumbnail";
import { Button } from "./ui/button";

interface FileUploaderProps {
  ownerId: string;
  accountId: string;
  className?: ClassValue;
}

const FileUploader = ({ ownerId, accountId, className }: FileUploaderProps) => {
  const { toast } = useToast();
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const generateUploadUrl = useMutation(api.file.generateUploadUrl);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

      const uploadPromises = acceptedFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          setFiles((prevFiles) =>
            prevFiles.filter((prevFile) => prevFile.name !== file.name),
          );

          return toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> is too large.
                Maximum file size is 50MB.
              </p>
            ),
            className: "error-toast",
          });
        }

        const postUrl = await generateUploadUrl();

        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file!.type },
          body: file,
        });
        const urlData = await result.json();

        const data = await uploadFile({
          file,
          ownerId,
          accountId,
          storageId: urlData.storageId,
          path,
        });

        if (data) {
          setFiles((prevFiles) =>
            prevFiles.filter((prevFile) => prevFile.name !== file.name),
          );
        }
      });

      await Promise.all(uploadPromises);
    },
    [toast, accountId, generateUploadUrl, ownerId, path],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLImageElement>,
    fileName: string,
  ) => {
    e.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />
      <Button type="button" className={cn("uploader-button", className)}>
        <Image
          src={"/assets/icons/upload.svg"}
          alt="upload"
          width={24}
          height={24}
        />
        <p>Upload</p>
      </Button>

      {files.length > 0 && (
        <ul className="uploader-preview-list">
          <h4 className="h4 text-light-100">Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);

            return (
              <li
                key={`${file.name}-${index}`}
                className="uploader-preview-item"
              >
                <div className="flex items-center gap-3">
                  <Thumbnail
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}
                  />

                  <div className="preview-item-name">
                    {file.name}

                    <Image
                      src={"/assets/icons/file-loader.gif"}
                      alt="loader"
                      width={80}
                      height={26}
                      unoptimized
                    />
                  </div>
                </div>

                <Image
                  src={"/assets/icons/remove.svg"}
                  width={24}
                  height={24}
                  alt="remove"
                  onClick={(e) => handleRemoveFile(e, file.name)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;
