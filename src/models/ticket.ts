
// Include all existing imports and type definitions

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

// Define the ticket creator type to ensure role is included
export interface TicketCreator {
  id: string;
  name: string;
  email: string;
  teamId?: string;
  empCode?: string;
  company?: string;
  role?: string; // Adding role property
}

// Interface for linked tickets - Updated to include "duplicate"
export interface LinkedTicket {
  id: string;
  title: string;
  relationship: "related" | "parent" | "child" | "duplicate";
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string; // Added subcategory as optional field
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: TicketCreator;
  assignee?: {
    id: string;
    name: string;
    role?: string;
  };
  created: string;
  updated: string;
  dueDate?: string;
  escalationLevel: 0 | 1 | 2;
  teamId?: string;
  tags?: string[];
  attachments?: {
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  linkedTickets?: LinkedTicket[];
}

export interface TicketEscalation {
  ticketId: string;
  level: 1 | 2;
  timestamp: string;
  reason: string;
  escalatedTo: {
    id: string;
    name: string;
    role: string;
  };
}

export const getTimeUntilSLABreach = (ticket: Ticket): number => {
  if (!ticket.dueDate) return Infinity;
  
  const now = new Date();
  const dueDate = new Date(ticket.dueDate);
  return dueDate.getTime() - now.getTime();
};

export const shouldEscalate = (ticket: Ticket): boolean => {
  // If already at max escalation level or resolved/closed, don't escalate
  if (ticket.escalationLevel >= 2 || ticket.status === 'resolved' || ticket.status === 'closed') {
    return false;
  }
  
  // Check if SLA breached
  const timeUntilBreach = getTimeUntilSLABreach(ticket);
  return timeUntilBreach <= 0;
};
