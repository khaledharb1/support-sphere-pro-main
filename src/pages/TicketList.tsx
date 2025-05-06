import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Filter, MoreHorizontal, Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Ticket } from "@/models/ticket";
import { toast } from "sonner";
import { checkTicketEscalation, escalateTicket } from "@/services/ticket/escalationService";
import { canUserViewTicket } from "@/services/ticket/permissionService";
import { getTicketsFromDatabase, deleteTicketFromDatabase } from "@/services/database/ticketDbService";

const ticketData: Ticket[] = [
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
    id: "TKT-1231",
    title: "New feature request",
    description: "I'd like to request a new feature for your product.",
    category: "Product",
    priority: "medium",
    status: "closed",
    createdBy: {
      id: "user-4",
      name: "Lisa Wong",
      email: "lisa@example.com",
      teamId: "team-2"
    },
    assignee: undefined,
    created: "2023-04-17",
    updated: "2023-04-18",
    escalationLevel: 0,
    teamId: "team-2",
    tags: ["feature", "request"]
  },
  {
    id: "TKT-1230",
    title: "Integration with third-party service",
    description: "We need help with integrating your API with our service.",
    category: "Technical",
    priority: "high",
    status: "open",
    createdBy: {
      id: "user-5",
      name: "Tom Harris",
      email: "tom@example.com",
      teamId: "team-3"
    },
    assignee: {
      id: "agent-2",
      name: "John Doe",
      role: "agent"
    },
    created: "2023-04-17",
    updated: "2023-04-17",
    dueDate: "2023-04-18",
    escalationLevel: 1,
    teamId: "team-3",
    tags: ["api", "integration"]
  },
  {
    id: "TKT-1229",
    title: "Refund request for subscription",
    description: "I'd like to request a refund for my subscription.",
    category: "Billing",
    priority: "urgent",
    status: "in-progress",
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
  {
    id: "TKT-1228",
    title: "Data export functionality not working",
    description: "I can't export my data to CSV format.",
    category: "Technical",
    priority: "high",
    status: "open",
    createdBy: {
      id: "3",
      name: "Regular User",
      email: "user@example.com",
      teamId: "team-1"
    },
    assignee: undefined,
    created: "2023-04-15",
    updated: "2023-04-16",
    dueDate: "2023-04-22",
    escalationLevel: 0,
    teamId: "team-1",
    tags: ["data", "export"]
  },
];

const TicketList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [visibleTickets, setVisibleTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // Get tickets from database
        const dbTickets = await getTicketsFromDatabase();
        
        // Combine with sample ticket data
        const allTickets = [...ticketData, ...dbTickets];
        
        let filteredTickets: Ticket[] = [];
        
        switch (user?.role) {
          case "admin":
          case "manager":
            filteredTickets = allTickets;
            break;
          case "team_leader":
            filteredTickets = allTickets.filter(ticket => ticket.teamId === user.teamId);
            break;
          case "agent":
            filteredTickets = allTickets.filter(ticket => ticket.assignee?.id === user.id);
            break;
          case "user":
            filteredTickets = allTickets.filter(ticket => ticket.createdBy.id === user.id);
            break;
          default:
            filteredTickets = [];
        }
        
        setVisibleTickets(filteredTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to fetch tickets from database");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
  }, [user]);

  useEffect(() => {
    if (!visibleTickets.length) return;
    
    const checkEscalations = async () => {
      for (const ticket of visibleTickets) {
        if (ticket.status !== "resolved" && ticket.status !== "closed") {
          const escalation = await checkTicketEscalation(ticket);
          if (escalation) {
            setVisibleTickets(tickets => 
              tickets.map(t => t.id === ticket.id ? 
                {...t, escalationLevel: escalation.level as 0 | 1 | 2} : t
              )
            );
            
            // Only show escalation toasts for non-user roles
            if (user && user.role !== "user") {
              toast.warning(
                `Ticket ${ticket.id} escalated to ${escalation.level === 1 ? "Team Lead" : "Manager"}`,
                {
                  description: escalation.reason,
                  duration: 5000
                }
              );
            }
          }
        }
      }
    };
    
    checkEscalations();
  }, [visibleTickets, user]);

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteTicketFromDatabase(ticketToDelete);
      
      if (success) {
        // Remove ticket from UI
        setVisibleTickets(tickets => tickets.filter(ticket => ticket.id !== ticketToDelete));
        toast.success(`Ticket ${ticketToDelete} deleted successfully`);
        
        // Close the dialog after successful deletion
        setIsDialogOpen(false);
        
        // Navigate to refresh the current page (to avoid stale data)
        // This line is important to fix the issue where the website doesn't update after deletion
        navigate('/tickets', { replace: true });
      } else {
        toast.error(`Failed to delete ticket ${ticketToDelete}`);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('An error occurred while deleting the ticket');
    } finally {
      setIsDeleting(false);
      setTicketToDelete(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
      urgent: "bg-red-900 text-white",
    };
    return (
      <Badge
        className={`${
          colors[priority as keyof typeof colors]
        } hover:${
          colors[priority as keyof typeof colors]
        } capitalize`}
      >
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge
        className={`${
          colors[status as keyof typeof colors]
        } hover:${
          colors[status as keyof typeof colors]
        } capitalize`}
      >
        {status.replace("-", " ")}
      </Badge>
    );
  };

  const getEscalationBadge = (escalationLevel: number, userRole?: string) => {
    // Don't show escalation badges for users with "user" role
    if (escalationLevel === 0 || (user && user.role === "user")) return null;
    
    return (
      <Badge 
        className={
          escalationLevel === 1 
            ? "bg-orange-100 text-orange-800 ml-1" 
            : "bg-red-100 text-red-800 ml-1"
        }
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        {escalationLevel === 1 ? "Team Lead" : "Manager"}
      </Badge>
    );
  };

  const handleAssignToMe = (ticketId: string) => {
    if (!user) return;
    
    setVisibleTickets(tickets => 
      tickets.map(ticket => 
        ticket.id === ticketId 
          ? {
              ...ticket, 
              assignee: {
                id: user.id,
                name: user.name,
                role: user.role
              }
            } 
          : ticket
      )
    );
    
    toast.success(`Ticket ${ticketId} assigned to you`);
    
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedStoredTickets = storedTickets.map((ticket: Ticket) => 
      ticket.id === ticketId 
        ? {
            ...ticket, 
            assignee: {
              id: user.id,
              name: user.name,
              role: user.role
            }
          } 
        : ticket
    );
    localStorage.setItem('tickets', JSON.stringify(updatedStoredTickets));
  };

  const filteredTickets = visibleTickets.filter((ticket) => {
    // Improved search function to check all relevant fields
    const matchesSearch =
      searchQuery === "" ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.assignee?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (ticket.createdBy?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (ticket.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (ticket.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getUserDetailTooltip = (ticket: Ticket) => {
    return (
      <div className="space-y-2 p-2 max-w-xs">
        <p><strong>Name:</strong> {ticket.createdBy.name}</p>
        <p><strong>Email:</strong> {ticket.createdBy.email}</p>
        <p><strong>Role:</strong> {ticket.createdBy.role || "User"}</p>
        {ticket.createdBy.empCode && <p><strong>Employee Code:</strong> {ticket.createdBy.empCode}</p>}
        {ticket.createdBy.company && <p><strong>Company:</strong> {ticket.createdBy.company}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
        <Link to="/tickets/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTicketToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTicket}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        
        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              <span className="ml-2">Loading tickets...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {(user?.role === "manager" || user?.role === "admin" || user?.role === "team_leader") && (
                    <TableHead className="hidden lg:table-cell">Created By</TableHead>
                  )}
                  <TableHead className="hidden lg:table-cell">Assignee</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        {ticket.id}
                        {getEscalationBadge(ticket.escalationLevel)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {ticket.category}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={`/tickets/${ticket.id}`}
                                className="hover:text-support-purple-600 hover:underline"
                              >
                                {ticket.title}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              {getUserDetailTooltip(ticket)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getPriorityBadge(ticket.priority)}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      {(user?.role === "manager" || user?.role === "admin" || user?.role === "team_leader") && (
                        <TableCell className="hidden lg:table-cell">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {ticket.createdBy.name}
                              </TooltipTrigger>
                              <TooltipContent>
                                {getUserDetailTooltip(ticket)}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      )}
                      <TableCell className="hidden lg:table-cell">
                        {ticket.assignee?.name || "Unassigned"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {ticket.updated}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link
                                to={`/tickets/${ticket.id}`}
                                className="flex w-full cursor-default"
                              >
                                View details
                              </Link>
                            </DropdownMenuItem>
                            {(user?.role === "agent" || user?.role === "team_leader") && !ticket.assignee?.id && (
                              <DropdownMenuItem onClick={() => handleAssignToMe(ticket.id)}>
                                Assign to me
                              </DropdownMenuItem>
                            )}
                            {/* Hide escalation option for users with "user" role */}
                            {ticket.escalationLevel < 2 && 
                             user && user.role !== "user" && 
                             (user.role === "team_leader" || user.role === "admin") && (
                              <DropdownMenuItem onClick={() => {
                                setVisibleTickets(tickets => 
                                  tickets.map(t => t.id === ticket.id ? {...t, escalationLevel: 2 as const} : t)
                                );
                                // Don't show toast for users
                                if (user && user.role !== "user") {
                                  toast.warning(`Ticket ${ticket.id} escalated to manager`);
                                }
                              }}>
                                Escalate to manager
                              </DropdownMenuItem>
                            )}
                            {((user && user.role !== "user") || (user && ticket.createdBy.id === user.id)) && (
                              <DropdownMenuItem onClick={() => {
                                setVisibleTickets(tickets => 
                                  tickets.map(t => t.id === ticket.id ? {...t, status: "closed" as const} : t)
                                );
                                toast.success(`Ticket ${ticket.id} closed`);
                              }}>
                                Close ticket
                              </DropdownMenuItem>
                            )}
                            {/* Add delete ticket option - displayed to admin, manager, team leader, or ticket creator */}
                            {((user && (user.role === "admin" || user.role === "manager" || user.role === "team_leader")) || 
                              (user && ticket.createdBy.id === user.id)) && (
                              <DropdownMenuItem 
                                className="text-red-500 focus:bg-red-50 focus:text-red-500"
                                onClick={() => {
                                  setTicketToDelete(ticket.id);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ticket
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No tickets found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </AlertDialog>
    </div>
  );
};

export default TicketList;
