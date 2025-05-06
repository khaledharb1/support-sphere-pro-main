
import { Ticket } from "@/models/ticket";
import { toast } from "sonner";
import { createNotification } from "../notificationService";

// Calculate time until SLA breach
export const getTimeUntilSLABreach = (ticket: Ticket): number => {
  if (!ticket.dueDate) return Infinity;
  
  const now = new Date();
  const dueDate = new Date(ticket.dueDate);
  return dueDate.getTime() - now.getTime();
};

// Get SLA status as a formatted string
export const getSLAStatusText = (timeUntilBreach: number): string => {
  if (timeUntilBreach <= 0) {
    return "Breached";
  }
  
  // Convert milliseconds to hours
  const hoursLeft = Math.floor(timeUntilBreach / (1000 * 60 * 60));
  
  if (hoursLeft < 1) {
    // Convert to minutes if less than 1 hour
    const minutesLeft = Math.floor(timeUntilBreach / (1000 * 60));
    return `Critical: ${minutesLeft}m left`;
  } else if (hoursLeft < 4) {
    return `At Risk: ${hoursLeft}h left`;
  } else {
    return `Healthy: ${hoursLeft}h left`;
  }
};

// Get color class based on SLA status
export const getSLAColorClass = (timeUntilBreach: number): string => {
  if (timeUntilBreach <= 0) {
    return "bg-red-600 text-white"; // Breached
  } else if (timeUntilBreach <= 4 * 60 * 60 * 1000) { // 4 hours
    return "bg-orange-400 text-white"; // At risk
  } else {
    return "bg-green-500 text-white"; // Healthy
  }
};

// Monitor SLA for all tickets and send alerts when approaching breach
export const monitorSLABreaches = (tickets: Ticket[], currentUser: any): void => {
  if (!currentUser || currentUser.role === "user") return;
  
  tickets.forEach(ticket => {
    if (ticket.status === "resolved" || ticket.status === "closed") return;
    
    const timeUntilBreach = getTimeUntilSLABreach(ticket);
    
    // Alert for tickets with less than 1 hour to SLA breach
    if (timeUntilBreach > 0 && timeUntilBreach <= 60 * 60 * 1000) {
      const minutesLeft = Math.floor(timeUntilBreach / (1000 * 60));
      
      // Only alert managers and team leaders
      if (["manager", "team_leader", "admin"].includes(currentUser.role)) {
        // Create notification
        createNotification({
          title: "SLA Alert",
          message: `Ticket #${ticket.id} has ${minutesLeft} minutes until SLA breach`,
          type: "warning",
          userId: currentUser.id,
          link: `/tickets/${ticket.id}`,
          category: "escalation"
        }, currentUser);
        
        // Show toast for urgent attention
        toast.warning(`SLA Alert: Ticket #${ticket.id}`, {
          description: `${minutesLeft} minutes until SLA breach`
        });
      }
    }
  });
};

// Calculate SLA compliance percentage for reporting
export const calculateSLAComplianceRate = (tickets: Ticket[]): number => {
  if (tickets.length === 0) return 100;
  
  const resolvedTickets = tickets.filter(t => 
    t.status === "resolved" || t.status === "closed"
  );
  
  if (resolvedTickets.length === 0) return 100;
  
  const compliantTickets = resolvedTickets.filter(ticket => {
    if (!ticket.dueDate) return true;
    
    const resolvedDate = new Date(ticket.updated);
    const dueDate = new Date(ticket.dueDate);
    
    return resolvedDate <= dueDate;
  });
  
  return (compliantTickets.length / resolvedTickets.length) * 100;
};
