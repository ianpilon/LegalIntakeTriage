import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SystemStatusContextType {
  isConnected: boolean;
  lastChecked: Date | null;
}

const SystemStatusContext = createContext<SystemStatusContextType>({
  isConnected: false,
  lastChecked: null,
});

export function useSystemStatus() {
  return useContext(SystemStatusContext);
}

interface SystemStatusProviderProps {
  children: ReactNode;
}

export function SystemStatusProvider({ children }: SystemStatusProviderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Get backend URL from localStorage
  function getBackendUrl(): string {
    try {
      const stored = localStorage.getItem("llmConfig");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.backendUrl || "";
      }
    } catch {
      // If parsing fails, return empty string (relative URLs)
    }
    return "";
  }

  // Build API URL
  function buildApiUrl(path: string): string {
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      return path;
    }
    const cleanBackendUrl = backendUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBackendUrl}${cleanPath}`;
  }

  // Check backend connection
  async function checkConnection() {
    try {
      const fullUrl = buildApiUrl("/api/health");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(fullUrl, {
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsConnected(response.ok);
      setLastChecked(new Date());
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date());
    }
  }

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 10 seconds
    const intervalId = setInterval(checkConnection, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SystemStatusContext.Provider value={{ isConnected, lastChecked }}>
      {children}
    </SystemStatusContext.Provider>
  );
}
