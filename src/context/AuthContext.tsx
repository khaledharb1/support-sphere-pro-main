
import React, { createContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User, AuthContextType } from "@/types/auth";
import { createNotification } from "@/services/notificationService";

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check for stored auth on initial load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Mock login function with role-specific notifications
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hardcoded mock data for demonstration
      let mockUser: User;
      
      if (email === "admin@example.com") {
        mockUser = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
        };
      } else if (email === "agent@example.com") {
        mockUser = {
          id: "2",
          name: "Support Agent",
          email: "agent@example.com",
          role: "agent",
          teamId: "team-1",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent"
        };
      } else if (email === "leader@example.com") {
        mockUser = {
          id: "4",
          name: "Team Leader",
          email: "leader@example.com",
          role: "team_leader",
          teamId: "team-1",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader"
        };
      } else if (email === "manager@example.com") {
        mockUser = {
          id: "5",
          name: "Department Manager",
          email: "manager@example.com",
          role: "manager",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager"
        };
      } else {
        mockUser = {
          id: "3",
          name: "Regular User",
          email: email,
          role: "user",
          teamId: "team-1",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        };
      }
      
      // Store user and mock token
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", "mock_jwt_token_" + Date.now());
      
      // Create role-specific welcome notification
      createRoleSpecificNotifications(mockUser);
      
      toast.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create role-specific notifications
  const createRoleSpecificNotifications = (user: User) => {
    // Common welcome notification
    createNotification({
      title: "Welcome back!",
      message: `Hello ${user.name}, welcome to Support Sphere!`,
      type: "success",
      userId: user.id,
    }, user);
    
    // Role-specific notifications
    switch (user.role) {
      case "admin":
        createNotification({
          title: "New User Registrations",
          message: "3 new users have registered and are waiting for role assignment",
          type: "info",
          userId: user.id,
          link: "/users",
          category: "user_management",
        }, user);
        break;
        
      case "agent":
        createNotification({
          title: "Assigned Tickets",
          message: "You have 5 tickets assigned that require attention",
          type: "info",
          userId: user.id,
          link: "/tickets",
        }, user);
        break;
        
      case "team_leader":
        createNotification({
          title: "Team Performance",
          message: "Your team's performance report for this week is available",
          type: "info",
          userId: user.id,
          link: "/reports",
        }, user);
        createNotification({
          title: "Team Tickets",
          message: "3 tickets in your team require attention",
          type: "warning",
          userId: user.id,
          link: "/tickets",
        }, user);
        break;
        
      case "manager":
        createNotification({
          title: "Department Summary",
          message: "Monthly department summary report is available for review",
          type: "info",
          userId: user.id,
          link: "/reports",
        }, user);
        break;
        
      case "user":
        createNotification({
          title: "Your Tickets",
          message: "You have 2 open tickets awaiting response",
          type: "info",
          userId: user.id,
          link: "/tickets",
        }, user);
        break;
    }
  };

  // Mock register function - with role assignment pending notification
  const register = async (name: string, email: string, password: string, empCode?: string, company?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: "user", // All new registrations are users by default
        teamId: "team-1",
        empCode,
        company,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      
      // Store user and mock token
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", "mock_jwt_token_" + Date.now());
      
      // Create welcome notification for the new user
      createNotification({
        title: "Welcome to Support Sphere!",
        message: "Your account is being reviewed. An admin will assign your role soon.",
        type: "info",
        userId: newUser.id,
      }, newUser);
      
      // Create notification for admins about the new user
      const adminNotification = {
        title: "New User Registration",
        message: `${name} (${email}) has registered and needs a role assignment`,
        type: "warning" as const,
        userId: "admin", // Send to all admins
        link: "/users",
        category: "user_management",
      };
      
      // In a real app, this would send the notification to all admins
      // For now, we just simulate it by logging
      console.log("Admin notification created:", adminNotification);
      
      toast.success("Registration successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
