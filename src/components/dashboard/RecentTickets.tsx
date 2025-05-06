import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface RecentTicketsProps {
  userRole?: string;
}

const RecentTickets = ({ userRole }: RecentTicketsProps) => {
  const [recentTickets, setRecentTickets] = useState([
    {
      id: "TKT-1234",
      title: "Unable to access email account",
      priority: "high",
      status: "open",
      created: "2 hours ago",
    },
    {
      id: "TKT-1233",
      title: "Billing inquiry for last month",
      priority: "medium",
      status: "in-progress",
      created: "5 hours ago",
    },
    {
      id: "TKT-1232",
      title: "Password reset request",
      priority: "low",
      status: "resolved",
      created: "1 day ago",
    },
    {
      id: "TKT-1231",
      title: "New feature request",
      priority: "medium",
      status: "closed",
      created: "3 days ago",
    },
  ]);

  useEffect(() => {
    const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    let customTicketsToDisplay = [];
    
    if (storedTickets.length > 0) {
      const sortedStoredTickets = [...storedTickets].sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );
      
      customTicketsToDisplay = sortedStoredTickets.slice(0, 4).map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        created: formatRelativeTime(new Date(ticket.created)),
      }));
      
      if (customTicketsToDisplay.length >= 4) {
        setRecentTickets(customTicketsToDisplay);
        return;
      }
    }
    
    if (userRole === "user") {
      const userTickets = [
        {
          id: "TKT-1228",
          title: "My account access issue",
          priority: "high",
          status: "open",
          created: "3 hours ago",
        },
        {
          id: "TKT-1225",
          title: "Subscription question",
          priority: "medium",
          status: "in-progress",
          created: "1 day ago",
        },
        {
          id: "TKT-1222",
          title: "Feature suggestion",
          priority: "low",
          status: "closed",
          created: "3 days ago",
        },
        {
          id: "TKT-1220",
          title: "Login problem",
          priority: "medium",
          status: "resolved",
          created: "4 days ago",
        },
      ];
      
      if (customTicketsToDisplay.length > 0) {
        const remainingCount = 4 - customTicketsToDisplay.length;
        setRecentTickets([...customTicketsToDisplay, ...userTickets.slice(0, remainingCount)]);
      } else {
        setRecentTickets(userTickets);
      }
    } else if (userRole === "agent") {
      const agentTickets = [
        {
          id: "TKT-1234",
          title: "Unable to access email account",
          priority: "high",
          status: "in-progress",
          created: "2 hours ago",
        },
        {
          id: "TKT-1230",
          title: "Password reset assistance",
          priority: "medium",
          status: "open",
          created: "6 hours ago",
        },
        {
          id: "TKT-1227",
          title: "API integration help",
          priority: "high",
          status: "open",
          created: "1 day ago",
        },
        {
          id: "TKT-1224",
          title: "Mobile app crash",
          priority: "urgent",
          status: "in-progress",
          created: "1 day ago",
        },
      ];
      
      if (customTicketsToDisplay.length > 0) {
        const remainingCount = 4 - customTicketsToDisplay.length;
        setRecentTickets([...customTicketsToDisplay, ...agentTickets.slice(0, remainingCount)]);
      } else {
        setRecentTickets(agentTickets);
      }
    } else if (customTicketsToDisplay.length > 0) {
      const defaultTickets = [
        {
          id: "TKT-1234",
          title: "Unable to access email account",
          priority: "high",
          status: "open",
          created: "2 hours ago",
        },
        {
          id: "TKT-1233",
          title: "Billing inquiry for last month",
          priority: "medium",
          status: "in-progress",
          created: "5 hours ago",
        },
        {
          id: "TKT-1232",
          title: "Password reset request",
          priority: "low",
          status: "resolved",
          created: "1 day ago",
        },
        {
          id: "TKT-1231",
          title: "New feature request",
          priority: "medium",
          status: "closed",
          created: "3 days ago",
        },
      ];
      
      const remainingCount = 4 - customTicketsToDisplay.length;
      setRecentTickets([...customTicketsToDisplay, ...defaultTickets.slice(0, remainingCount)]);
    }
  }, [userRole]);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-ticket-low";
      case "medium":
        return "bg-ticket-medium";
      case "high":
        return "bg-ticket-high";
      case "urgent":
        return "bg-ticket-urgent";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-status-open";
      case "in-progress":
        return "bg-status-in-progress";
      case "resolved":
        return "bg-status-resolved";
      case "closed":
        return "bg-status-closed";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Tickets</CardTitle>
        <Link to="/tickets">
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div>
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {ticket.title}
                </Link>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{ticket.id}</span>
                  <span>•</span>
                  <span>{ticket.created}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`${getPriorityColor(
                    ticket.priority
                  )} h-2 w-2 rounded-full`}
                  title={`Priority: ${
                    ticket.priority.charAt(0).toUpperCase() +
                    ticket.priority.slice(1)
                  }`}
                ></div>
                <div
                  className={`${getStatusColor(
                    ticket.status
                  )} h-2 w-2 rounded-full`}
                  title={`Status: ${
                    ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)
                  }`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTickets;
