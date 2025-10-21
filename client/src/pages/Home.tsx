import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [initialInput, setInitialInput] = useState("");
  const [showModeSelection, setShowModeSelection] = useState(false);

  const confidenceAnalysisMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest("POST", "/api/analyze-confidence", { input });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isConfident && data.confidence > 70) {
        setLocation("/direct");
      } else {
        setLocation(`/guided?input=${encodeURIComponent(initialInput)}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze your request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAutoSubmit = () => {
    if (!initialInput.trim()) {
      toast({
        title: "Input required",
        description: "Please describe what you're working on.",
        variant: "destructive"
      });
      return;
    }
    confidenceAnalysisMutation.mutate(initialInput);
  };

  const handleManualMode = (mode: "direct" | "guided") => {
    if (mode === "direct") {
      setLocation("/direct");
    } else {
      setLocation(`/guided?input=${encodeURIComponent(initialInput)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Legal Intake & Triage
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the legal support you need, whether you know exactly what you're looking for or need help figuring it out.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <label htmlFor="initial-input" className="block text-base font-medium mb-3">
            What are you working on?
          </label>
          <Textarea
            id="initial-input"
            placeholder="Describe your project or legal question..."
            value={initialInput}
            onChange={(e) => setInitialInput(e.target.value)}
            className="min-h-32 text-base resize-none mb-6"
            data-testid="input-initial-prompt"
            disabled={confidenceAnalysisMutation.isPending}
          />

          {!showModeSelection ? (
            <div className="space-y-3">
              <Button
                onClick={handleAutoSubmit}
                className="w-full"
                size="lg"
                disabled={confidenceAnalysisMutation.isPending || !initialInput.trim()}
                data-testid="button-auto-submit"
              >
                {confidenceAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowModeSelection(true)}
                className="w-full"
                data-testid="button-choose-mode"
              >
                Or choose your path manually
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() => handleManualMode("direct")}
                data-testid="button-mode-direct"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">I know what I need</h3>
                    <p className="text-sm text-muted-foreground">
                      Fast-track your request with our streamlined submission process
                    </p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all"
                onClick={() => handleManualMode("guided")}
                data-testid="button-mode-guided"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sidebar-accent/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-sidebar-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Help me figure this out</h3>
                    <p className="text-sm text-muted-foreground">
                      Answer a few questions and we'll guide you to the right solution
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Card>

        <div className="flex justify-center gap-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/knowledge")}
            data-testid="link-knowledge-base"
          >
            Browse Knowledge Base
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLocation("/my-requests")}
            data-testid="link-my-requests"
          >
            My Requests
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLocation("/legal-inbox")}
            data-testid="link-legal-inbox"
          >
            Legal Team Inbox
          </Button>
        </div>
      </div>
    </div>
  );
}
