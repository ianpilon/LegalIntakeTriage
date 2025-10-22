import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserProfile {
  name: string;
  email: string;
  team: string;
  avatar: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  name: "Ian Pilon",
  email: "ian.pilon@iohk.io",
  team: "product",
  avatar: "/ian.png"
};

export function UserProvider({ children }: { children: ReactNode }) {
  // Load user data from localStorage or use defaults
  const [user, setUser] = useState<UserProfile>(() => {
    const stored = localStorage.getItem("userProfile");
    return stored ? JSON.parse(stored) : DEFAULT_USER;
  });

  // Save to localStorage whenever user data changes
  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(user));
  }, [user]);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
