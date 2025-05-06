
import { Ticket } from "@/models/ticket";
import { toast } from "sonner";

interface LinkedTicket {
  id: string;
  title: string;
  relationship: "related" | "parent" | "child" | "duplicate";
}

// Add a linked ticket to a ticket
export const linkTickets = (
  sourceTicket: Ticket, 
  targetTicketId: string, 
  relationship: "related" | "parent" | "child" | "duplicate"
): Ticket => {
  if (!sourceTicket) return sourceTicket;
  
  // Get the target ticket info
  const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const targetTicket = storedTickets.find((t: Ticket) => t.id === targetTicketId);
  
  if (!targetTicket) {
    toast.error(`Request ${targetTicketId} not found`);
    return sourceTicket;
  }
  
  // Create the linked ticket info
  const linkedTicket: LinkedTicket = {
    id: targetTicketId,
    title: targetTicket.title,
    relationship
  };
  
  // Create a new ticket object with the linked ticket added
  const updatedSourceTicket: any = {
    ...sourceTicket,
    linkedTickets: [...(sourceTicket.linkedTickets || []), linkedTicket],
    updated: new Date().toISOString()
  };
  
  // Update in local storage
  const updatedTickets = storedTickets.map((t: Ticket) => 
    t.id === sourceTicket.id ? updatedSourceTicket : t
  );
  localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  
  // Also update the reverse relationship in the target ticket
  const reverseRelationship = getReverseRelationship(relationship);
  if (reverseRelationship) {
    const sourceLinkedTicket: LinkedTicket = {
      id: sourceTicket.id,
      title: sourceTicket.title,
      relationship: reverseRelationship
    };
    
    const updatedTargetTicket: any = {
      ...targetTicket,
      linkedTickets: [...(targetTicket.linkedTickets || []), sourceLinkedTicket],
      updated: new Date().toISOString()
    };
    
    const finalTickets = updatedTickets.map((t: Ticket) => 
      t.id === targetTicketId ? updatedTargetTicket : t
    );
    localStorage.setItem('tickets', JSON.stringify(finalTickets));
  }
  
  toast.success(`Linked request ${targetTicketId} as ${relationship}`);
  return updatedSourceTicket;
};

// Remove a linked ticket from a ticket
export const unlinkTicket = (sourceTicket: any, targetTicketId: string): any => {
  if (!sourceTicket || !sourceTicket.linkedTickets) return sourceTicket;
  
  // Create a new ticket object with the linked ticket removed
  const updatedSourceTicket = {
    ...sourceTicket,
    linkedTickets: sourceTicket.linkedTickets.filter((lt: LinkedTicket) => lt.id !== targetTicketId),
    updated: new Date().toISOString()
  };
  
  // Update in local storage
  const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  
  // Remove the link from source ticket
  let updatedTickets = storedTickets.map((t: Ticket) => 
    t.id === sourceTicket.id ? updatedSourceTicket : t
  );
  
  // Also remove the reverse link from target ticket
  const targetTicket = storedTickets.find((t: Ticket) => t.id === targetTicketId);
  if (targetTicket && targetTicket.linkedTickets) {
    const updatedTargetTicket = {
      ...targetTicket,
      linkedTickets: targetTicket.linkedTickets.filter((lt: LinkedTicket) => lt.id !== sourceTicket.id),
      updated: new Date().toISOString()
    };
    
    updatedTickets = updatedTickets.map((t: Ticket) => 
      t.id === targetTicketId ? updatedTargetTicket : t
    );
  }
  
  localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  toast.success(`Unlinked request ${targetTicketId}`);
  return updatedSourceTicket;
};

// Get all linkable tickets (excluding the current ticket)
export const getLinkableTickets = (currentTicketId: string): Ticket[] => {
  const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  return storedTickets.filter((t: Ticket) => t.id !== currentTicketId);
};

// Helper function to get the reverse relationship type
const getReverseRelationship = (relationship: string): "related" | "parent" | "child" | "duplicate" | null => {
  switch (relationship) {
    case "related":
      return "related";
    case "parent":
      return "child";
    case "child":
      return "parent";
    case "duplicate":
      return "duplicate";
    default:
      return null;
  }
};
