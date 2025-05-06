
import { Card } from "@/components/ui/card";
import { Users, MessageSquare, FileText, BarChart2, AlertTriangle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminStatsProps {
  userRole?: string;
}

const AdminStats = ({ userRole }: AdminStatsProps) => {
  const [stats, setStats] = useState({
    activeUsers: 1234,
    chatSessions: 39,
    kbArticles: 78,
    reports: 12
  });

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // based on the user's role and permissions
    if (userRole === "team_leader") {
      setStats({
        activeUsers: 32, // Only team members
        chatSessions: 15,
        kbArticles: 78, // Same as admin
        reports: 8
      });
    }
    // Admin and manager see the default stats
  }, [userRole]);

  if (userRole === "team_leader") {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Team Stats</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Team Members</div>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </div>
            <Users className="h-8 w-8 text-support-purple-500" />
          </Card>
          
          <Card className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Open Tickets</div>
              <div className="text-2xl font-bold">18</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </Card>
          
          <Card className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">Avg. Resolution</div>
              <div className="text-2xl font-bold">2.4d</div>
            </div>
            <Clock className="h-8 w-8 text-support-purple-500" />
          </Card>
          
          <Card className="flex items-center justify-between p-6">
            <div>
              <div className="text-sm font-medium text-gray-500">KB Articles</div>
              <div className="text-2xl font-bold">{stats.kbArticles}</div>
            </div>
            <FileText className="h-8 w-8 text-support-purple-500" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">System Stats</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="flex items-center justify-between p-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Active Users</div>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </div>
          <Users className="h-8 w-8 text-support-purple-500" />
        </Card>
        
        <Card className="flex items-center justify-between p-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Chat Sessions</div>
            <div className="text-2xl font-bold">{stats.chatSessions}</div>
          </div>
          <MessageSquare className="h-8 w-8 text-support-purple-500" />
        </Card>
        
        <Card className="flex items-center justify-between p-6">
          <div>
            <div className="text-sm font-medium text-gray-500">KB Articles</div>
            <div className="text-2xl font-bold">{stats.kbArticles}</div>
          </div>
          <FileText className="h-8 w-8 text-support-purple-500" />
        </Card>
        
        <Card className="flex items-center justify-between p-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Reports</div>
            <div className="text-2xl font-bold">{stats.reports}</div>
          </div>
          <BarChart2 className="h-8 w-8 text-support-purple-500" />
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
