import {
  useEffect,
  useState,
  type FormEvent
} from "react";
import {
  Link,
  useParams
} from "react-router-dom";
import {
  useMutation,
  useQuery
} from "@apollo/client/react";

import CreateTaskDialog, {
  type CreateTaskFormValues
} from "../components/projects/CreateTaskDialog";
import StatusBadge from "../components/projects/StatusBadge";

import {
  CREATE_TASK_MUTATION,
  PROJECT_QUERY,
  PROJECTS_QUERY,
  UPDATE_PROJECT_MUTATION
} from "../graphql/queries/projects";

import type {
  Project,
  ProjectStatus,
  Task,
  TaskStatus
} from "../types/Project";

type ProjectQueryData = {
  project: Project | null;
};

type ProjectFormState = {
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
};

const emptyProjectForm: ProjectFormState = {
  name: "",
  description: "",
  progress: 0,
  status: "ON_TRACK"
};

function formatStatus(status: string) {
  return status
    .replace("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function taskStatusClasses(
  status: TaskStatus
) {
  if (status === "DONE")
    return "bg-blue-100 text-blue-700";

  if (status === "IN_PROGRESS")
    return "bg-yellow-100 text-yellow-700";

  return "bg-slate-100 text-slate-700";
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [isTaskDialogOpen, setIsTaskDialogOpen] =
    useState(false);
  const [projectForm, setProjectForm] =
    useState<ProjectFormState>(
      emptyProjectForm
    );

  const {
    data,
    loading,
    error
  } = useQuery<ProjectQueryData>(
    PROJECT_QUERY,
    {
      variables: {
        id
      },
      skip: !id,
      fetchPolicy: "cache-and-network"
    }
  );

  const [
    updateProject,
    {
      loading: updating,
      error: updateError
    }
  ] = useMutation(
    UPDATE_PROJECT_MUTATION,
    {
      refetchQueries: [
        {
          query: PROJECT_QUERY,
          variables: { id }
        },
        { query: PROJECTS_QUERY }
      ]
    }
  );

  const [
    createTask,
    {
      loading: creatingTask,
      error: createTaskError
    }
  ] = useMutation(
    CREATE_TASK_MUTATION,
    {
      refetchQueries: [
        {
          query: PROJECT_QUERY,
          variables: { id }
        }
      ]
    }
  );

  useEffect(() => {
    if (!data?.project)
      return;

    setProjectForm({
      name: data.project.name,
      description:
        data.project.description,
      progress:
        data.project.progress,
      status: data.project.status
    });
  }, [data]);

  const handleUpdateProject = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await updateProject({
      variables: {
        id,
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
  };

  const handleCreateTask = async (
    values: CreateTaskFormValues
  ) => {
    await createTask({
      variables: {
        input: {
          ...values,
          projectId: id
        }
      }
    });

    setIsTaskDialogOpen(false);
  };

  if (loading && !data?.project) {
    return <p>Loading project...</p>;
  }

  if (error || !data?.project) {
    return (
      <div>
        <Link
          to="/projects"
          className="
            mb-4
            inline-block
            text-sm
            text-slate-500
            hover:text-slate-900
          "
        >
          Back to projects
        </Link>

        <div
          className="
            rounded-xl
            border
            bg-white
            p-10
            text-center
          "
        >
          Project not found.
        </div>
      </div>
    );
  }

  const project = data.project;
  const tasks = project.tasks ?? [];

  return (
    <div>
      <Link
        to="/projects"
        className="
          mb-4
          inline-block
          text-sm
          text-slate-500
          hover:text-slate-900
        "
      >
        Back to projects
      </Link>

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-start
          md:justify-between
        "
      >
        <div>
          <div
            className="
              mb-3
              flex
              items-center
              gap-3
            "
          >
            <h2
              className="
                text-3xl
                font-bold
              "
            >
              {project.name}
            </h2>

            <StatusBadge
              status={project.status}
            />
          </div>

          <p className="text-slate-500">
            {project.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsTaskDialogOpen(true)
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
          New task
        </button>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[minmax(0,420px)_1fr]
        "
      >
        <form
          onSubmit={handleUpdateProject}
          className="
            rounded-xl
            border
            bg-white
            p-5
            shadow-sm
          "
        >
          <h3
            className="
              mb-4
              text-lg
              font-semibold
            "
          >
            Edit project
          </h3>

          <div className="space-y-4">
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
                rows={5}
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
          </div>

          {updateError && (
            <p
              className="
                mt-4
                text-sm
                text-red-600
              "
            >
              Could not update project.
            </p>
          )}

          <button
            type="submit"
            disabled={
              updating ||
              !projectForm.name.trim() ||
              !projectForm.description.trim()
            }
            className="
              mt-5
              w-full
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
            {updating
              ? "Saving..."
              : "Save changes"}
          </button>
        </form>

        <section>
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >
            <h3
              className="
                text-lg
                font-semibold
              "
            >
              Tasks
            </h3>

            <span
              className="
                text-sm
                text-slate-500
              "
            >
              {tasks.length} tasks
            </span>
          </div>

          {tasks.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                bg-white
                p-10
                text-center
                text-slate-500
              "
            >
              No tasks yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div
                  key={task.id}
                  className="
                    rounded-xl
                    border
                    bg-white
                    p-4
                    shadow-sm
                  "
                >
                  <div
                    className="
                      mb-2
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <h4
                      className="
                        font-semibold
                        text-slate-900
                      "
                    >
                      {task.title}
                    </h4>

                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-medium
                        ${taskStatusClasses(
                          task.status
                        )}
                      `}
                    >
                      {formatStatus(task.status)}
                    </span>
                  </div>

                  {task.description && (
                    <p
                      className="
                        text-sm
                        text-slate-600
                      "
                    >
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isTaskDialogOpen && (
        <CreateTaskDialog
          creating={creatingTask}
          errorMessage={
            createTaskError
              ? "Could not create task."
              : undefined
          }
          onClose={() =>
            setIsTaskDialogOpen(false)
          }
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}
