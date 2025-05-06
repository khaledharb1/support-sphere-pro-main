
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  Notification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notificationService";

const NotificationItem = ({ notification, onMarkAsRead, onNavigate }: { 
  notification: Notification, 
  onMarkAsRead: () => void,
  onNavigate: () => void
}) => (
  <div 
    className={`mb-4 ${!notification.read ? "bg-slate-50" : ""} rounded-md p-4 cursor-pointer`}
    onClick={onNavigate}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <h3 className="text-base font-medium">{notification.title}</h3>
          {!notification.read && (
            <Badge
              variant="outline"
              className="ml-1 border-support-purple-200 bg-support-purple-50 text-[10px] text-support-purple-700"
            >
              New
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(notification.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
        >
          <Check className="mr-1 h-3 w-3" />
          Mark as read
        </Button>
      )}
    </div>
  </div>
);

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allNotifications = getUserNotifications(user);
  const [activeTab, setActiveTab] = useState("all");

  const unreadNotifications = allNotifications.filter(n => !n.read);
  const readNotifications = allNotifications.filter(n => n.read);
  
  const displayNotifications = 
    activeTab === "all" 
      ? allNotifications
      : activeTab === "unread"
        ? unreadNotifications
        : readNotifications;
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId, user);
  };
  
  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(user);
  };

  const handleNavigate = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        {unreadNotifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-1 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({allNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({readNotifications.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {allNotifications.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                displayNotifications.map((notification, i) => (
                  <div key={notification.id}>
                    <NotificationItem 
                      notification={notification}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                      onNavigate={() => handleNavigate(notification)}
                    />
                    {i < displayNotifications.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              {unreadNotifications.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No unread notifications
                </div>
              ) : (
                displayNotifications.map((notification, i) => (
                  <div key={notification.id}>
                    <NotificationItem 
                      notification={notification}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                      onNavigate={() => handleNavigate(notification)}
                    />
                    {i < displayNotifications.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="read" className="mt-0">
              {readNotifications.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No read notifications
                </div>
              ) : (
                displayNotifications.map((notification, i) => (
                  <div key={notification.id}>
                    <NotificationItem 
                      notification={notification}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                      onNavigate={() => handleNavigate(notification)}
                    />
                    {i < displayNotifications.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
