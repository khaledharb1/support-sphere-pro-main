
import StatsCards from "./StatsCards";
import Charts from "./Charts";
import RecentTickets from "./RecentTickets";
import ResponseTime from "./ResponseTime";
import AdminStats from "./AdminStats";

interface DashboardContentProps {
  userRole?: string;
}

const DashboardContent = ({ userRole }: DashboardContentProps) => {
  // Only show admin stats to admins, managers, and team leaders
  const showAdminStats = userRole === "admin" || 
                         userRole === "manager" || 
                         userRole === "team_leader";
  
  return (
    <>
      <StatsCards userRole={userRole} />
      {(userRole === "admin" || userRole === "manager") && <Charts />}
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentTickets userRole={userRole} />
        <ResponseTime userRole={userRole} />
      </div>

      {showAdminStats && <AdminStats userRole={userRole} />}
    </>
  );
};

export default DashboardContent;
