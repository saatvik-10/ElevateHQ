"use client";

import React from "react";
import { useProject } from "@/hooks/use-project";

const Dashboard = () => {
  const { project } = useProject();

  return (
    <div>
      <h1>{project?.name}</h1>
    </div>
  );
};

export default Dashboard;
