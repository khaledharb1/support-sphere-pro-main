import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLinkableTickets } from "@/services/ticket/linkedTicketService";
import { Ticket } from "@/models/ticket";
import { toast } from "sonner";
import { Link2, X } from "lucide-react";

interface LinkedTicketsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTicketId: string;
  onLinkTicket: (ticketId: string, relationship: "related" | "parent" | "child" | "duplicate") => void;
  linkedTickets?: { id: string; title: string; relationship: string }[];
  onUnlinkTicket?: (ticketId: string) => void;
}

export function LinkedTicketsDialog({
  isOpen,
  onClose,
  currentTicketId,
  onLinkTicket,
  linkedTickets = [],
  onUnlinkTicket
}: LinkedTicketsDialogProps) {
  const [linkableTickets, setLinkableTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [relationship, setRelationship] = useState<"related" | "parent" | "child" | "duplicate">("related");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (isOpen) {
      const tickets = getLinkableTickets(currentTicketId);
      // Filter out tickets that are already linked
      const linkedIds = linkedTickets.map(lt => lt.id);
      const availableTickets = tickets.filter(t => !linkedIds.includes(t.id));
      setLinkableTickets(availableTickets);
    }
  }, [isOpen, currentTicketId, linkedTickets]);
  
  const filteredTickets = linkableTickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkTicket = () => {
    if (!selectedTicketId) {
      toast.error("Please select a ticket to link");
      return;
    }
    
    onLinkTicket(selectedTicketId, relationship);
    setSelectedTicketId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Linked Tickets</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Existing linked tickets */}
          {linkedTickets.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Current Linked Tickets</h3>
              <ul className="space-y-2">
                {linkedTickets.map((ticket) => (
                  <li 
                    key={ticket.id} 
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center">
                      <Link2 className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="text-sm">
                        <span className="font-medium">{ticket.id}</span>
                        <span className="mx-1">-</span>
                        <span>{ticket.title}</span>
                        <span className="text-xs text-gray-500 ml-2">({ticket.relationship})</span>
                      </div>
                    </div>
                    {onUnlinkTicket && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onUnlinkTicket(ticket.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Link new ticket */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Link a Ticket</label>
            
            <Input
              placeholder="Search tickets by ID or title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            
            <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a ticket to link" />
              </SelectTrigger>
              <SelectContent>
                {filteredTickets.length === 0 ? (
                  <SelectItem value="no-results" disabled>
                    No tickets found
                  </SelectItem>
                ) : (
                  filteredTickets.map(ticket => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.id} - {ticket.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Relationship</label>
            <Select value={relationship} onValueChange={(value) => setRelationship(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="related">Related to</SelectItem>
                <SelectItem value="parent">Parent of</SelectItem>
                <SelectItem value="child">Child of</SelectItem>
                <SelectItem value="duplicate">Duplicate of</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleLinkTicket} 
              disabled={!selectedTicketId}
            >
              Link Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
