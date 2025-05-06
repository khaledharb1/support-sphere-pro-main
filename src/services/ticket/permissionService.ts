
import { Ticket } from "@/models/ticket";
import { User } from "@/models/user";

// Check if user can view this ticket based on role
export const canUserViewTicket = (
  userId: string | undefined,
  userRole: string | undefined,
  userTeamId: string | undefined,
  ticket: Ticket
): boolean => {
  if (!userId || !userRole) return false;
  
  switch (userRole) {
    case "admin":
    case "manager":
      // Admins and managers can view all tickets
      return true;
    case "team_leader":
      // Team leaders can view tickets from their team
      return ticket.teamId === userTeamId;
    case "agent":
      // Agents can only view tickets assigned to them
      return ticket.assignee?.id === userId;
    case "user":
      // Regular users can only view their own tickets
      return ticket.createdBy.id === userId;
    default:
      return false;
  }
};

// Check if a user can access a ticket based on their permissions
export const canAccessTicket = (user: User | null, ticket: Ticket): boolean => {
  if (!user) return false;
  
  // Admins and managers can access all tickets
  if (user.role === 'admin' || user.role === 'manager') {
    return true;
  }
  
  // Team leaders can access tickets from their team
  if (user.role === 'team_leader' && user.teamId === ticket.teamId) {
    return true;
  }
  
  // Agents can only access tickets assigned to them
  if (user.role === 'agent' && ticket.assignee?.id === user.id) {
    return true;
  }
  
  // Users can only access tickets they created
  if (user.role === 'user' && ticket.createdBy.id === user.id) {
    return true;
  }
  
  return false;
};
