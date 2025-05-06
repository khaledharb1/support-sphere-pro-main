
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import TicketInformation from "@/components/tickets/create/TicketInformation";
import TicketAttachments from "@/components/tickets/create/TicketAttachments";
import type { Assignee } from "@/components/tickets/create/assignees/types";
import { createNotification } from "@/services/notificationService";
import { saveTicketToDatabase } from "@/services/database/ticketDbService";
import { TicketPriority } from "@/models/ticket";

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [files, setFiles] = useState<File[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new ticket object
      const currentDate = new Date().toISOString();
      const ticketId = `GTS-${Date.now().toString().slice(-5)}`;
      
      // Process file attachments
      const processedAttachments = await Promise.all(
        files.map(async (file) => {
          // In a real app, we would upload the files to a server/storage
          // For mock purposes, create a more reliable object URL
          const url = URL.createObjectURL(file);
          
          return {
            id: `attach-${Math.random().toString(36).substring(2, 10)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: url,
            uploadedAt: new Date().toISOString()
          };
        })
      );
      
      const newTicket = {
        id: ticketId,
        title,
        description,
        category,
        subcategory: subcategory || undefined,
        priority: priority as TicketPriority,
        status: "open" as const,
        createdBy: {
          id: user?.id || "unknown",
          name: user?.name || "Anonymous",
          email: user?.email || "unknown@example.com",
          role: user?.role,
          teamId: user?.teamId,
          empCode: user?.empCode,
          company: user?.company
        },
        assignee: assignees.length > 0 ? assignees[0] : undefined,
        created: currentDate,
        updated: currentDate,
        dueDate: calculateDueDate(priority),
        escalationLevel: 0 as const,
        teamId: user?.teamId,
        attachments: processedAttachments,
      };

      console.log("Creating new ticket:", newTicket);
      
      // Save ticket to database using the new service
      const saveSuccess = await saveTicketToDatabase(newTicket);
      
      if (!saveSuccess) {
        toast.error("Failed to save ticket to database. Make sure your database is properly configured.");
        return;
      }
      
      // Send notifications to the assignee
      if (assignees.length > 0) {
        const assignee = assignees[0];
        
        // Notification for the assignee
        createNotification({
          title: "New Ticket Assigned",
          message: `Ticket #${ticketId} has been assigned to you by ${user?.name}`,
          type: "info",
          userId: assignee.id,
          link: `/tickets/${ticketId}`,
        }, { id: assignee.id, role: assignee.role } as any);
        
        // In a real application, we would send an email to the assignee here
        console.log(`Email would be sent to ${assignee.name} about new ticket assignment`);
        
        // Simulate email sending
        toast.info(
          `Email notification sent to ${assignee.name}`,
          {
            description: `Regarding ticket ${ticketId}`,
          }
        );
      }
      
      toast.success(
        `Ticket ${newTicket.id} created`,
        {
          description: "Click to view ticket details. Saved to database.",
          action: {
            label: "View Ticket",
            onClick: () => navigate(`/tickets/${newTicket.id}`),
          },
        }
      );
      
      // Navigate to the ticket detail page after creation
      navigate(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate due date based on priority
  const calculateDueDate = (priority: TicketPriority): string => {
    const now = new Date();
    let daysToAdd = 5; // Default for low priority
    
    switch (priority) {
      case "urgent":
        daysToAdd = 1;
        break;
      case "high":
        daysToAdd = 2;
        break;
      case "medium":
        daysToAdd = 3;
        break;
      default:
        daysToAdd = 5;
    }
    
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + daysToAdd);
    return dueDate.toISOString();
  };

  // Create a submission handler that doesn't require an event parameter
  const handleFormSubmit = () => {
    const event = new Event('submit') as unknown as React.FormEvent;
    handleSubmit(event);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Create New Ticket</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <TicketInformation
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          subcategory={subcategory}
          setSubcategory={setSubcategory}
          priority={priority}
          setPriority={setPriority}
          assignees={assignees}
          setAssignees={setAssignees}
        />

        <TicketAttachments
          files={files}
          setFiles={setFiles}
          onCancel={() => navigate("/tickets")}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default CreateTicket;
