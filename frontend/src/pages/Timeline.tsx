import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useQuery }
  from "@apollo/client/react";
import {
  Timeline as VisTimeline,
  type DataGroup,
  type DataItem,
  type TimelineOptions
} from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

import StatusBadge from "../components/projects/StatusBadge";
import { TIMELINE_PROJECTS_QUERY }
  from "../graphql/queries/timeline";

import type {
  Project,
  Task,
  TaskStatus,
  TaskUser
} from "../types/Project";
import type { User }
  from "../types/User";

type TimelineProjectsData = {
  timelineProjects: Project[];
};

type TimelineAssignment = TaskUser & {
  task: Task;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addOneDay(date: string) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);

  return nextDate;
}

function getAssignmentClass(
  status: TaskStatus
) {
  if (status === "DONE")
    return "timeline-item-done";

  if (status === "IN_PROGRESS")
    return "timeline-item-in-progress";

  return "timeline-item-todo";
}

function buildTimelineGroups(
  users: User[]
): DataGroup[] {
  return users.map((user) => ({
    id: user.id,
    content: escapeHtml(user.name),
    title: user.email
  }));
}

function buildTimelineItems(
  assignments: TimelineAssignment[]
): DataItem[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    group: assignment.user.id,
    content: escapeHtml(assignment.task.title),
    start: new Date(
      `${assignment.estimatedStartDate}T00:00:00`
    ),
    end: addOneDay(
      assignment.estimatedEndDate
    ),
    type: "range",
    className: getAssignmentClass(
      assignment.status
    ),
    title: [
      escapeHtml(assignment.task.title),
      escapeHtml(assignment.user.name),
      formatStatus(assignment.status),
      `${assignment.estimatedStartDate} to ${assignment.estimatedEndDate}`
    ].join(" - ")
  }));
}

const timelineOptions: TimelineOptions = {
  editable: false,
  stack: true,
  selectable: true,
  orientation: {
    axis: "top",
    item: "bottom"
  },
  horizontalScroll: true,
  zoomKey: "ctrlKey",
  height: "520px",
  margin: {
    axis: 18,
    item: {
      horizontal: 8,
      vertical: 8
    }
  }
};

export default function Timeline() {
  const containerRef =
    useRef<HTMLDivElement | null>(null);
  const timelineRef =
    useRef<VisTimeline | null>(null);
  const [
    selectedProjectId,
    setSelectedProjectId
  ] = useState("");

  const {
    data,
    loading,
    error
  } = useQuery<TimelineProjectsData>(
    TIMELINE_PROJECTS_QUERY,
    {
      fetchPolicy: "cache-and-network"
    }
  );

  const projects =
    data?.timelineProjects ?? [];

  useEffect(() => {
    if (
      selectedProjectId ||
      projects.length === 0
    ) {
      return;
    }

    setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) =>
          project.id === selectedProjectId
      ) ?? projects[0],
    [projects, selectedProjectId]
  );

  const projectUsers = useMemo(
    () =>
      selectedProject?.users?.filter(
        (user) =>
          user.role === "PROJECT_MANAGER" ||
          user.role === "MEMBER"
      ) ?? [],
    [selectedProject]
  );

  const assignments = useMemo(
    () =>
      selectedProject?.tasks?.flatMap(
        (task) =>
          task.users.map((taskUser) => ({
            ...taskUser,
            task
          }))
      ) ?? [],
    [selectedProject]
  );

  const completedAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "DONE"
    ).length;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !selectedProject) {
      return;
    }

    const groups =
      buildTimelineGroups(projectUsers);
    const items =
      buildTimelineItems(assignments);

    if (!timelineRef.current) {
      timelineRef.current = new VisTimeline(
        container,
        items,
        groups,
        timelineOptions
      );
    } else {
      timelineRef.current.setGroups(groups);
      timelineRef.current.setItems(items);
      timelineRef.current.setOptions(
        timelineOptions
      );
    }

    if (assignments.length > 0) {
      const dates = assignments.flatMap(
        (assignment) => [
          new Date(
            `${assignment.estimatedStartDate}T00:00:00`
          ),
          addOneDay(
            assignment.estimatedEndDate
          )
        ]
      );
      const minDate = new Date(
        Math.min(
          ...dates.map((date) =>
            date.getTime()
          )
        )
      );
      const maxDate = new Date(
        Math.max(
          ...dates.map((date) =>
            date.getTime()
          )
        )
      );

      minDate.setDate(minDate.getDate() - 3);
      maxDate.setDate(maxDate.getDate() + 3);
      timelineRef.current.setWindow(
        minDate,
        maxDate,
        {
          animation: false
        }
      );
    }
  }, [
    assignments,
    projectUsers,
    selectedProject
  ]);

  useEffect(
    () => () => {
      timelineRef.current?.destroy();
      timelineRef.current = null;
    },
    []
  );

  if (loading && projects.length === 0) {
    return <p>Loading timeline...</p>;
  }

  if (error) {
    return (
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
        You do not have access to the timeline.
      </div>
    );
  }

  if (projects.length === 0) {
    return (
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
        No projects available for timeline view.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-start
          md:justify-between
        "
      >
        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
            "
          >
            Timeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View project task assignments by user and estimated dates.
          </p>
        </div>

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
            Project
          </span>
          <select
            value={
              selectedProject?.id ?? ""
            }
            onChange={(event) =>
              setSelectedProjectId(
                event.target.value
              )
            }
            className="
              min-w-64
              rounded-lg
              border
              border-slate-300
              bg-white
              px-3
              py-2
              text-sm
              outline-none
              focus:border-slate-900
            "
          >
            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedProject && (
        <section
          className="
            rounded-xl
            border
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              mb-5
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >
            <div>
              <div
                className="
                  mb-2
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <h3
                  className="
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >
                  {selectedProject.name}
                </h3>

                <StatusBadge
                  status={
                    selectedProject.status
                  }
                />
              </div>

              <p className="text-sm text-slate-500">
                {selectedProject.description}
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-3
                gap-3
                text-center
              "
            >
              <div
                className="
                  rounded-lg
                  bg-slate-50
                  px-4
                  py-3
                "
              >
                <p className="text-lg font-semibold">
                  {projectUsers.length}
                </p>
                <p className="text-xs text-slate-500">
                  Users
                </p>
              </div>

              <div
                className="
                  rounded-lg
                  bg-slate-50
                  px-4
                  py-3
                "
              >
                <p className="text-lg font-semibold">
                  {assignments.length}
                </p>
                <p className="text-xs text-slate-500">
                  Assignments
                </p>
              </div>

              <div
                className="
                  rounded-lg
                  bg-slate-50
                  px-4
                  py-3
                "
              >
                <p className="text-lg font-semibold">
                  {completedAssignments}
                </p>
                <p className="text-xs text-slate-500">
                  Done
                </p>
              </div>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                p-10
                text-center
                text-slate-500
              "
            >
              No task assignments with estimated dates yet.
            </div>
          ) : (
            <>
              <div
                className="
                  mb-4
                  flex
                  flex-wrap
                  gap-3
                  text-xs
                  text-slate-600
                "
              >
                <span className="timeline-legend timeline-legend-todo">
                  To do
                </span>
                <span className="timeline-legend timeline-legend-in-progress">
                  In progress
                </span>
                <span className="timeline-legend timeline-legend-done">
                  Done
                </span>
              </div>

              <div
                ref={containerRef}
                className="
                  min-h-[520px]
                  overflow-hidden
                  rounded-lg
                  border
                  border-slate-200
                "
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}
