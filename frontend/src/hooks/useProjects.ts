import { useQuery } from "@apollo/client/react";

import { PROJECTS_QUERY } from "../graphql/queries/projects";

import type { Project } from "../types/Project";

type ProjectsQueryData = {
  projects: Project[];
};

export function useProjects() {
  return useQuery<ProjectsQueryData>(
    PROJECTS_QUERY
  );
}