import type { User }
  from "./User";

export type ProjectStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "COMPLETED";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  tasks?: Task[];
  users?: User[];
}
