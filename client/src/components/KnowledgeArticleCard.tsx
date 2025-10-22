import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { KnowledgeArticle } from "@shared/schema";

interface KnowledgeArticleCardProps {
  article: KnowledgeArticle;
  onClick: () => void;
}

export function KnowledgeArticleCard({ article, onClick }: KnowledgeArticleCardProps) {
  return (
    <Card
      onClick={onClick}
      className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all"
      data-testid={`card-article-${article.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <Badge variant="secondary" className="text-xs">
          {article.category}
        </Badge>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime} min
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{article.excerpt}</p>
    </Card>
  );
}
