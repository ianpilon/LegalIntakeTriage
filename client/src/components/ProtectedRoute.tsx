import { useEffect } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/contexts/RoleContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { role } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If no role is set, redirect to role selection
    if (!role) {
      setLocation("/");
      return;
    }

    // If a specific role is required and doesn't match, redirect to home
    if (requiredRole && role !== requiredRole) {
      if (role === "admin") {
        setLocation("/legal-inbox");
      } else {
        setLocation("/home");
      }
    }
  }, [role, requiredRole, setLocation]);

  // Don't render if role doesn't match
  if (!role || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
