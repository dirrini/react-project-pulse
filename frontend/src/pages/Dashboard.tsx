import { useQuery } from "@apollo/client/react";

import { PROJECTS_QUERY } from "../graphql/queries/projects";
import { DASHBOARD_STATS_QUERY } from "../graphql/queries/dashboard";

import ProjectCard from "../components/projects/ProjectCard";
import StatsCard from "../components/dashboard/StatsCard";

import type { Project } from "../types/Project";
import type { DashboardStats } from "../types/DashboardStats";

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

  type DashboardStatsQueryData = {
    dashboardStats: DashboardStats;
  };
  const { data: statsData } =
    useQuery<DashboardStatsQueryData>(
      DASHBOARD_STATS_QUERY
    );

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
          value={
            statsData?.dashboardStats
              .totalProjects ?? 0
          }
        />

        <StatsCard
          title="Tasks"
          value={
            statsData?.dashboardStats
              .totalTasks ?? 0
          }
        />

        <StatsCard
          title="Completed"
          value={
            statsData?.dashboardStats
              .completedTasks ?? 0
          }
        />

        <StatsCard
          title="Team"
          value={
            statsData?.dashboardStats
              .teamMembers ?? 0
          }
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