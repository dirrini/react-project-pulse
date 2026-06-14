import {
  useMemo,
  useState
} from "react";
import { useMutation } from "@apollo/client/react";

import CreateProjectDialog, {
  type CreateProjectFormValues
} from "../components/projects/CreateProjectDialog";
import ProjectCard from "../components/projects/ProjectCard";
import SearchBar from "../components/projects/SearchBar";

import { useProjects } from "../hooks/useProjects";
import {
  CREATE_PROJECT_MUTATION,
  PROJECTS_QUERY
} from "../graphql/queries/projects";

export default function Projects() {
  const { data, loading } = useProjects();
  const [
    createProject,
    { loading: creating, error: createError }
  ] = useMutation(CREATE_PROJECT_MUTATION, {
    refetchQueries: [
      { query: PROJECTS_QUERY }
    ]
  });
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] =
    useState(false);
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

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
  };

  const handleCreateProject = async (
    values: CreateProjectFormValues
  ) => {
    await createProject({
      variables: {
        input: values
      }
    });

    closeCreateDialog();
  };

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
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
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

          <button
            type="button"
            onClick={() =>
              setIsCreateOpen(true)
            }
            className="
              rounded-lg
              bg-slate-900
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-700
            "
          >
            New project
          </button>
        </div>
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
              id={project.id}
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

      {isCreateOpen && (
        <CreateProjectDialog
          creating={creating}
          errorMessage={
            createError
              ? "Could not create project."
              : undefined
          }
          onClose={closeCreateDialog}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
