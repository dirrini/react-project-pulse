import { useQuery } from "@apollo/client/react";

import { PROJECTS_QUERY } from "../graphql/queries/projects";

import ProjectCard from "../components/projects/ProjectCard";
import StatsCard from "../components/dashboard/StatsCard";

import type { Project } from "../types/Project";

type ProjectsQueryData = {
  projects: Project[];
};

export default function Dashboard() {
  const { data, loading } =
    useQuery<ProjectsQueryData>(
      PROJECTS_QUERY
    );

  const projectCount =
    data?.projects.length ?? 0;

  return (
    <div>
      <h2
        className="
          text-3xl
          font-bold
          mb-8
        "
      >
        Dashboard
      </h2>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-8
        "
      >
        <StatsCard
          title="Projects"
          value={projectCount}
          subtitle="Active projects"
        />

        <StatsCard
          title="Tasks"
          value="84"
          subtitle="Across all projects"
        />

        <StatsCard
          title="Completed"
          value="61"
          subtitle="Finished tasks"
        />

        <StatsCard
          title="Team"
          value="8"
          subtitle="Members"
        />
      </div>

      <h3
        className="
          text-xl
          font-semibold
          mb-4
        "
      >
        Recent Projects
      </h3>

      {loading && (
        <p>Loading projects...</p>
      )}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {data?.projects.map(
          (project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              description={
                project.description
              }
              progress={
                project.progress
              }
            />
          )
        )}
      </div>
    </div>
  );
}