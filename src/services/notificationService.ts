
import { toast } from "@/hooks/use-toast";
import { User } from "@/models/user";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  userId: string;
  link?: string;
  category?: string; // Added category field to help filter notifications
}

const mockNotifications: Record<string, Notification[]> = {
  // Admin notifications
  "admin": [
    {
      id: "1",
      title: "System Update",
      message: "System will be updated tonight at 2 AM",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      userId: "admin",
    },
    {
      id: "2",
      title: "New User Registered",
      message: "A new user has registered and needs approval",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
      userId: "admin",
      link: "/users",
    },
  ],
  // Manager notifications
  "manager": [
    {
      id: "1",
      title: "Performance Report",
      message: "Monthly performance report is ready for review",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
      userId: "manager",
      link: "/reports",
    },
    {
      id: "2",
      title: "Ticket Escalated",
      message: "Ticket #T-1234 has been escalated to your level",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      read: false,
      userId: "manager",
      link: "/tickets/T-1234",
      category: "escalation",
    },
    {
      id: "3",
      title: "SLA Breach Alert",
      message: "3 tickets are at risk of SLA breach",
      type: "error",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      read: true,
      userId: "manager",
      link: "/tickets",
      category: "escalation",
    },
  ],
  // Team leader notifications
  "team_leader": [
    {
      id: "1",
      title: "New Assignment",
      message: "5 tickets have been assigned to your team",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      read: false,
      userId: "team_leader",
      link: "/tickets",
    },
    {
      id: "2",
      title: "Team Performance",
      message: "Team response time has improved by 15% this week",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      read: true,
      userId: "team_leader",
      link: "/reports",
    },
  ],
  // Agent notifications
  "agent": [
    {
      id: "1",
      title: "New Ticket Assigned",
      message: "Ticket #T-5678 has been assigned to you",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      read: false,
      userId: "agent",
      link: "/tickets/T-5678",
    },
    {
      id: "2",
      title: "Ticket Updated",
      message: "Customer added a new comment to ticket #T-4321",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      userId: "agent",
      link: "/tickets/T-4321",
    },
  ],
  // User notifications
  "user": [
    {
      id: "1",
      title: "Ticket Status Update",
      message: "Your ticket #T-9876 status has changed to 'In Progress'",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      read: false,
      userId: "user",
      link: "/tickets/T-9876",
    },
    {
      id: "2",
      title: "Ticket Resolved",
      message: "Your ticket #T-6543 has been resolved",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      read: true,
      userId: "user",
      link: "/tickets/T-6543",
    },
  ],
};

// Get notifications based on user role, filtering out escalation notifications for users
export const getUserNotifications = (user: User | null): Notification[] => {
  if (!user || !user.role) return [];
  
  const notifications = mockNotifications[user.role] || [];
  
  // For all users, filter out escalation notifications
  if (user.role === "user") {
    return notifications.filter(notification => 
      notification.category !== "escalation" && 
      !notification.title.toLowerCase().includes("escalat") &&
      !notification.message.toLowerCase().includes("escalat")
    );
  }
  
  return notifications;
};

// Get unread notification count
export const getUnreadNotificationsCount = (user: User | null): number => {
  if (!user || !user.role) return 0;
  
  const notifications = getUserNotifications(user);
  return notifications.filter(notification => !notification.read).length;
};

// Mark notification as read
export const markNotificationAsRead = (notificationId: string, user: User | null): void => {
  if (!user || !user.role) return;
  
  const notifications = mockNotifications[user.role];
  if (!notifications) return;
  
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    toast({
      title: "Notification marked as read"
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (user: User | null): void => {
  if (!user || !user.role) return;
  
  const notifications = mockNotifications[user.role];
  if (!notifications) return;
  
  notifications.forEach(notification => {
    notification.read = true;
  });
  
  toast({
    title: "All notifications marked as read"
  });
};

// Create a notification
export const createNotification = (
  notification: Omit<Notification, "id" | "timestamp" | "read">,
  user: User | null
): void => {
  if (!user || !user.role) return;
  
  // Don't create escalation notifications for users with "user" role
  if (user.role === "user" && (
    notification.category === "escalation" ||
    notification.title.toLowerCase().includes("escalat") ||
    notification.message.toLowerCase().includes("escalat")
  )) {
    return;
  }
  
  if (!mockNotifications[user.role]) {
    mockNotifications[user.role] = [];
  }
  
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  mockNotifications[user.role].unshift(newNotification);
  
  toast({
    title: notification.title,
    description: notification.message,
  });
};
