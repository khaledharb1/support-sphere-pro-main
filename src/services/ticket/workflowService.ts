
import { Ticket, TicketStatus } from "@/models/ticket";
import { User, UserRole } from "@/models/user";
import { createNotification } from "../notificationService";
import { getWorkflowStages, getEmailNotificationSettings } from "../customizationService";
import { toast } from "sonner";

// Update ticket status
export const updateTicketStatus = (
  ticket: Ticket,
  newStatus: TicketStatus,
  currentUser: User | null
): Ticket => {
  // Check if user has permission to update status
  if (!canUpdateTicketStatus(currentUser?.role as UserRole, ticket.status, newStatus)) {
    throw new Error("You don't have permission to update this ticket's status");
  }
  
  // Create updated ticket object
  const updatedTicket: Ticket = {
    ...ticket,
    status: newStatus,
    updated: new Date().toISOString()
  };
  
  // Send notifications based on status change
  sendStatusChangeNotifications(ticket, updatedTicket, currentUser);
  
  return updatedTicket;
};

// Check if a user with given role can update a ticket from one status to another
export const canUpdateTicketStatus = (
  userRole: UserRole, 
  currentStatus: TicketStatus, 
  newStatus: TicketStatus
): boolean => {
  // Admin can change any status
  if (userRole === "admin") {
    return true;
  }
  
  // Manager can change any status except admin-reserved ones
  if (userRole === "manager") {
    return true;
  }
  
  // Team leaders have limited permissions
  if (userRole === "team_leader") {
    // Team leaders cannot close tickets that are not resolved
    if (newStatus === "closed" && currentStatus !== "resolved") {
      return false;
    }
    return true;
  }
  
  // Agents have more limited permissions
  if (userRole === "agent") {
    // Agents can change open to in-progress, in-progress to resolved
    // But cannot close tickets or re-open closed tickets
    if (currentStatus === "open" && newStatus === "in-progress") {
      return true;
    }
    if (currentStatus === "in-progress" && newStatus === "resolved") {
      return true;
    }
    if (currentStatus === "resolved" && newStatus === "closed") {
      return false; // Agents cannot close tickets
    }
    if (currentStatus === "closed") {
      return false; // Agents cannot re-open closed tickets
    }
    return false;
  }
  
  // Regular users cannot change ticket status
  return false;
};

// Send notifications on ticket status change
export const sendStatusChangeNotifications = (
  oldTicket: Ticket,
  newTicket: Ticket,
  currentUser: User | null
): void => {
  if (!currentUser) return;
  
  const notificationSettings = getEmailNotificationSettings();
  
  // Determine what changed
  const statusChanged = oldTicket.status !== newTicket.status;
  const assigneeChanged = 
    oldTicket.assignee?.id !== newTicket.assignee?.id && 
    newTicket.assignee?.id; // Ensure new assignee exists

  // Get workflow stages for better status names
  const workflowStages = getWorkflowStages();
  const statusName = workflowStages.find(stage => stage.id === newTicket.status)?.name || newTicket.status;
  
  // Notify ticket creator about status change
  if (statusChanged && notificationSettings.onTicketUpdate) {
    // Mock user for creator with proper UserRole type
    const mockCreatorUser: User = {
      id: newTicket.createdBy.id,
      name: newTicket.createdBy.name,
      email: newTicket.createdBy.email || "user@example.com",
      role: (newTicket.createdBy.role as UserRole) || "user"
    };

    createNotification({
      title: "Ticket Status Updated",
      message: `Your ticket #${newTicket.id} has been updated to: ${statusName}`,
      type: "info",
      userId: newTicket.createdBy.id,
      link: `/tickets/${newTicket.id}`
    }, mockCreatorUser);
    
    // Simulate email notification
    console.log(`📧 Email sent to ${mockCreatorUser.email}: Ticket #${newTicket.id} status update to ${statusName}`);
    
    // Only show toast for non-user roles
    if (currentUser.role !== "user") {
      toast.success(`Status notification sent to requester`, {
        description: `Ticket #${newTicket.id} updated to ${statusName}`
      });
    }
  }

  // Notify new assignee
  if (assigneeChanged && newTicket.assignee && notificationSettings.onTicketAssignment) {
    // Mock user for assignee with proper UserRole type
    const mockAssigneeUser: User = {
      id: newTicket.assignee.id,
      name: newTicket.assignee.name,
      email: "assignee@example.com", // Mock email
      role: (newTicket.assignee.role as UserRole) || "agent"
    };

    createNotification({
      title: "New Ticket Assigned",
      message: `Ticket #${newTicket.id} has been assigned to you: "${newTicket.title}"`,
      type: "info",
      userId: newTicket.assignee.id,
      link: `/tickets/${newTicket.id}`
    }, mockAssigneeUser);
    
    // Simulate email notification
    console.log(`📧 Email sent to ${mockAssigneeUser.email}: New ticket #${newTicket.id} assigned`);
  }
  
  // Special notification for resolved tickets
  if (statusChanged && newTicket.status === "resolved" && notificationSettings.onTicketResolution) {
    // Notify managers and team leaders about resolution, but not for users
    if (currentUser.role !== "user" && 
        (currentUser.role === "manager" || currentUser.role === "team_leader" || currentUser.role === "admin")) {
      // Create management notification
      createNotification({
        title: "Ticket Resolved",
        message: `Ticket #${newTicket.id} has been marked as resolved by ${currentUser.name}`,
        type: "success",
        userId: currentUser.id,
        link: `/tickets/${newTicket.id}`
      }, currentUser);
      
      // Simulate email notification to management
      console.log(`📧 Email sent to management: Ticket #${newTicket.id} resolved`);
    }
  }
};

// Get available actions for a ticket based on its current status and user role
export const getAvailableActions = (ticket: Ticket, userRole: string): string[] => {
  const actions: string[] = [];
  
  switch (ticket.status) {
    case "open":
      actions.push("assign", "start_work");
      if (["admin", "manager", "team_leader"].includes(userRole)) {
        actions.push("escalate", "close");
      }
      break;
    case "in-progress":
      actions.push("resolve");
      if (["admin", "manager", "team_leader"].includes(userRole)) {
        actions.push("reassign", "escalate");
      }
      break;
    case "resolved":
      actions.push("close", "reopen");
      break;
    case "closed":
      if (["admin", "manager", "team_leader"].includes(userRole)) {
        actions.push("reopen");
      }
      break;
  }
  
  return actions;
};

// Generate a suitable next status based on action
export const getNextStatusFromAction = (action: string): TicketStatus | null => {
  switch (action) {
    case "start_work":
      return "in-progress";
    case "resolve":
      return "resolved";
    case "close":
      return "closed";
    case "reopen":
      return "open";
    default:
      return null;
  }
};

// Get color for status badges
export const getStatusColor = (status: TicketStatus): string => {
  const workflowStages = getWorkflowStages();
  const stage = workflowStages.find(s => s.id === status);
  
  if (stage?.color) {
    return `bg-${stage.color}-100 text-${stage.color}-800`;
  }
  
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Check if user is allowed to see workflow details
export const canViewWorkflowDetails = (userRole: string): boolean => {
  // Now team_leader and manager can also view workflow details
  return ["admin", "team_leader", "manager"].includes(userRole);
};
