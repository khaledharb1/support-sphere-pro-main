
// Define types for customization
export interface CustomField {
  id: string;
  name: string;
  type: "text" | "select" | "checkbox" | "date" | "number";
  required: boolean;
  options?: string[]; // For select fields
  defaultValue?: any;
}

export interface TicketCategoryConfig {
  id: string;
  name: string;
  description?: string;
  subcategories?: string[];
  customFields?: CustomField[];
  slaHours?: number; // Default SLA for this category
}

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  isDefaultForNewTickets?: boolean;
  isResolvedState?: boolean;
  isClosedState?: boolean;
  color?: string;
}

export interface OrganizationConfig {
  ticketCategories: TicketCategoryConfig[];
  workflowStages: WorkflowStage[];
  customFields: CustomField[];
  emailNotifications: {
    onTicketCreation: boolean;
    onTicketAssignment: boolean;
    onTicketUpdate: boolean;
    onTicketResolution: boolean;
    onSLABreach: boolean;
    dailyDigest: boolean;
  };
}

// Default configuration
const DEFAULT_CONFIG: OrganizationConfig = {
  ticketCategories: [
    {
      id: "technical",
      name: "Technical",
      description: "Hardware, software, and network issues",
      subcategories: ["Hardware", "Software", "Network", "Security"],
      slaHours: 24
    },
    {
      id: "billing",
      name: "Billing",
      description: "Billing and payment related issues",
      subcategories: ["Invoice", "Payment", "Refund", "Subscription"],
      slaHours: 48
    },
    {
      id: "account",
      name: "Account",
      description: "Account management and access",
      subcategories: ["Password", "Permissions", "Profile", "Access"],
      slaHours: 12
    },
    {
      id: "general",
      name: "General",
      description: "General inquiries and other issues",
      subcategories: ["Question", "Feedback", "Other"],
      slaHours: 72
    }
  ],
  workflowStages: [
    {
      id: "open",
      name: "Open",
      description: "New tickets that haven't been processed yet",
      isDefaultForNewTickets: true,
      color: "blue"
    },
    {
      id: "in-progress",
      name: "In Progress",
      description: "Tickets currently being worked on",
      color: "yellow"
    },
    {
      id: "resolved",
      name: "Resolved",
      description: "Tickets that have been resolved",
      isResolvedState: true,
      color: "green"
    },
    {
      id: "closed",
      name: "Closed",
      description: "Tickets that have been closed",
      isClosedState: true,
      color: "gray"
    }
  ],
  customFields: [
    {
      id: "priority",
      name: "Priority",
      type: "select",
      required: true,
      options: ["low", "medium", "high", "urgent"],
      defaultValue: "medium"
    },
    {
      id: "impact",
      name: "Impact",
      type: "select",
      required: false,
      options: ["individual", "team", "department", "organization"],
      defaultValue: "individual"
    }
  ],
  emailNotifications: {
    onTicketCreation: true,
    onTicketAssignment: true,
    onTicketUpdate: true,
    onTicketResolution: true,
    onSLABreach: true,
    dailyDigest: false
  }
};

// Get organization config from localStorage or use default
export const getOrganizationConfig = (): OrganizationConfig => {
  const storedConfig = localStorage.getItem("organizationConfig");
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  return DEFAULT_CONFIG;
};

// Save organization config to localStorage
export const saveOrganizationConfig = (config: OrganizationConfig): void => {
  localStorage.setItem("organizationConfig", JSON.stringify(config));
};

// Get ticket categories
export const getTicketCategories = (): TicketCategoryConfig[] => {
  return getOrganizationConfig().ticketCategories;
};

// Get workflow stages
export const getWorkflowStages = (): WorkflowStage[] => {
  return getOrganizationConfig().workflowStages;
};

// Get custom fields
export const getCustomFields = (): CustomField[] => {
  return getOrganizationConfig().customFields;
};

// Get SLA hours for a specific category
export const getSLAHoursForCategory = (categoryId: string): number => {
  const categories = getTicketCategories();
  const category = categories.find(cat => cat.id === categoryId);
  return category?.slaHours || 24; // Default to 24 hours if not found
};

// Helper to get email notification settings
export const getEmailNotificationSettings = () => {
  return getOrganizationConfig().emailNotifications;
};
