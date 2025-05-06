import { 
  Ticket, 
  TicketEscalation, 
  shouldEscalate, 
  TicketPriority,
  TicketStatus
} from "@/models/ticket";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Clock,
  MessageSquare,
  PaperclipIcon,
  Send,
  Tag,
  User,
  Hash,
  Flag,
  LifeBuoy,
  Timer,
  Mail,
  Phone,
  ChevronUp,
  FileEdit,
  FilePlus,
  FileMinus,
  X,
  Edit,
  Link2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { canResolveTicket, canCancelTicket } from "@/models/user";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots
} from "@/components/ui/carousel";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditTicketDialog } from "@/components/tickets/edit/EditTicketDialog";
import { AttachmentDialog } from "@/components/tickets/attachments/AttachmentDialog";
import { LinkedTicketsDialog } from "@/components/tickets/link/LinkedTicketsDialog";
import { TagDialog } from "@/components/tickets/tags/TagDialog";
import { addTagToTicket, removeTagFromTicket, saveTicketTags } from "@/services/ticket/tagService";
import { linkTickets, unlinkTicket } from "@/services/ticket/linkedTicketService";
import { saveTicketToDatabase } from "@/services/database/ticketDbService";
import { updateTicketStatus, canUpdateTicketStatus } from "@/services/ticket/workflowService";

const ticketMockData: Ticket = {
  id: "TKT-1234",
  title: "Unable to access email account",
  description:
    "I'm having trouble logging into my company email account. I've tried resetting my password multiple times but keep getting an error message saying 'Account locked'. Please help me regain access as soon as possible.",
  category: "Technical",
  subcategory: "Email",
  priority: "high",
  status: "open",
  createdBy: {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    teamId: "team-1"
  },
  assignee: {
    id: "2",
    name: "Jane Smith",
    role: "agent"
  },
  created: "2023-04-20T09:15:00Z",
  updated: "2023-04-21T14:30:00Z",
  dueDate: "2023-04-25T14:30:00Z",
  escalationLevel: 0,
  teamId: "team-1",
  tags: ["password", "account-access", "urgent"],
  attachments: [
    {
      name: "error_screenshot.png",
      size: 1200000,
      type: "image/png",
      url: "#",
    },
  ],
};

const mockEscalations: TicketEscalation[] = [];

const conversationMockData = [
  {
    id: 1,
    type: "customer",
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    content:
      "I'm having trouble logging into my company email account. I've tried resetting my password multiple times but keep getting an error message saying 'Account locked'. Please help me regain access as soon as possible.",
    timestamp: "2023-04-20T09:15:00Z",
    isPublic: true,
  },
  {
    id: 2,
    type: "agent",
    author: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    content:
      "Hi Sarah, I'm sorry to hear you're having trouble accessing your email account. I'll help you resolve this. Could you please confirm when the account was locked and if you received any notification about it?",
    timestamp: "2023-04-20T09:45:00Z",
    isPublic: true,
  },
  {
    id: 3,
    type: "customer",
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    content:
      "It happened this morning when I tried to log in. I didn't receive any notification about it being locked. I just keep getting the error message when trying to log in.",
    timestamp: "2023-04-20T10:15:00Z",
    isPublic: true,
  },
  {
    id: 4,
    type: "note",
    author: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    content:
      "I've checked the system logs and it appears there were multiple failed login attempts from an unusual IP address. This might have triggered our security system to lock the account.",
    timestamp: "2023-04-20T10:30:00Z",
    isPublic: false,
  },
  {
    id: 5,
    type: "agent",
    author: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    content:
      "I've checked your account status and I can confirm it was locked due to multiple failed login attempts. I've reset the security lock and sent you a password reset link to your backup email address. Please check and let me know if you're able to log in now.",
    timestamp: "2023-04-20T11:00:00Z",
    isPublic: true,
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

// Mock requester details based on the image provided
const requesterDetailsMock = {
  name: "Test User",
  email: "Test@ticketing.com",
  employeeId: "5479",
  phone: "0102836784",
  mobile: "010293848746",
  jobTitle: "Sales Manager",
  site: "INMA",
  department: "Sales",
  reportingManager: "Test"
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [conversations, setConversations] = useState(conversationMockData);
  const [escalations, setEscalations] = useState(mockEscalations);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRequesterDetailsOpen, setIsRequesterDetailsOpen] = useState(false);
  
  // New state for dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [linkedTicketsDialogOpen, setLinkedTicketsDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  
  // Mock lifecycle and workflow data
//  const [lifecycle, setLifecycle] = useState("Not Assigned");
 // const [workflow, setWorkflow] = useState("Not Assigned");
  //const [technician, setTechnician] = useState("ERP Support");
  //const [tasks, setTasks] = useState("0/0");
  //const [checklists, setChecklists] = useState("0/0");
 // const [reminders, setReminders] = useState("0");
 // const [approvalStatus, setApprovalStatus] = useState("Not Configured");
  //const [dueBy, setDueBy] = useState("Timer Stopped");
  //const [worklogTimer, setWorklogTimer] = useState("");
  
  // Load ticket data based on the ID parameter
  useEffect(() => {
    const loadTicketData = async () => {
      setLoading(true);
      try {
        // First check local storage for this specific ticket
        const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        const foundTicket = storedTickets.find((t: Ticket) => t.id === id);
        
        if (foundTicket) {
          setTicket(foundTicket);
          setStatus(foundTicket.status);
          setPriority(foundTicket.priority);
          setAssignee(foundTicket.assignee?.name || "");
          
          // Custom conversation for this ticket
          if (foundTicket.description) {
            const customConversation = [
              {
                id: 1,
                type: "customer",
                author: {
                  name: foundTicket.createdBy.name,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundTicket.createdBy.name}`,
                },
                content: foundTicket.description,
                timestamp: foundTicket.created,
                isPublic: true,
              }
            ];
            setConversations(customConversation);
          }
        } else {
          // If not found in localStorage, use mock data
          // This is a fallback for the demo
          setTicket(ticketMockData);
          setStatus(ticketMockData.status);
          setPriority(ticketMockData.priority);
          setAssignee(ticketMockData.assignee?.name || "");
        }
      } catch (error) {
        console.error("Error loading ticket:", error);
        toast.error("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };
    
    loadTicketData();
  }, [id]);
  
  // Check if user has permission to view this ticket
  useEffect(() => {
    if (!user || !ticket) return;
    
    const hasPermission = (() => {
      switch (user.role) {
        case "admin":
        case "manager":
          return true;
        case "team_leader":
          return ticket.teamId === user.teamId;
        case "agent":
          return ticket.assignee?.id === user.id;
        case "user":
          return ticket.createdBy.id === user.id;
        default:
          return false;
      }
    })();
    
    if (!hasPermission) {
      toast.error("You don't have permission to view this ticket");
      navigate("/tickets");
    }
  }, [user, ticket, navigate]);

  useEffect(() => {
    if (!ticket?.dueDate || !ticket || ticket.status === "resolved" || ticket.status === "closed") {
      return;
    }
    
    const checkSLA = () => {
      const now = new Date();
      const dueDate = new Date(ticket.dueDate || "");
      
      if (now > dueDate && ticket.escalationLevel === 0) {
        setTicket(prev => prev ? {...prev, escalationLevel: 1} : null);
        setEscalations(prev => [
          ...prev,
          {
            ticketId: ticket.id,
            level: 1,
            timestamp: new Date().toISOString(),
            reason: "SLA breach",
            escalatedTo: {
              id: "team-leader-1",
              name: "Team Leader",
              role: "team_leader"
            }
          }
        ]);
        toast.warning("Ticket escalated to Team Leader due to SLA breach", {
          duration: 5000,
        });
      } else if (now > new Date(dueDate.getTime() + 24 * 60 * 60 * 1000) && ticket.escalationLevel === 1) {
        setTicket(prev => prev ? {...prev, escalationLevel: 2} : null);
        setEscalations(prev => [
          ...prev,
          {
            ticketId: ticket.id,
            level: 2,
            timestamp: new Date().toISOString(),
            reason: "Unresolved after Team Leader escalation",
            escalatedTo: {
              id: "manager-1",
              name: "Department Manager",
              role: "manager"
            }
          }
        ]);
        toast.warning("Ticket escalated to Manager due to continued SLA breach", {
          duration: 5000,
        });
      }
    };
    
    checkSLA();
    
    const interval = setInterval(checkSLA, 60000);
    
    return () => clearInterval(interval);
  }, [ticket]);

  const handleReply = () => {
    if (!replyText.trim()) return;

    const newReply = {
      id: conversations.length + 1,
      type: isInternalNote ? "note" : "agent",
      author: {
        name: user?.name || "Support Agent",
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=agent`,
      },
      content: replyText,
      timestamp: new Date().toISOString(),
      isPublic: !isInternalNote,
    };

    setConversations([...conversations, newReply]);
    setReplyText("");
    toast.success(
      isInternalNote
        ? "Internal note added successfully"
        : "Reply sent successfully"
    );
    
    // Update local storage
    if (ticket) {
      const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const updatedTickets = storedTickets.map((t: Ticket) => 
        t.id === ticket.id ? { ...t, updated: new Date().toISOString() } : t
      );
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!ticket || !user) return;
    
    try {
      // Check if the user has permission to change to this status
      if (!canUpdateTicketStatus(user.role, ticket.status as TicketStatus, newStatus as TicketStatus)) {
        toast.error("You don't have permission to change to this status");
        return;
      }
      
      // Update ticket status
      const updatedTicket = updateTicketStatus(
        ticket, 
        newStatus as TicketStatus, 
        user
      );
      
      setStatus(newStatus as any);
      setTicket(updatedTicket);
      
      setConversations([
        ...conversations,
        {
          id: conversations.length + 1,
          type: "note",
          author: {
            name: user?.name || "System",
            avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=system`,
          },
          content: `Ticket status changed from ${ticket.status} to ${newStatus}`,
          timestamp: new Date().toISOString(),
          isPublic: false,
        }
      ]);
      
      toast.success(`Ticket status updated to ${newStatus}`);
      
      // Update in local storage
      const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const updatedTickets = storedTickets.map((t: Ticket) => {
        if (t.id === ticket.id) {
          return {
            ...t, 
            status: newStatus as any, 
            updated: new Date().toISOString()
          };
        }
        return t;
      });
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    } catch (error) {
      toast.error(error.message || "Failed to update ticket status");
    }
  };

  const handleAssigneeChange = (newAssignee: string) => {
    if (!ticket) return;
    
    setAssignee(newAssignee);
    
    setTicket(prev => {
      if (!prev) return null;
      return {
        ...prev, 
        assignee: {
          id: newAssignee === "Jane Smith" ? "2" : newAssignee === "John Doe" ? "agent-2" : "agent-3",
          name: newAssignee,
          role: "agent"
        }
      };
    });
    
    setConversations([
      ...conversations,
      {
        id: conversations.length + 1,
        type: "note",
        author: {
          name: user?.name || "System",
          avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=system`,
        },
        content: `Ticket assigned to ${newAssignee}`,
        timestamp: new Date().toISOString(),
        isPublic: false,
      }
    ]);
    
    toast.success(`Ticket assigned to ${newAssignee}`);
    
    // Update in local storage
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = storedTickets.map((t: Ticket) => {
      if (t.id === ticket.id) {
        return {
          ...t, 
          assignee: {
            id: newAssignee === "Jane Smith" ? "2" : newAssignee === "John Doe" ? "agent-2" : "agent-3",
            name: newAssignee,
            role: "agent"
          },
          updated: new Date().toISOString()
        };
      }
      return t;
    });
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
  };

  const handleDeleteTicket = () => {
    if (!ticket) return;
    
    // Delete from local storage
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = storedTickets.filter((t: Ticket) => t.id !== ticket.id);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    toast.success("Ticket deleted successfully");
    navigate('/tickets');
  };

  const handleEditTicket = (updatedTicket: Ticket) => {
    setTicket(updatedTicket);
    setPriority(updatedTicket.priority);
    
    // Update in local storage
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = storedTickets.map((t: Ticket) => 
      t.id === updatedTicket.id ? updatedTicket : t
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    toast.success("Ticket updated successfully");
    
    // Also update to database
    saveTicketToDatabase(updatedTicket).catch(() => {
      toast.error("Failed to save to database, but local changes were saved");
    });
  };

  const handleAddAttachments = (attachments: { name: string; size: number; type: string; url: string }[]) => {
    if (!ticket) return;
    
    const updatedTicket = {
      ...ticket,
      attachments: [...(ticket.attachments || []), ...attachments],
      updated: new Date().toISOString()
    };
    
    setTicket(updatedTicket);
    
    // Update in local storage
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = storedTickets.map((t: Ticket) => 
      t.id === ticket.id ? updatedTicket : t
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    toast.success(`${attachments.length} attachment(s) added`);
  };

  const handleRemoveAttachment = (attachmentName: string) => {
    if (!ticket) return;
    
    const updatedAttachments = ticket.attachments?.filter(a => a.name !== attachmentName) || [];
    
    const updatedTicket = {
      ...ticket,
      attachments: updatedAttachments,
      updated: new Date().toISOString()
    };
    
    setTicket(updatedTicket);
    
    // Update in local storage
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const updatedTickets = storedTickets.map((t: Ticket) => 
      t.id === ticket.id ? updatedTicket : t
    );
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    
    toast.success("Attachment removed");
  };

  const handleAddTag = (tag: string) => {
    if (!ticket) return;
    
    const updatedTicket = addTagToTicket(ticket, tag);
    setTicket(updatedTicket);
    saveTicketTags(updatedTicket);
  };

  const handleRemoveTag = (tag: string) => {
    if (!ticket) return;
    
    const updatedTicket = removeTagFromTicket(ticket, tag);
    setTicket(updatedTicket);
    saveTicketTags(updatedTicket);
  };

  const handleLinkTicket = (ticketId: string, relationship: "related" | "parent" | "child" | "duplicate") => {
    if (!ticket) return;
    
    const updatedTicket = linkTickets(ticket, ticketId, relationship);
    setTicket(updatedTicket);
  };

  const handleUnlinkTicket = (ticketId: string) => {
    if (!ticket) return;
    
    const updatedTicket = unlinkTicket(ticket, ticketId);
    setTicket(updatedTicket);
  };

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
  
  const getStatusColor = (status: string) => {
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
  
  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      case "urgent":
        return "bg-red-900";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Check if user can change the ticket status
  const canChangeStatus = (newStatus: TicketStatus): boolean => {
    if (!user || !ticket) return false;
    return canUpdateTicketStatus(user.role, ticket.status as TicketStatus, newStatus);
  };
  
  const userCanResolve = user && ticket && canUpdateTicketStatus(user.role, ticket.status as TicketStatus, "resolved");
  
  const userCanCancel = ticket ? canCancelTicket(user, ticket.createdBy.id) : false;
  
  // Check if user can edit the ticket
  const canEditTicket = user && ["admin", "manager", "team_leader", "agent"].includes(user.role);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-600"></div>
        <span className="ml-2">Loading ticket details...</span>
      </div>
    );
  }
  
  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Ticket not found</h2>
        <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/tickets")}>Return to Tickets</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            {ticket.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>Ticket {ticket.id}</span>
            <span>•</span>
            <span>{formatDate(ticket.created)}</span>
            <span>•</span>
            <Badge
              className={`${getStatusColor(status)} hover:${getStatusColor(
                status
              )} capitalize`}
            >
              {status.replace("-", " ")}
            </Badge>
            <Badge
              className={`${getPriorityColor(priority)} hover:${getPriorityColor(
                priority
              )} capitalize`}
            >
              {priority}
            </Badge>
            {ticket.escalationLevel > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {ticket.escalationLevel === 1 ? "Escalated to Team Leader" : "Escalated to Manager"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {user && ["admin", "manager", "team_leader", "agent"].includes(user.role) && (
            <>
              <Select
                value={status}
                onValueChange={handleStatusChange}
                disabled={!user || user.role === "user"}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open" disabled={!canChangeStatus("open")}>Open</SelectItem>
                  <SelectItem value="in-progress" disabled={!canChangeStatus("in-progress")}>In Progress</SelectItem>
                  <SelectItem value="resolved" disabled={!canChangeStatus("resolved")}>Resolved</SelectItem>
                  <SelectItem value="closed" disabled={!canChangeStatus("closed")}>Closed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          {userCanResolve && ticket.status !== "resolved" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("resolved")}
            >
              Resolve
            </Button>
          )}
          
          {userCanCancel && ticket.status !== "closed" && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              {ticket.createdBy.id === user?.id ? "Cancel" : "Close"}
            </Button>
          )}
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] border rounded-lg bg-background">
        {/* Left side - Main Content with Conversation */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full overflow-auto p-4 space-y-6">
            {/* Conversation Thread */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gray-50 pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {conversations.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-4 ${message.type === 'note' && !message.isPublic ? 'bg-amber-50' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={message.author.avatar} />
                            <AvatarFallback>
                              {message.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-sm font-medium">
                                  {message.author.name}
                                </span>
                                {message.type === 'note' && !message.isPublic && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Internal Note
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reply Box */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {isInternalNote ? "Add Internal Note" : "Reply to Ticket"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={
                      isInternalNote
                        ? "Type your internal note here..."
                        : "Type your reply here..."
                    }
                    className="min-h-[120px]"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setIsInternalNote(!isInternalNote)}
                      className="mr-2"
                    >
                      {isInternalNote ? "Switch to Reply" : "Switch to Internal Note"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    disabled={!replyText.trim()}
                    onClick={handleReply}
                    className="w-full sm:w-auto"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isInternalNote ? "Save Note" : "Send Reply"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right side - Ticket Details and Requester Info */}
        <ResizablePanel defaultSize={30} minSize={25}>
          <div className="h-full overflow-auto p-4 space-y-4 bg-gray-50">
            {/* Ticket Information Card */}
            <Card>
              <CardHeader className="bg-gray-100">
                <CardTitle className="text-md">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Request ID:</span>
                    <span className="text-sm flex items-center">
                      # {ticket.id.replace('TKT-', '')}
                      {ticket.id && <button className="ml-1 text-gray-400 hover:text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Status:</span>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusDot(status)} mr-2`}></span>
                      <span className="text-sm capitalize">{status === "in-progress" ? "On Hold with Requester" : status.replace("-", " ")}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Life Cycle:</span>
                    <span className="text-sm">Not Assigned</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Workflow:</span>
                    <span className="text-sm">Not Assigned</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Priority:</span>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${getPriorityDot(priority)} mr-2`}></span>
                      <span className="text-sm capitalize">{priority}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Technician:</span>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-sm">ERP Support</span>
                    </div>
                  </div>
                
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Reminders:</span>
                    <span className="text-sm">0</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Approval Status:</span>
                    <span className="text-sm">Not Configured</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Attachments:</span>
                    <span className="text-sm flex items-center">
                      {ticket.attachments?.length || 0}
                      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium">Due By:</span>
                    <span className="text-sm">Timer Stopped</span>
                  </div>
                  
                </div>
                
                
                
                {canEditTicket && (
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => setEditDialogOpen(true)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => setAttachmentDialogOpen(true)}
                    >
                      <PaperclipIcon className="h-3 w-3 mr-1" /> Attachments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Requester Information */}
            <Card>
              <CardHeader className="bg-gray-100 py-3">
                <CardTitle className="text-md flex justify-between items-center">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Requester Details</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsRequesterDetailsOpen(!isRequesterDetailsOpen)}
                  >
                    {isRequesterDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <Collapsible open={isRequesterDetailsOpen}>
                <CollapsibleContent>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="10" r="4" fill="#b9bbbe"/>
                          <path d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M12,5 C13.66,5 15,6.34 15,8 C15,9.66 13.66,11 12,11 C10.34,11 9,9.66 9,8 C9,6.34 10.34,5 12,5 Z M12,19.2 C9.5,19.2 7.29,17.92 6,15.98 C6.03,13.99 10,12.9 12,12.9 C13.99,12.9 17.97,13.99 18,15.98 C16.71,17.92 14.5,19.2 12,19.2 Z" fill="#b9bbbe"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{requesterDetailsMock.name}</div>
                        <div className="text-sm text-blue-500">{requesterDetailsMock.email}</div>
                        <div className="text-xs text-gray-500 mt-1">Hide Full details <ChevronUp className="h-3 w-3 inline" /></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Employee ID:</span>
                        <span className="text-sm">{requesterDetailsMock.employeeId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Phone:</span>
                        <span className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          {requesterDetailsMock.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Mobile:</span>
                        <span className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          {requesterDetailsMock.mobile}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Job Title:</span>
                        <span className="text-sm">{requesterDetailsMock.jobTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Site:</span>
                        <span className="text-sm">{requesterDetailsMock.site}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Department:</span>
                        <span className="text-sm">{requesterDetailsMock.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reporting Manager:</span>
                        <span className="text-sm">{requesterDetailsMock.reportingManager}</span>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            
          
            
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Delete/Close confirmation dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={ticket.createdBy.id === user?.id ? "Cancel Ticket" : "Close Ticket"}
        description={
          ticket.createdBy.id === user?.id
            ? "Are you sure you want to cancel this ticket? This action cannot be undone."
            : "Are you sure you want to close this ticket? This will mark it as resolved."
        }
        confirmText={ticket.createdBy.id === user?.id ? "Cancel Ticket" : "Close Ticket"}
        cancelText="Keep Open"
        onConfirm={handleDeleteTicket}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      {/* Edit Ticket Dialog */}
      {ticket && (
        <EditTicketDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          ticket={ticket}
          onSave={handleEditTicket}
        />
      )}
      
      {/* Attachment Dialog */}
      <AttachmentDialog
        isOpen={attachmentDialogOpen}
        onClose={() => setAttachmentDialogOpen(false)}
        onAddAttachments={handleAddAttachments}
      />
  
    </div>
  );
};

export default TicketDetail;
