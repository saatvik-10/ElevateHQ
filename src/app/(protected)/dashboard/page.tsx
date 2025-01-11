"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";

const Dashboard = () => {
  const { user } = useUser();

  return <div>{user?.firstName}</div>;
};

export default Dashboard;
