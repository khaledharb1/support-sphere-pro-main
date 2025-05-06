
export interface Assignee {
  id: string;
  name: string;
  role: "admin" | "agent" | "team_leader" | "manager";
  avatar?: string;
}
