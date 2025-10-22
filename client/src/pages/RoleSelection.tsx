import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { User, Shield } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { setRole } = useRole();

  // Reset role when on role selection page
  useEffect(() => {
    setRole(null);
  }, [setRole]);

  const handleRoleSelect = (role: "user" | "admin", path: string) => {
    setRole(role);
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-2xl font-semibold text-foreground max-w-2xl mx-auto">
            Select your role to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all"
            onClick={() => handleRoleSelect("user", "/home")}
            data-testid="button-role-user"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Service Request User</h3>
                <p className="text-sm text-muted-foreground">
                  Submit and track legal support requests for your projects
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer hover-elevate active-elevate-2 transition-all"
            onClick={() => handleRoleSelect("admin", "/legal-inbox")}
            data-testid="button-role-admin"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-sidebar-accent/10 rounded-lg">
                <Shield className="w-10 h-10 text-sidebar-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Legal Administrator</h3>
                <p className="text-sm text-muted-foreground">
                  Manage and respond to incoming legal requests from the team
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
