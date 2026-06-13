export type UserRole =
  | "ADMIN"
  | "MEMBER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
