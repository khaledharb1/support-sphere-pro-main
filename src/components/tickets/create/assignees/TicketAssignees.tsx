
import { useState, useCallback } from "react";
import { Check, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Assignee } from "./types";

interface TicketAssigneesProps {
  selectedAssignees: Assignee[];
  onAssigneesChange: (assignees: Assignee[]) => void;
}

// Expanded mock data with more roles to demonstrate filtering
const MOCK_ASSIGNEES: Assignee[] = [
  { id: "1", name: "John Admin", role: "admin" },
  { id: "2", name: "Sarah Agent", role: "agent" },
  { id: "3", name: "Mike Support", role: "agent" },
  { id: "4", name: "Lisa Admin", role: "admin" },
  { id: "5", name: "David Manager", role: "manager" },
  { id: "6", name: "Emma Team Lead", role: "team_leader" },
  { id: "7", name: "Robert Agent", role: "agent" },
  { id: "8", name: "Jennifer Team Lead", role: "team_leader" },
];

const TicketAssignees = ({ 
  selectedAssignees = [], 
  onAssigneesChange 
}: TicketAssigneesProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure we're always working with a valid array
  const safeAssignees = Array.isArray(selectedAssignees) ? selectedAssignees : [];

  const removeAssignee = useCallback((assigneeId: string) => {
    onAssigneesChange(safeAssignees.filter(a => a.id !== assigneeId));
  }, [safeAssignees, onAssigneesChange]);

  const addAssignee = useCallback((assignee: Assignee) => {
    if (!safeAssignees.find(a => a.id === assignee.id)) {
      onAssigneesChange([...safeAssignees, assignee]);
    }
    setOpen(false);
  }, [safeAssignees, onAssigneesChange]);

  // Get available assignees (those not already selected)
  const availableAssignees = MOCK_ASSIGNEES.filter(
    a => !safeAssignees.some(sa => sa.id === a.id)
  );

  // Filter assignees based on search query
  const filteredAssignees = searchQuery.trim() === "" 
    ? availableAssignees
    : availableAssignees.filter(assignee => 
        assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignee.role.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="space-y-2">
      <Label>Assignees</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {safeAssignees.map((assignee) => (
          <Badge key={assignee.id} variant="secondary">
            {assignee.name}
            <button
              className="ml-1 hover:text-destructive"
              onClick={() => removeAssignee(assignee.id)}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {safeAssignees.length === 0 && (
          <div className="text-sm text-muted-foreground">No assignees selected</div>
        )}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-start text-left font-normal"
          >
            <span>Add assignee{safeAssignees.length > 0 ? "..." : ""}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[250px]" side="bottom" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search assignee..." 
              onValueChange={handleSearchChange} 
            />
            <CommandList>
              <CommandEmpty>No assignee found.</CommandEmpty>
              <CommandGroup>
                {filteredAssignees.map((assignee) => (
                  <CommandItem
                    key={assignee.id}
                    onSelect={() => addAssignee(assignee)}
                    className="cursor-pointer flex items-center"
                    value={assignee.id}
                  >
                    <div className="flex items-center flex-1">
                      {assignee.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({assignee.role})
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredAssignees.length === 0 && searchQuery && (
                <div className="py-6 text-center text-sm">No matching assignees found.</div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TicketAssignees;
