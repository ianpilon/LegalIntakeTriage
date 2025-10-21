import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeArticleCard } from "@/components/KnowledgeArticleCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const categories = ["All", "Contracts", "Marketing", "Privacy", "Employment", "IP"];

export default function KnowledgeBase() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const buildQueryKey = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    const queryString = params.toString();
    return queryString ? `/api/knowledge?${queryString}` : "/api/knowledge";
  };

  const { data: articles, isLoading } = useQuery({
    queryKey: [buildQueryKey()]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Browse legal policies, templates, and frequently asked questions
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-articles"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover-elevate px-4 py-2"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-category-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article: any) => (
              <KnowledgeArticleCard
                key={article.id}
                article={article}
                onClick={() => setLocation(`/knowledge/${article.slug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No articles found matching your criteria
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
