
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Import components with both named and default exports to support both patterns
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireNoAuth } from "@/components/auth/RequireNoAuth";
import MainLayout from "@/components/layouts/MainLayout";
import AuthLayout from "@/components/layouts/AuthLayout";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TicketList from "@/pages/TicketList";
import TicketDetail from "@/pages/TicketDetail";
import CreateTicket from "@/pages/CreateTicket";
import TicketWorkflow from "@/pages/TicketWorkflow";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Chat from "@/pages/Chat";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import CustomizationSettings from "@/pages/CustomizationSettings";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/hooks/useAuth";

// Role-based access control component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <NotFound />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/",
    element: <AuthLayout>
      {/* Auth layout children */}
    </AuthLayout>,
    children: [
      {
        path: "login",
        element: (
          <RequireNoAuth>
            <Login />
          </RequireNoAuth>
        ),
      },
      {
        path: "register",
        element: (
          <RequireNoAuth>
            <Register />
          </RequireNoAuth>
        ),
      },
    ],
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <MainLayout>
          {/* Main layout children */}
        </MainLayout>
      </RequireAuth>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "tickets",
        element: <TicketList />,
      },
      {
        path: "tickets/:id",
        element: <TicketDetail />,
      },
      {
        path: "tickets/create",
        element: <CreateTicket />,
      },
      {
        path: "workflow",
        element: (
          <RequireAuth>
            <RoleBasedRoute allowedRoles={["admin", "team_leader", "manager"]}>
              <TicketWorkflow />
            </RoleBasedRoute>
          </RequireAuth>
        ),
      },
      {
        path: "knowledge",
        element: <KnowledgeBase />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "reports",
        element: (
          <RequireAuth>
            <RoleBasedRoute allowedRoles={["admin", "team_leader", "manager"]}>
              <Reports />
            </RoleBasedRoute>
          </RequireAuth>
        ),
      },
      {
        path: "users",
        element: (
          <RequireAuth>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Users />
            </RoleBasedRoute>
          </RequireAuth>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireAuth>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Settings />
            </RoleBasedRoute>
          </RequireAuth>
        ),
      },
      {
        path: "customization",
        element: (
          <RequireAuth>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <CustomizationSettings />
            </RoleBasedRoute>
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const AppRouter = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default AppRouter;
