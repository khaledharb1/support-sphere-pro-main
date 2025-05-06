
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TicketBasicDetailsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

const TicketBasicDetails = ({
  title,
  setTitle,
  description,
  setDescription,
}: TicketBasicDetailsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Brief summary of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Detailed explanation of the issue"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default TicketBasicDetails;
