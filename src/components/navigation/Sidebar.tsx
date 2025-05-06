
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  FileText,
  MessageSquare,
  Settings,
  BarChart,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: Array<"admin" | "agent" | "user" | "team_leader" | "manager">;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "agent", "user", "team_leader", "manager"],
    },
    {
      name: "Tickets",
      href: "/tickets",
      icon: Ticket,
      roles: ["admin", "agent", "user", "team_leader", "manager"],
    },
    {
      name: "Ticket Workflow",
      href: "/workflow",
      icon: Workflow,
      roles: ["admin", "team_leader", "manager"], // Added team_leader and manager
    },
    {
      name: "Knowledge Base",
      href: "/knowledge",
      icon: FileText,
      roles: ["admin", "agent", "user", "team_leader", "manager"],
    },
    {
      name: "Live Chat",
      href: "/chat",
      icon: MessageSquare,
      roles: ["admin", "agent", "user", "team_leader", "manager"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart,
      roles: ["admin", "team_leader", "manager"],
    },
    {
      name: "User Management",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform overflow-y-auto bg-white shadow-lg transition duration-300 ease-in-out lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-16 items-center justify-center bg-support-purple-700 px-4 text-white">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="text-xl font-bold">Genena Ticketing</div>
        </Link>
      </div>

      <div className="flex flex-grow flex-col space-y-2 px-2 py-4">
        {navigation
          .filter((item) => user?.role && item.roles.includes(user.role))
          .map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition duration-150 ease-in-out",
                location.pathname === item.href
                  ? "bg-support-purple-100 text-support-purple-700"
                  : "text-gray-600 hover:bg-support-purple-50 hover:text-support-purple-600"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
      </div>

      <div className="p-4 border-t">
        <div className="px-2 text-xs font-semibold uppercase text-gray-400">
          Role: {user?.role}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
