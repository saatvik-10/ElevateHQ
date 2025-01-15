'use clinet'

import { useProject } from '@/hooks/use-project';
import { api } from '@/trpc/react';
import React from 'react'

const CommitLog = () => {
    const {projectId} = useProject();
    const{data: commits} = api.project.getCommitHashes.useQuery({projectId});

  return (
    <pre>
      {JSON.stringify(commits, null, 2)}
    </pre>
  )
}

export default CommitLog;
