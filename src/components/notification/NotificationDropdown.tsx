
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  Notification,
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notificationService";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const notifications = getUserNotifications(user);
  const unreadCount = getUnreadNotificationsCount(user);
  const navigate = useNavigate();

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId, user);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(user);
    setOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-support-purple-500 p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <DropdownMenuItem
                    className={`flex flex-col items-start p-3 cursor-pointer ${
                      !notification.read ? "bg-slate-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{notification.title}</span>
                          {!notification.read && (
                            <Badge
                              variant="outline"
                              className="ml-1 border-support-purple-200 bg-support-purple-50 text-[10px] text-support-purple-700"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <Separator />
                </div>
              ))}
            </DropdownMenuGroup>
          </ScrollArea>
        )}
        <div className="p-2">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
