import {
  useMemo,
  useState,
  type FormEvent
} from "react";
import { useMutation } from "@apollo/client/react";

import ProjectCard from "../components/projects/ProjectCard";
import SearchBar from "../components/projects/SearchBar";

import { useProjects } from "../hooks/useProjects";
import {
  CREATE_PROJECT_MUTATION,
  PROJECTS_QUERY
} from "../graphql/queries/projects";
import type { ProjectStatus } from "../types/Project";

type ProjectFormState = {
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
};

const initialProjectForm: ProjectFormState = {
  name: "",
  description: "",
  progress: 0,
  status: "ON_TRACK"
};

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
  const [projectForm, setProjectForm] =
    useState<ProjectFormState>(
      initialProjectForm
    );
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
    setProjectForm(initialProjectForm);
  };

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await createProject({
      variables: {
        input: {
          ...projectForm,
          name: projectForm.name.trim(),
          description:
            projectForm.description.trim(),
          progress: Math.min(
            100,
            Math.max(
              0,
              Number(projectForm.progress)
            )
          )
        }
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
        <h2
          className="
            text-3xl
            font-bold
          "
        >
          Projects
        </h2>

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
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/40
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-xl
              bg-white
              p-6
              shadow-xl
            "
          >
            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >
              <h3
                className="
                  text-xl
                  font-semibold
                "
              >
                New project
              </h3>

              <button
                type="button"
                onClick={closeCreateDialog}
                className="
                  rounded-lg
                  px-3
                  py-1
                  text-sm
                  text-slate-500
                  hover:bg-slate-100
                "
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleCreateProject}
              className="space-y-4"
            >
              <label className="block">
                <span
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Name
                </span>
                <input
                  required
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      name: event.target.value
                    })
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2
                    outline-none
                    focus:border-slate-900
                  "
                />
              </label>

              <label className="block">
                <span
                  className="
                    mb-1
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Description
                </span>
                <textarea
                  required
                  value={
                    projectForm.description
                  }
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      description:
                        event.target.value
                    })
                  }
                  rows={4}
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border
                    border-slate-300
                    px-3
                    py-2
                    outline-none
                    focus:border-slate-900
                  "
                />
              </label>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                <label className="block">
                  <span
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    Status
                  </span>
                  <select
                    value={projectForm.status}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        status:
                          event.target
                            .value as ProjectStatus
                      })
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2
                      outline-none
                      focus:border-slate-900
                    "
                  >
                    <option value="ON_TRACK">
                      On Track
                    </option>
                    <option value="AT_RISK">
                      At Risk
                    </option>
                    <option value="COMPLETED">
                      Completed
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span
                    className="
                      mb-1
                      block
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    Progress
                  </span>
                  <input
                    required
                    type="number"
                    min={0}
                    max={100}
                    value={projectForm.progress}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        progress:
                          Number(
                            event.target.value
                          )
                      })
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2
                      outline-none
                      focus:border-slate-900
                    "
                  />
                </label>
              </div>

              {createError && (
                <p className="text-sm text-red-600">
                  Could not create project.
                </p>
              )}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-2
                "
              >
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  className="
                    rounded-lg
                    border
                    px-4
                    py-2
                    text-sm
                    hover:bg-slate-100
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    !projectForm.name.trim() ||
                    !projectForm.description.trim()
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
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {creating
                    ? "Creating..."
                    : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
