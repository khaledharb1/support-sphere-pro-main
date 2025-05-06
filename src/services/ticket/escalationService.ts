import { Ticket, TicketEscalation } from "@/models/ticket";
import { User } from "@/models/user";
import { getTeamLeader, getAllManagers } from "../teamService";
import { toast } from "sonner";
import { createNotification } from "../notificationService";

// Check if ticket needs escalation based on SLA or creation date
export const checkTicketEscalation = async (ticket: Ticket): Promise<TicketEscalation | null> => {
  // If ticket is already resolved/closed or at max escalation level, no need to escalate
  if (
    ticket.status === "resolved" || 
    ticket.status === "closed" || 
    ticket.escalationLevel >= 2
  ) {
    return null;
  }

  const now = new Date();
  
  // Check if due date is breached (SLA breach)
  if (ticket.dueDate) {
    const dueDate = new Date(ticket.dueDate);
    
    if (now > dueDate) {
      if (ticket.escalationLevel === 0) {
        // Escalate to team leader
        try {
          const teamLeader = await getTeamLeader(ticket.teamId || "");
          
          if (teamLeader) {
            return {
              ticketId: ticket.id,
              level: 1,
              timestamp: new Date().toISOString(),
              reason: "SLA breach",
              escalatedTo: {
                id: teamLeader.id,
                name: teamLeader.name,
                role: teamLeader.role
              }
            };
          }
        } catch (error) {
          console.error("Error fetching team leader for escalation:", error);
        }
      } 
      else if (
        ticket.escalationLevel === 1 && 
        now > new Date(dueDate.getTime() + 24 * 60 * 60 * 1000)
      ) {
        try {
          const managers = await getAllManagers();
          
          if (managers.length > 0) {
            const manager = managers[0];
            
            return {
              ticketId: ticket.id,
              level: 2,
              timestamp: new Date().toISOString(),
              reason: "Continued SLA breach after Team Leader escalation",
              escalatedTo: {
                id: manager.id,
                name: manager.name,
                role: manager.role
              }
            };
          }
        } catch (error) {
          console.error("Error fetching managers for escalation:", error);
        }
      }
    }
  }
  
  // Check if 3 days have passed without status change for first escalation
  const createdDate = new Date(ticket.created);
  const threeDaysLater = new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  if (now > threeDaysLater && ticket.status === "open" && ticket.escalationLevel === 0) {
    try {
      const teamLeader = await getTeamLeader(ticket.teamId || "");
      
      if (teamLeader) {
        return {
          ticketId: ticket.id,
          level: 1,
          timestamp: new Date().toISOString(),
          reason: "No status change for 3 days",
          escalatedTo: {
            id: teamLeader.id,
            name: teamLeader.name,
            role: teamLeader.role
          }
        };
      }
    } catch (error) {
      console.error("Error fetching team leader for escalation:", error);
    }
  } 

  // Check if 3 more days have passed after first escalation (total 6 days)
  if (ticket.escalationLevel === 1) {
    // Find when the ticket was first escalated
    const escalationDate = new Date(ticket.updated); // Assuming updated timestamp reflects escalation time
    const threeDaysAfterEscalation = new Date(escalationDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    if (now > threeDaysAfterEscalation && (ticket.status === "open" || ticket.status === "in-progress")) {
      try {
        const managers = await getAllManagers();
        
        if (managers.length > 0) {
          const manager = managers[0];
          
          return {
            ticketId: ticket.id,
            level: 2,
            timestamp: new Date().toISOString(),
            reason: "No resolution 3 days after Team Leader escalation",
            escalatedTo: {
              id: manager.id,
              name: manager.name,
              role: manager.role
            }
          };
        }
      } catch (error) {
        console.error("Error fetching managers for escalation:", error);
      }
    }
  }
  
  return null;
};

// Perform ticket escalation
export const escalateTicket = async (
  ticket: Ticket,
  reason: string,
  level: 1 | 2,
  currentUser: User | null
): Promise<{
  updatedTicket: Ticket;
  escalation: TicketEscalation;
}> => {
  let escalatedTo;
  
  if (level === 1) {
    // Escalate to team leader
    const teamLeader = await getTeamLeader(ticket.teamId || "");
    if (!teamLeader) {
      throw new Error("No team leader found for escalation");
    }
    escalatedTo = {
      id: teamLeader.id,
      name: teamLeader.name,
      role: teamLeader.role
    };

    // Create notification for team leader
    const mockTeamLeaderUser: User = {
      id: teamLeader.id,
      name: teamLeader.name,
      email: "teamleader@example.com",
      role: "team_leader",
      teamId: ticket.teamId
    };

    createNotification({
      title: "Ticket Escalated",
      message: `Ticket #${ticket.id} has been escalated to you: ${reason}`,
      type: "warning",
      userId: teamLeader.id,
      link: `/tickets/${ticket.id}`,
      category: "escalation" // Add category to filter out for regular users
    }, mockTeamLeaderUser);

  } else {
    // Escalate to manager
    const managers = await getAllManagers();
    if (managers.length === 0) {
      throw new Error("No managers found for escalation");
    }
    const manager = managers[0];
    escalatedTo = {
      id: manager.id,
      name: manager.name,
      role: manager.role
    };

    // Create notification for manager
    const mockManagerUser: User = {
      id: manager.id,
      name: manager.name,
      email: "manager@example.com",
      role: "manager"
    };

    createNotification({
      title: "Ticket Escalated to Management",
      message: `Ticket #${ticket.id} has been escalated to management level: ${reason}`,
      type: "error",
      userId: manager.id,
      link: `/tickets/${ticket.id}`,
      category: "escalation" // Add category to filter out for regular users
    }, mockManagerUser);
  }
  
  const updatedTicket: Ticket = {
    ...ticket,
    escalationLevel: level,
    updated: new Date().toISOString()
  };
  
  const escalation: TicketEscalation = {
    ticketId: ticket.id,
    level,
    timestamp: new Date().toISOString(),
    reason,
    escalatedTo
  };
  
  // Only show escalation toast to non-user roles
  if (currentUser && currentUser.role !== "user") {
    toast.warning(
      `Ticket ${ticket.id} escalated to ${level === 1 ? "Team Leader" : "Manager"}`, 
      { 
        duration: 5000,
        description: reason
      }
    );
  }

  // If ticket creator is a user, send a generic update notification instead of an escalation notification
  if (ticket.createdBy && ticket.createdBy.id) {
    // Mock user for creator
    const mockCreatorUser: User = {
      id: ticket.createdBy.id,
      name: ticket.createdBy.name,
      email: ticket.createdBy.email || "user@example.com",
      role: "user"
    };

    // Send different notifications based on user role
    if (mockCreatorUser.role === "user") {
      createNotification({
        title: "Your Ticket Has Been Updated",
        message: `Your ticket #${ticket.id} is being processed by our support team`,
        type: "info",
        userId: ticket.createdBy.id,
        link: `/tickets/${ticket.id}`
      }, mockCreatorUser);
    } else {
      createNotification({
        title: "Your Ticket Has Been Escalated",
        message: `Your ticket #${ticket.id} has been escalated to a ${level === 1 ? "Team Leader" : "Manager"} for resolution`,
        type: "info",
        userId: ticket.createdBy.id,
        link: `/tickets/${ticket.id}`,
        category: "escalation"
      }, mockCreatorUser);
    }
  }
  
  return {
    updatedTicket,
    escalation
  };
};
