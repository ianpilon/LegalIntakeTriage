import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import DirectPath from "@/pages/DirectPath";
import GuidedDiscovery from "@/pages/GuidedDiscovery";
import KnowledgeBase from "@/pages/KnowledgeBase";
import ArticleDetail from "@/pages/ArticleDetail";
import MyRequests from "@/pages/MyRequests";
import LegalInbox from "@/pages/LegalInbox";
import RequestSubmitted from "@/pages/RequestSubmitted";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/direct" component={DirectPath} />
      <Route path="/guided" component={GuidedDiscovery} />
      <Route path="/knowledge" component={KnowledgeBase} />
      <Route path="/knowledge/:slug" component={ArticleDetail} />
      <Route path="/my-requests" component={MyRequests} />
      <Route path="/legal-inbox" component={LegalInbox} />
      <Route path="/request-submitted" component={RequestSubmitted} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
