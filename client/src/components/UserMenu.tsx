import { useState } from "react";
import { useLocation } from "wouter";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  role?: "user" | "admin";
}

export function UserMenu({
  userName = "Ian Pilon",
  userEmail = "ian.pilon@iohk.io",
  userAvatar = "/ian.png",
  role = "user"
}: UserMenuProps) {
  const [, setLocation] = useLocation();

  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary rounded-full">
        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {role === "admin" ? (
          <>
            <DropdownMenuItem onClick={() => setLocation("/legal-inbox")}>
              <User className="mr-2 h-4 w-4" />
              <span>Legal Team Inbox</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/admin/knowledge")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Knowledge Base Admin</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => setLocation("/my-requests")}>
              <User className="mr-2 h-4 w-4" />
              <span>My Requests</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation("/knowledge")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Knowledge Base</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => setLocation("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation("/")}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
