export type ProjectStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "COMPLETED";

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
}