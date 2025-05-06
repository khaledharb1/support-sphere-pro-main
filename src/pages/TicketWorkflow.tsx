
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/models/ticket";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { updateTicketStatus, getStatusColor } from "@/services/ticket/workflowService";

const TicketWorkflow: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirect if user doesn't have access
  useEffect(() => {
    if (user && !["admin", "team_leader", "manager", "agent"].includes(user.role)) {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchTickets = () => {
      setIsLoading(true);
      // Get tickets from localStorage (both demo and user created)
      const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
      const demoTickets = [
        // Using the same demo tickets as in TicketList.tsx
        {
          id: "TKT-1234",
          title: "Unable to access email account",
          description: "I'm having trouble logging into my email account. It says 'Account locked'.",
          category: "Technical",
          priority: "high",
          status: "open",
          createdBy: {
            id: "user-1",
            name: "Sarah Johnson",
            email: "sarah@example.com",
            teamId: "team-1"
          },
          assignee: {
            id: "agent-1",
            name: "Jane Smith",
            role: "agent"
          },
          created: "2023-04-20",
          updated: "2023-04-21",
          dueDate: "2023-04-22",
          escalationLevel: 0,
          teamId: "team-1",
          tags: ["email", "access"]
        },
        {
          id: "TKT-1233",
          title: "Billing inquiry for last month",
          description: "I have a question about my bill from last month.",
          category: "Billing",
          priority: "medium",
          status: "in-progress",
          createdBy: {
            id: "user-2",
            name: "John Doe",
            email: "john@example.com",
            teamId: "team-1"
          },
          assignee: {
            id: "agent-2",
            name: "John Doe",
            role: "agent"
          },
          created: "2023-04-19",
          updated: "2023-04-21",
          dueDate: "2023-04-23",
          escalationLevel: 0,
          teamId: "team-1",
          tags: ["billing", "invoice"]
        },
        {
          id: "TKT-1232",
          title: "Password reset request",
          description: "I need to reset my password but I'm not receiving the email.",
          category: "Account",
          priority: "low",
          status: "resolved",
          createdBy: {
            id: "user-3",
            name: "Mike Brown",
            email: "mike@example.com",
            teamId: "team-2"
          },
          assignee: {
            id: "agent-1",
            name: "Jane Smith",
            role: "agent"
          },
          created: "2023-04-18",
          updated: "2023-04-19",
          dueDate: "2023-04-25",
          escalationLevel: 0,
          teamId: "team-2",
          tags: ["password", "reset"]
        },
        {
          id: "TKT-1229",
          title: "Refund request for subscription",
          description: "I'd like to request a refund for my subscription.",
          category: "Billing",
          priority: "urgent",
          status: "closed",
          createdBy: {
            id: "user-6",
            name: "Emma Wilson",
            email: "emma@example.com",
            teamId: "team-3"
          },
          assignee: {
            id: "agent-1",
            name: "Jane Smith",
            role: "agent"
          },
          created: "2023-04-16",
          updated: "2023-04-17",
          dueDate: "2023-04-17",
          escalationLevel: 2,
          teamId: "team-3",
          tags: ["refund", "subscription"]
        },
      ];
      
      const allTickets = [...demoTickets, ...storedTickets];
      
      // Filter tickets by role
      let filteredTickets: Ticket[] = [];
      if (user) {
        switch (user.role) {
          case "admin":
          case "manager":
            filteredTickets = allTickets; // See all tickets
            break;
          case "team_leader":
            filteredTickets = allTickets.filter(ticket => ticket.teamId === user.teamId);
            break;
          case "agent":
            filteredTickets = allTickets.filter(ticket => 
              ticket.assignee?.id === user.id || ticket.teamId === user.teamId
            );
            break;
          default:
            filteredTickets = [];
        }
      }
      
      setTickets(filteredTickets);
      setIsLoading(false);
    };

    if (user) {
      fetchTickets();
    }
  }, [user]);

  // Handle drag and drop to update ticket status
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Ticket['status']) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("ticketId");
    
    const ticketToUpdate = tickets.find(t => t.id === ticketId);
    if (ticketToUpdate && ticketToUpdate.status !== newStatus) {
      // Update ticket status
      const updatedTicket = updateTicketStatus(ticketToUpdate, newStatus, user);
      
      // Update local state
      setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
      
      // Update in localStorage
      const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
      const updatedStoredTickets = storedTickets.map((t: Ticket) => 
        t.id === ticketId ? updatedTicket : t
      );
      localStorage.setItem("tickets", JSON.stringify(updatedStoredTickets));
      
      toast.success(`Ticket ${ticketId} moved to ${newStatus.replace('-', ' ')}`);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId);
  };

  // Filter tickets by status
  const openTickets = tickets.filter((ticket) => ticket.status === "open");
  const inProgressTickets = tickets.filter((ticket) => ticket.status === "in-progress");
  const resolvedTickets = tickets.filter((ticket) => ticket.status === "resolved");
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-red-900 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderTicketCard = (ticket: Ticket) => (
    <Card 
      key={ticket.id} 
      className="mb-2 hover:shadow-md transition-shadow cursor-move"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      draggable
      onDragStart={(e) => handleDragStart(e, ticket.id)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{ticket.title}</h3>
            <p className="text-sm text-gray-500">{ticket.id}</p>
          </div>
          <Badge className={getPriorityColor(ticket.priority)}>
            {ticket.priority}
          </Badge>
        </div>
        <div className="mt-2 text-sm">
          <p>Requester: {ticket.createdBy.name}</p>
          <p>Assignee: {ticket.assignee?.name || "Unassigned"}</p>
          {ticket.escalationLevel > 0 && (
            <Badge className="mt-1 bg-orange-100 text-orange-800">
              Escalation Level: {ticket.escalationLevel}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user || !["admin", "team_leader", "manager", "agent"].includes(user.role)) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ticket Workflow</h1>
        <p className="text-sm text-gray-500">(Drag tickets to change status)</p>
      </div>
      
      {isLoading ? (
        <p>Loading ticket workflow...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Open Tickets */}
          <Card 
            className="col-span-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "open")}
          >
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-700">Open</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              {openTickets.length > 0 ? (
                openTickets.map(renderTicketCard)
              ) : (
                <p className="text-center text-gray-500 py-4">No open tickets</p>
              )}
            </CardContent>
          </Card>

          {/* In Progress Tickets */}
          <Card 
            className="col-span-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "in-progress")}
          >
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-700">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              {inProgressTickets.length > 0 ? (
                inProgressTickets.map(renderTicketCard)
              ) : (
                <p className="text-center text-gray-500 py-4">No tickets in progress</p>
              )}
            </CardContent>
          </Card>

          {/* Resolved Tickets */}
          <Card 
            className="col-span-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "resolved")}
          >
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700">Resolved</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              {resolvedTickets.length > 0 ? (
                resolvedTickets.map(renderTicketCard)
              ) : (
                <p className="text-center text-gray-500 py-4">No resolved tickets</p>
              )}
            </CardContent>
          </Card>

          {/* Closed Tickets */}
          <Card 
            className="col-span-1"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "closed")}
          >
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-gray-700">Closed</CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              {closedTickets.length > 0 ? (
                closedTickets.map(renderTicketCard)
              ) : (
                <p className="text-center text-gray-500 py-4">No closed tickets</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workflow Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ticket Workflow Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className="bg-blue-100 text-blue-800">Open</Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Tickets move through these stages as they are processed. If SLAs are breached, tickets may be escalated
            to team leaders (Level 1) or managers (Level 2).
          </p>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Role-based Access:</strong></p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Admin/Manager:</strong> Can see and modify all tickets</li>
              <li><strong>Team Leader:</strong> Can see and modify tickets assigned to their team</li>
              <li><strong>Agent:</strong> Can see and modify tickets assigned to them or their team</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketWorkflow;
