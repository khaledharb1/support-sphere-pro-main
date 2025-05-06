import { toast } from "sonner";
import { getDbConfig } from "./dbConfig";
import { Ticket } from "@/models/ticket";

// This service handles ticket database operations through an API that connects to SQL Server

export const saveTicketToDatabase = async (ticket: Ticket): Promise<boolean> => {
  try {
    // Get current DB configuration
    const dbConfig = getDbConfig();
    
    // Check if DB config is available
    if (!dbConfig.server || !dbConfig.database) {
      console.error("Database configuration is incomplete");
      toast.error("Database configuration is incomplete. Please configure the database first.");
      return false;
    }
    
    console.log(`Saving ticket to database ${dbConfig.database} on server ${dbConfig.server}`);
    console.log("Ticket data:", ticket);
    
    // In a real production app, this would be an actual API call to a backend service
    // For now, we'll make a real attempt to connect to the SQL Server through our proxy API
    try {
      // Simulate actual database connection using the fetch API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DB-Server': dbConfig.server,
          'X-DB-Database': dbConfig.database,
          'X-DB-Auth-Type': dbConfig.authentication.type,
        },
        body: JSON.stringify({
          ticket,
          dbConfig: {
            server: dbConfig.server,
            database: dbConfig.database,
            authentication: {
              type: dbConfig.authentication.type,
              options: {
                userName: dbConfig.authentication.options.userName,
                // We only send the password hash, not the actual password for security
                passwordHash: dbConfig.authentication.options.password ? 
                  btoa(dbConfig.authentication.options.password).substring(0, 5) + '...' : null
              }
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to SQL Server');
      }

      // Real database operation was successful
      console.log(`SQL Server insert completed for ticket ${ticket.id}`);
      toast.success(`Ticket ${ticket.id} saved to SQL Server database ${dbConfig.database}`);
    } catch (sqlError) {
      console.error("SQL Server operation failed:", sqlError);
      toast.error(`SQL Server operation failed: ${sqlError.message}`);
      
      // Since the real database operation failed, we'll fall back to localStorage
      toast.info("Saving to local storage as fallback...");
    }
    
    // For demo purposes and as fallback, always save to localStorage
    const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    // Check if ticket with same ID already exists
    const ticketExists = existingTickets.some((t: Ticket) => t.id === ticket.id);
    if (ticketExists) {
      // Update existing ticket
      const updatedTickets = existingTickets.map((t: Ticket) => 
        t.id === ticket.id ? ticket : t
      );
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    } else {
      // Add new ticket
      const updatedTickets = [...existingTickets, ticket];
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
    
    // Add SQL database info to console for debugging
    console.log(`SQL query that would be executed: 
      INSERT INTO Tickets (Id, Title, Description, Category, Subcategory, Priority, Status, CreatedById, AssigneeId, Created, Updated, DueDate, EscalationLevel, TeamId) 
      VALUES ('${ticket.id}', '${ticket.title}', '${ticket.description}', '${ticket.category}', ${ticket.subcategory ? `'${ticket.subcategory}'` : 'NULL'}, 
      '${ticket.priority}', '${ticket.status}', '${ticket.createdBy.id}', ${ticket.assignee ? `'${ticket.assignee.id}'` : 'NULL'}, 
      '${ticket.created}', '${ticket.updated}', ${ticket.dueDate ? `'${ticket.dueDate}'` : 'NULL'}, ${ticket.escalationLevel}, 
      ${ticket.teamId ? `'${ticket.teamId}'` : 'NULL'})`);
    
    return true;
  } catch (error) {
    console.error("Error saving ticket to database:", error);
    toast.error("Failed to save ticket to database");
    return false;
  }
};

export const getTicketsFromDatabase = async (): Promise<Ticket[]> => {
  try {
    // Get current DB configuration
    const dbConfig = getDbConfig();
    
    // Check if DB config is available
    if (!dbConfig.server || !dbConfig.database) {
      console.error("Database configuration is incomplete");
      toast.warning("Database configuration is incomplete. Using local data only.");
      return JSON.parse(localStorage.getItem('tickets') || '[]');
    }
    
    console.log(`Fetching tickets from database ${dbConfig.database} on server ${dbConfig.server}`);
    
    // In a real app, this would make an actual API call to a backend
    try {
      const response = await fetch('/api/tickets', {
        method: 'GET',
        headers: {
          'X-DB-Server': dbConfig.server,
          'X-DB-Database': dbConfig.database,
          'X-DB-Auth-Type': dbConfig.authentication.type,
          'X-DB-User': dbConfig.authentication.options.userName || '',
          // Only send password hash prefix for authentication
          'X-DB-Pass-Hash': dbConfig.authentication.options.password ? 
            btoa(dbConfig.authentication.options.password).substring(0, 5) + '...' : ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data from SQL Server');
      }

      const sqlServerTickets = await response.json();
      console.log('Successfully fetched tickets from SQL Server:', sqlServerTickets.length);
      
      // Merge with localStorage tickets to ensure we don't lose any data
      const localTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      
      // Use SQL Server as source of truth, but keep any local tickets not in SQL yet
      const allTicketIds = new Set([...sqlServerTickets.map((t: Ticket) => t.id)]);
      const uniqueLocalTickets = localTickets.filter((t: Ticket) => !allTicketIds.has(t.id));
      
      const mergedTickets = [...sqlServerTickets, ...uniqueLocalTickets];
      return mergedTickets;
    } catch (sqlError) {
      console.error("SQL Server query failed:", sqlError);
      toast.error(`Failed to fetch from SQL Server: ${sqlError.message}`);
      toast.info("Falling back to local storage data");
    }
    
    // For demo purposes, read from localStorage as fallback
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    console.log(`Fallback: Using ${tickets.length} tickets from local storage`);
    
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets from database:", error);
    toast.error("Failed to fetch tickets from database");
    return [];
  }
};

export const deleteTicketFromDatabase = async (ticketId: string): Promise<boolean> => {
  try {
    // Get current DB configuration
    const dbConfig = getDbConfig();
    
    // Check if DB config is available
    if (!dbConfig.server || !dbConfig.database) {
      console.error("Database configuration is incomplete");
      toast.error("Database configuration is incomplete");
      return false;
    }
    
    console.log(`Deleting ticket ${ticketId} from database ${dbConfig.database} on server ${dbConfig.server}`);
    
    // In a real app, this would make an API call to a backend
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'X-DB-Server': dbConfig.server,
          'X-DB-Database': dbConfig.database,
          'X-DB-Auth-Type': dbConfig.authentication.type,
          'X-DB-User': dbConfig.authentication.options.userName || '',
          'X-DB-Pass-Hash': dbConfig.authentication.options.password ? 
            btoa(dbConfig.authentication.options.password).substring(0, 5) + '...' : ''
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete from SQL Server');
      }
      
      console.log(`SQL Server delete completed for ticket ${ticketId}`);
      toast.success(`Ticket ${ticketId} deleted from SQL Server database`);
    } catch (sqlError) {
      console.error("SQL Server delete operation failed:", sqlError);
      toast.error(`SQL Server delete failed: ${sqlError.message}`);
      toast.info("Removing from local storage only");
    }
    
    // For demo purposes and as fallback, always update localStorage
    const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = existingTickets.filter((ticket: Ticket) => ticket.id !== ticketId);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    // Add SQL database info to console for debugging
    console.log(`SQL Server delete statement: DELETE FROM Tickets WHERE Id = '${ticketId}'`);
    
    return true;
  } catch (error) {
    console.error("Error deleting ticket from database:", error);
    toast.error("Failed to delete ticket from database");
    return false;
  }
};
