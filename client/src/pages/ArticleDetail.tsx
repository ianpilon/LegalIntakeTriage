import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Eye, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { KnowledgeArticle } from "@shared/schema";

export default function ArticleDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const { data: article, isLoading } = useQuery<KnowledgeArticle>({
    queryKey: [`/api/knowledge/${slug}`]
  });

  const feedbackMutation = useMutation({
    mutationFn: async (helpful: boolean) => {
      if (!article) throw new Error("Article not found");
      const response = await apiRequest("POST", `/api/knowledge/${article.id}/feedback`, { helpful });
      return response.json();
    },
    onSuccess: (_, helpful) => {
      setFeedbackGiven(true);
      toast({
        title: "Thank you for your feedback!",
        description: helpful ? "We're glad this helped!" : "We'll work on improving this article."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/knowledge/${slug}`] });
    }
  });

  const handleFeedback = (helpful: boolean) => {
    if (feedbackGiven) return;
    feedbackMutation.mutate(helpful);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => setLocation("/knowledge")}>
            Back to Knowledge Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/knowledge")}
          className="mb-6"
          data-testid="button-back-to-knowledge"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Base
        </Button>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" data-testid="badge-category">
                {article.category}
              </Badge>
              {article.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline" data-testid={`badge-tag-${tag.toLowerCase()}`}>
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl font-bold mb-4" data-testid="text-article-title">
              {article.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-4" data-testid="text-article-excerpt">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {article.viewCount} views
              </span>
              <span className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                {article.helpfulCount} helpful
              </span>
            </div>
          </header>

          <Card className="p-8 mb-8">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none"
              data-testid="text-article-content"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Was this article helpful?</h3>
            <div className="flex gap-3">
              <Button
                variant={feedbackGiven ? "secondary" : "default"}
                onClick={() => handleFeedback(true)}
                disabled={feedbackGiven || feedbackMutation.isPending}
                data-testid="button-helpful-yes"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes, helpful
              </Button>
              <Button
                variant={feedbackGiven ? "secondary" : "outline"}
                onClick={() => handleFeedback(false)}
                disabled={feedbackGiven || feedbackMutation.isPending}
                data-testid="button-helpful-no"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Not helpful
              </Button>
            </div>
            {feedbackGiven && (
              <p className="text-sm text-muted-foreground mt-4">
                Thank you for your feedback!
              </p>
            )}
          </Card>
        </article>
      </div>
    </div>
  );
}
