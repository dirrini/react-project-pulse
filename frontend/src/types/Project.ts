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
  users: TaskUser[];
}

export interface TaskUser {
  id: string;
  user: User;
  status: TaskStatus;
  estimatedStartDate: string;
  estimatedEndDate: string;
}

export interface Product {
  id: string;
  externalCode?: string | null;
  status: string;
  vendor: string;
  materialCode: string;
  quantity: number;
  materialDescription: string;
  deliveryDate: string;
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
  products?: Product[];
}
