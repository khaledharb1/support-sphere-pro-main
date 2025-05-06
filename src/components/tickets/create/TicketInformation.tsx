
import TicketBasicDetails from "./basic-details/TicketBasicDetails";
import TicketCategories from "./category-selection/TicketCategories";
import TicketPriority from "./priority-selection/TicketPriority";
import TicketAssignees from "./assignees/TicketAssignees";
import type { Assignee } from "./assignees/types";
import { TicketPriority as TicketPriorityType } from "@/models/ticket";

interface TicketInformationProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;
  priority: TicketPriorityType;
  setPriority: (value: TicketPriorityType) => void;
  assignees: Assignee[];
  setAssignees: (assignees: Assignee[]) => void;
}

const TicketInformation = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  priority,
  setPriority,
  assignees,
  setAssignees,
}: TicketInformationProps) => {
  return (
    <div className="space-y-6">
      <TicketBasicDetails
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <TicketCategories
          category={category}
          setCategory={setCategory}
          subcategory={subcategory}
          setSubcategory={setSubcategory}
        />
        <TicketPriority priority={priority} setPriority={setPriority} />
      </div>
      
      <TicketAssignees
        selectedAssignees={assignees}
        onAssigneesChange={setAssignees}
      />
    </div>
  );
};

export default TicketInformation;
