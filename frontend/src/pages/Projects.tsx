import { useMemo, useState } from "react";

import ProjectCard from "../components/projects/ProjectCard";
import SearchBar from "../components/projects/SearchBar";

import { useProjects } from "../hooks/useProjects";

export default function Projects() {
  const { data, loading } = useProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<
      "ALL" |
      "ON_TRACK" |
      "AT_RISK" |
      "COMPLETED"
    >("ALL");

  const filteredProjects =
    useMemo(() => {
      if (!data?.projects)
        return [];

      return data.projects.filter(
        (project) => {

          const matchesSearch =
            project.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter === "ALL"
              ? true
              : project.status ===
                statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      data,
      search,
      statusFilter
    ]);

  return (
    <div>
      <div
        className="
          flex
          justify-between
          items-center
          mb-4
        "
      >
        <h2
          className="
            text-3xl
            font-bold
          "
        >
          Projects
        </h2>

        <span
          className="
            text-sm
            text-slate-500
          "
        >
          {filteredProjects.length}
          {" "}
          projects
        </span>
      </div>

      <div className="mb-4">
        <p className="text-slate-500">
          Manage and monitor all active projects.
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
        />
      </div>

      <div
        className="
          flex
          gap-2
          mb-6
          flex-wrap
        "
      >
        {[
          "ALL",
          "ON_TRACK",
          "AT_RISK",
          "COMPLETED"
        ].map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(
                status as
                  | "ALL"
                  | "ON_TRACK"
                  | "AT_RISK"
                  | "COMPLETED"
              )
            }
            className={`
              px-4
              py-2
              rounded-lg
              border
              text-sm
              transition

              ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-white hover:bg-slate-100"
              }
            `}
          >
            {status
              .replace("_", " ")
              .toLowerCase()
              .replace(
                /\b\w/g,
                (c) => c.toUpperCase()
              )}
          </button>
        ))}
      </div>

      {loading && (
        <p>Loading projects...</p>
      )}

      {!loading &&
        filteredProjects.length === 0 && (
          <div
            className="
              bg-white
              rounded-xl
              border
              p-10
              text-center
            "
          >
            No projects found.
          </div>
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
        {filteredProjects.map(
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
              status={
                project.status
              }
            />
          )
        )}
      </div>
    </div>
  );
}