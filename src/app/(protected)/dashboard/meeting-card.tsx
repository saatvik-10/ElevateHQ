"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "@/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const MeetingCard = () => {
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".flac"],
    },
    multiple: false,
    maxSize: 50_000_000,

    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const file = acceptedFiles[0];

      console.log(acceptedFiles);

      const downloadURL = uploadFile(file as File, setProgress);

      window.alert(downloadURL);
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="size-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a New Meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with{" "}
            <span className="font-bold text-primary">ElevateHQ</span>
            <br />
            Powered by AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 size-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}

      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
          />
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
