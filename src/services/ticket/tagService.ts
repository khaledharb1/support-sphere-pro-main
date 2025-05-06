
import { Ticket } from "@/models/ticket";
import { toast } from "sonner";

export const addTagToTicket = (ticket: Ticket, tagName: string): Ticket => {
  if (!ticket) return ticket;
  
  // Normalize tag name (lowercase, trim)
  const normalizedTag = tagName.toLowerCase().trim();
  
  // Don't add empty tags or duplicates
  if (!normalizedTag || (ticket.tags && ticket.tags.includes(normalizedTag))) {
    return ticket;
  }
  
  // Create a new ticket object with the tag added
  const updatedTicket: Ticket = {
    ...ticket,
    tags: [...(ticket.tags || []), normalizedTag],
    updated: new Date().toISOString()
  };
  
  return updatedTicket;
};

export const removeTagFromTicket = (ticket: Ticket, tagToRemove: string): Ticket => {
  if (!ticket || !ticket.tags) return ticket;
  
  // Create a new ticket object with the tag removed
  const updatedTicket: Ticket = {
    ...ticket,
    tags: ticket.tags.filter(tag => tag !== tagToRemove),
    updated: new Date().toISOString()
  };
  
  return updatedTicket;
};

// Save tags to local storage
export const saveTicketTags = (ticket: Ticket): void => {
  if (!ticket) return;
  
  const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const updatedTickets = storedTickets.map((t: Ticket) => 
    t.id === ticket.id ? ticket : t
  );
  
  localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  toast.success("Tags updated");
};
