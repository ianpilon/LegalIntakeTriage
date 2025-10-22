import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/ChatMessage";
import { OutcomeCard } from "@/components/OutcomeCard";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TriageOutcome, type TriageOutcomeType } from "@shared/schema";
import { UserMenu } from "@/components/UserMenu";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuidedDiscovery() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const initialInput = new URLSearchParams(searchParams).get("input") || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outcome, setOutcome] = useState<{
    type: TriageOutcomeType;
    reasoning: string;
    recommendations?: string[];
  } | null>(null);
  const [requestId] = useState(() => `temp-${Date.now()}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/conversation", {
        requestId,
        role: "user",
        content: userMessage,
        metadata: {}
      });
      return response.json();
    }
  });

  const triageMutation = useMutation({
    mutationFn: async (conversationHistory: Message[]) => {
      const response = await apiRequest("POST", "/api/triage", { conversationHistory });
      return response.json();
    }
  });

  useEffect(() => {
    if (messages.length === 0) {
      if (initialInput) {
        startConversation(initialInput);
      } else {
        // Start with a greeting if no initial input
        setMessages([{
          role: "assistant",
          content: "Hi! I'm here to help you figure out if you need legal support and guide you through the process. What are you working on or what brings you here today?"
        }]);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async (userInput: string) => {
    const initialMessage: Message = { role: "user", content: userInput };
    setMessages([initialMessage]);
    setIsLoading(true);

    try {
      const response = await conversationMutation.mutateAsync(userInput);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.assistantMessage.content
      }]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (messages.length >= 6) {
        const assessmentMessage: Message = {
          role: "assistant",
          content: "Based on our conversation, I have enough information to provide you with an assessment..."
        };
        setMessages(prev => [...prev, assessmentMessage]);
        
        const assessment = await triageMutation.mutateAsync([...messages, userMessage]);
        setOutcome({
          type: assessment.outcome as TriageOutcomeType,
          reasoning: assessment.reasoning,
          recommendations: assessment.recommendations
        });
      } else {
        const response = await conversationMutation.mutateAsync(input);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: response.assistantMessage.content
        }]);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setLocation("/direct");
  };

  const handleViewArticles = () => {
    setLocation("/knowledge");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/home")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Guided Discovery</h1>
          <p className="text-muted-foreground">
            Answer a few questions and we'll help you determine the best path forward
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="mb-6 max-h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground mb-6">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!outcome && (
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your answer..."
                className="resize-none"
                rows={2}
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-auto"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </Card>

        {outcome && (
          <OutcomeCard
            outcome={outcome.type}
            reasoning={outcome.reasoning}
            recommendations={outcome.recommendations}
            onCreateRequest={handleCreateRequest}
            onViewArticles={handleViewArticles}
          />
        )}
      </div>
    </div>
  );
}
