"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";

type FormInputProps = {
  repoURL: string;
  projectName: string;
  githubToken?: string;
};

const CreateProject = () => {
  const { register, handleSubmit, reset } = useForm<FormInputProps>();

  function onSubmit(data: FormInputProps) {
    window.alert(JSON.stringify(data));
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/createPage.svg" alt="Logo" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your GitHub repository to get started.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("repoURL", { required: true })}
              placeholder="Project Name"
            />
            <div className="h-2"></div>
            <Input
              {...register("projectName", { required: true })}
              placeholder="GitHub URL"
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (Optional)"
            />
            <div className="h-4"></div>
            <Button type="submit">Check Credits</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
