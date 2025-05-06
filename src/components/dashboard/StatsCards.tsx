
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  userRole?: string;
}

const StatsCards = ({ userRole }: StatsCardsProps) => {
  const [stats, setStats] = useState({
    total: 123,
    resolved: 87,
    averageResponse: "3.2h",
    slaBreaches: 5
  });

  useEffect(() => {
    // In a real application, this would fetch data from an API
    // based on the user's role and permissions
    if (userRole === "user") {
      setStats({
        total: 8,
        resolved: 5,
        averageResponse: "4.1h",
        slaBreaches: 1
      });
    } else if (userRole === "agent") {
      setStats({
        total: 42,
        resolved: 35,
        averageResponse: "2.8h",
        slaBreaches: 2
      });
    } else if (userRole === "team_leader") {
      setStats({
        total: 78,
        resolved: 56,
        averageResponse: "3.0h",
        slaBreaches: 3
      });
    }
    // Admin and manager see the default stats (all tickets)
  }, [userRole]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {userRole === "user" ? "My Tickets" : "Total Tickets"}
          </CardTitle>
          <Ticket className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-gray-500">+10% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.resolved}</div>
          <p className="text-xs text-gray-500">{Math.round((stats.resolved / stats.total) * 100)}% resolution rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Average Response</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageResponse}</div>
          <p className="text-xs text-gray-500">-15% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
          <AlertTriangle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.slaBreaches}</div>
          <p className="text-xs text-gray-500">+2 from last month</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
