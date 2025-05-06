
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import DashboardContent from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/tickets/create">
          <Button>
            <Ticket className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <DashboardContent userRole={user?.role} />
    </div>
  );
};

export default Dashboard;
