
export type UserRole = "admin" | "agent" | "user" | "team_leader" | "manager";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  avatar?: string;
  empCode?: string;
  company?: string;
};

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, empCode?: string, company?: string) => Promise<void>;
  logout: () => void;
}
