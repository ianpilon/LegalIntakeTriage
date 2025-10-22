import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { UserProvider } from "@/contexts/UserContext";
import { LLMProvider } from "@/contexts/LLMContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import RoleSelection from "@/pages/RoleSelection";
import Home from "@/pages/Home";
import DirectPath from "@/pages/DirectPath";
import GuidedDiscovery from "@/pages/GuidedDiscovery";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ArticleDetail from "@/pages/ArticleDetail";
import KnowledgeBaseAdmin from "@/pages/KnowledgeBaseAdmin";
import MyRequests from "@/pages/MyRequests";
import LegalInbox from "@/pages/LegalInbox";
import RequestDetail from "@/pages/RequestDetail";
import RequestSubmitted from "@/pages/RequestSubmitted";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Get base path from Vite's base configuration
const base = import.meta.env.BASE_URL;

function Router() {
  return (
    <WouterRouter base={base}>
      <Switch>
      <Route path="/" component={RoleSelection} />

      {/* User Routes */}
      <Route path="/home">
        <ProtectedRoute requiredRole="user">
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/direct">
        <ProtectedRoute requiredRole="user">
          <DirectPath />
        </ProtectedRoute>
      </Route>
      <Route path="/guided">
        <ProtectedRoute requiredRole="user">
          <GuidedDiscovery />
        </ProtectedRoute>
      </Route>
      <Route path="/my-requests">
        <ProtectedRoute requiredRole="user">
          <MyRequests />
        </ProtectedRoute>
      </Route>
      <Route path="/request-submitted">
        <ProtectedRoute requiredRole="user">
          <RequestSubmitted />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/legal-inbox">
        <ProtectedRoute requiredRole="admin">
          <LegalInbox />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/knowledge">
        <ProtectedRoute requiredRole="admin">
          <KnowledgeBaseAdmin />
        </ProtectedRoute>
      </Route>

      {/* Shared Routes (both roles can access) */}
      <Route path="/request/:id" component={RequestDetail} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/knowledge/:slug" component={ArticleDetail} />
      <Route path="/settings" component={Settings} />

      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <UserProvider>
          <LLMProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LLMProvider>
        </UserProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
