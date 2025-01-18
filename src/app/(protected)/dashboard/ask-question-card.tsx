"use client";

import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/hooks/use-project";
import Image from "next/image";
import React from "react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  const onSubmit = async (e: React.FormEvent) => {
    setAnswer("");
    setFilesReferences([]);
    if (!project?.id) return;
    e.preventDefault();
    setLoading(true);

    const { output, filesReferences } = await askQuestion(question, project.id);
    setOpen(true);
    setFilesReferences(filesReferences);
    // setLoading(false);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:!max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>
              <Image src="/elevate.png" alt="Logo" width={40} height={40} />
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="!h-full max-h-[40vh] max-w-[70vw] overflow-scroll"
          />
          {/* <h1>File References</h1>
          {filesReferences.map((file) => {
            return <span>{file.fileName}</span>;
          })} */}
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the Home Page?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
              }}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask ElevateHQ
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
