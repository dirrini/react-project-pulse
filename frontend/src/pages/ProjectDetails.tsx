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
import EditTaskDialog, {
  type EditTaskFormValues
} from "../components/projects/EditTaskDialog";
import StatusBadge from "../components/projects/StatusBadge";

import {
  ADD_PROJECT_USER_MUTATION,
  CREATE_TASK_MUTATION,
  PROJECT_QUERY,
  PROJECTS_QUERY,
  REMOVE_PROJECT_USER_MUTATION,
  UPDATE_TASK_MUTATION,
  UPDATE_PROJECT_MUTATION
} from "../graphql/queries/projects";
import {
  ME_QUERY,
  USERS_QUERY
} from "../graphql/queries/auth";

import type {
  Project,
  ProjectStatus,
  Task,
  TaskStatus
} from "../types/Project";
import type { User }
  from "../types/User";

type ProjectQueryData = {
  project: Project | null;
};

type MeQueryData = {
  me: {
    role: string;
  } | null;
};

type UsersQueryData = {
  users: User[];
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
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);
  const [
    selectedUserId,
    setSelectedUserId
  ] = useState("");
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
  const { data: meData } =
    useQuery<MeQueryData>(ME_QUERY);
  const canManageProjects =
    meData?.me?.role === "ADMIN" ||
    meData?.me?.role ===
      "PROJECT_MANAGER";
  const { data: usersData } =
    useQuery<UsersQueryData>(USERS_QUERY, {
      skip: !canManageProjects,
      fetchPolicy: "cache-and-network"
    });

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
  const [
    updateTask,
    {
      loading: updatingTask,
      error: updateTaskError
    }
  ] = useMutation(
    UPDATE_TASK_MUTATION,
    {
      refetchQueries: [
        {
          query: PROJECT_QUERY,
          variables: { id }
        }
      ]
    }
  );
  const [
    addProjectUser,
    {
      loading: addingUser,
      error: addUserError
    }
  ] = useMutation(
    ADD_PROJECT_USER_MUTATION,
    {
      refetchQueries: [
        {
          query: PROJECT_QUERY,
          variables: { id }
        }
      ]
    }
  );
  const [
    removeProjectUser,
    {
      loading: removingUser,
      error: removeUserError
    }
  ] = useMutation(
    REMOVE_PROJECT_USER_MUTATION,
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

  const handleUpdateTask = async (
    values: EditTaskFormValues
  ) => {
    if (!editingTask)
      return;

    await updateTask({
      variables: {
        id: editingTask.id,
        input: values
      }
    });

    setEditingTask(null);
  };

  const handleAddProjectUser = async () => {
    if (!selectedUserId || !id)
      return;

    await addProjectUser({
      variables: {
        input: {
          projectId: id,
          userId: selectedUserId
        }
      }
    });

    setSelectedUserId("");
  };

  const handleRemoveProjectUser = async (
    userId: string
  ) => {
    if (!id)
      return;

    await removeProjectUser({
      variables: {
        input: {
          projectId: id,
          userId
        }
      }
    });
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
  const projectUsers = project.users ?? [];
  const projectManagers =
    projectUsers.filter(
      (user) =>
        user.role === "PROJECT_MANAGER"
    );
  const members = projectUsers.filter(
    (user) => user.role === "MEMBER"
  );
  const assignableUsers =
    usersData?.users.filter(
      (user) =>
        !projectUsers.some(
          (projectUser) =>
            projectUser.id === user.id
        )
    ) ?? [];

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

        {canManageProjects && (
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
        )}
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-[minmax(0,420px)_1fr]
        "
      >
        {canManageProjects && (
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
        )}

        <section>
          <div
            className="
              mb-6
              rounded-xl
              border
              bg-white
              p-5
              shadow-sm
            "
          >
            <div
              className="
                mb-4
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <h3
                className="
                  text-lg
                  font-semibold
                "
              >
                Project users
              </h3>

              {canManageProjects && (
                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                  "
                >
                  <select
                    value={selectedUserId}
                    onChange={(event) =>
                      setSelectedUserId(
                        event.target.value
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-slate-300
                      px-3
                      py-2
                      text-sm
                      outline-none
                      focus:border-slate-900
                    "
                  >
                    <option value="">
                      Select user
                    </option>

                    {assignableUsers.map(
                      (user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {user.name} ({formatStatus(user.role)})
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddProjectUser}
                    disabled={
                      !selectedUserId ||
                      addingUser
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
                    {addingUser
                      ? "Adding..."
                      : "Add user"}
                  </button>
                </div>
              )}
            </div>

            {(addUserError ||
              removeUserError) && (
              <p className="mb-4 text-sm text-red-600">
                Could not update project users.
              </p>
            )}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                lg:grid-cols-2
              "
            >
              <div>
                <h4
                  className="
                    mb-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Project Managers
                </h4>

                {projectManagers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No project managers assigned.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projectManagers.map(
                      (user) => (
                        <div
                          key={user.id}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            rounded-lg
                            border
                            p-3
                          "
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>

                          {canManageProjects && (
                            <button
                              type="button"
                              disabled={removingUser}
                              onClick={() =>
                                handleRemoveProjectUser(
                                  user.id
                                )
                              }
                              className="
                                rounded-lg
                                border
                                px-3
                                py-1
                                text-sm
                                hover:bg-slate-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                              "
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4
                  className="
                    mb-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Members
                </h4>

                {members.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No members assigned.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map((user) => (
                      <div
                        key={user.id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          rounded-lg
                          border
                          p-3
                        "
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>

                        {canManageProjects && (
                          <button
                            type="button"
                            disabled={removingUser}
                            onClick={() =>
                              handleRemoveProjectUser(
                                user.id
                              )
                            }
                            className="
                              rounded-lg
                              border
                              px-3
                              py-1
                              text-sm
                              hover:bg-slate-100
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

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

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-2
                      "
                    >
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

                      {canManageProjects && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTask(task)
                          }
                          className="
                            rounded-lg
                            border
                            px-3
                            py-1
                            text-sm
                            hover:bg-slate-100
                          "
                        >
                          Edit
                        </button>
                      )}
                    </div>
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

                  {task.users.length > 0 && (
                    <div
                      className="
                        mt-4
                        space-y-2
                      "
                    >
                      {task.users.map(
                        (taskUser) => (
                          <div
                            key={taskUser.id}
                            className="
                              grid
                              grid-cols-1
                              gap-2
                              rounded-lg
                              bg-slate-50
                              p-3
                              text-sm
                              sm:grid-cols-[minmax(0,1fr)_auto_auto]
                              sm:items-center
                            "
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {taskUser.user.name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {taskUser.user.email}
                              </p>
                            </div>

                            <span
                              className={`
                                w-fit
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-medium
                                ${taskStatusClasses(
                                  taskUser.status
                                )}
                              `}
                            >
                              {formatStatus(
                                taskUser.status
                              )}
                            </span>

                            <span className="text-xs text-slate-500">
                              {
                                taskUser.estimatedStartDate
                              }{" "}
                              to{" "}
                              {
                                taskUser.estimatedEndDate
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isTaskDialogOpen && canManageProjects && (
        <CreateTaskDialog
          creating={creatingTask}
          projectUsers={projectUsers}
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

      {editingTask && canManageProjects && (
        <EditTaskDialog
          task={editingTask}
          saving={updatingTask}
          projectUsers={projectUsers}
          errorMessage={
            updateTaskError
              ? "Could not update task."
              : undefined
          }
          onClose={() =>
            setEditingTask(null)
          }
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
}
