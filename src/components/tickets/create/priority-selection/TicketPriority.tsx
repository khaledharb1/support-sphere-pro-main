
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TicketPriority as TicketPriorityType } from "@/models/ticket";

interface TicketPriorityProps {
  priority: TicketPriorityType;
  setPriority: (value: TicketPriorityType) => void;
}

const TicketPriority = ({ priority, setPriority }: TicketPriorityProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger id="priority">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TicketPriority;
