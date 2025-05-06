
import { User } from "@/models/user";

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  members: string[]; // User IDs
}

// Mock teams data
const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Customer Support",
    description: "Handles general customer inquiries",
    leaderId: "4", // Team Leader ID
    members: ["2", "3", "6"] // User IDs
  },
  {
    id: "team-2",
    name: "Technical Support",
    description: "Handles technical product issues",
    leaderId: "team-leader-2",
    members: ["agent-3", "user-3", "user-4"]
  },
  {
    id: "team-3",
    name: "Billing Support",
    description: "Handles billing and payment issues",
    leaderId: "team-leader-3",
    members: ["agent-4", "user-5", "user-6"]
  }
];

// Mock users data with team associations
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    name: "Support Agent",
    email: "agent@example.com",
    role: "agent",
    teamId: "team-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent"
  },
  {
    id: "3",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    teamId: "team-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  },
  {
    id: "4",
    name: "Team Leader",
    email: "leader@example.com",
    role: "team_leader",
    teamId: "team-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader"
  },
  {
    id: "5",
    name: "Department Manager",
    email: "manager@example.com",
    role: "manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager"
  }
];

// Get all teams
export const getAllTeams = async (): Promise<Team[]> => {
  return mockTeams;
};

// Get team by ID
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  return mockTeams.find(team => team.id === teamId) || null;
};

// Get users by team ID
export const getUsersByTeamId = async (teamId: string): Promise<User[]> => {
  return mockUsers.filter(user => user.teamId === teamId);
};

// Get team leader for a team
export const getTeamLeader = async (teamId: string): Promise<User | null> => {
  const team = await getTeamById(teamId);
  if (!team || !team.leaderId) return null;
  
  return mockUsers.find(user => user.id === team.leaderId) || null;
};

// Get all team leaders
export const getAllTeamLeaders = async (): Promise<User[]> => {
  return mockUsers.filter(user => user.role === "team_leader");
};

// Get all managers
export const getAllManagers = async (): Promise<User[]> => {
  return mockUsers.filter(user => user.role === "manager");
};

// Assign user to team
export const assignUserToTeam = async (userId: string, teamId: string): Promise<boolean> => {
  // In a real app, this would make an API call
  console.log(`Assigning user ${userId} to team ${teamId}`);
  return true;
};
