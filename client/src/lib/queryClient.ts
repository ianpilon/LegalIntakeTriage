import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get backend URL from localStorage (synced with LLMContext)
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

// Helper to build full URL with backend base URL
function buildApiUrl(path: string): string {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    // No backend URL configured, use relative path
    return path;
  }
  // Remove trailing slash from backend URL and leading slash from path if present
  const cleanBackendUrl = backendUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBackendUrl}${cleanPath}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = buildApiUrl(url);
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    const fullUrl = buildApiUrl(path);
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
