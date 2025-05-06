
export type UserRole = "admin" | "agent" | "user" | "team_leader" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  avatar?: string;
  empCode?: string;
  company?: string;
}

export const canViewTicket = (user: User | null, ticketCreatorId: string, ticketAssigneeId?: string, ticketTeamId?: string): boolean => {
  if (!user) return false;
  
  switch (user.role) {
    case "admin":
    case "manager":
      // Admins and managers can view all tickets
      return true;
    case "team_leader":
      // Team leaders can view tickets from their team
      return ticketTeamId === user.teamId;
    case "agent":
      // Agents can only view tickets assigned to them
      return user.id === ticketAssigneeId;
    case "user":
      // Regular users can only view their own tickets
      return user.id === ticketCreatorId;
    default:
      return false;
  }
};

export const canResolveTicket = (user: User | null): boolean => {
  if (!user) return false;
  
  // Only agents, team leaders, managers and admins can resolve tickets
  return ["agent", "team_leader", "manager", "admin"].includes(user.role);
};

export const canCancelTicket = (user: User | null, ticketCreatorId: string): boolean => {
  if (!user) return false;
  
  // Users can cancel only their own tickets
  // Admins, team leaders, and managers can cancel any ticket
  return user.id === ticketCreatorId || 
         ["admin", "team_leader", "manager"].includes(user.role);
};
