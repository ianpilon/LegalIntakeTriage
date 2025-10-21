import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, ArrowLeft, Trash2, Edit, Loader2, BookOpen } from "lucide-react";
import type { KnowledgeArticle } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categories = ["Contracts", "Marketing", "Privacy", "Employment", "IP", "Regulatory", "Other"];

export default function KnowledgeBaseAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "Other",
    tags: "",
    readTime: 5
  });

  const { data: articles, isLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ["/api/knowledge"]
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/knowledge", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Article created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create article", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/knowledge/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Article updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update article", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/knowledge/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Article deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete article", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "Other",
      tags: "",
      readTime: 5
    });
    setIsCreating(false);
    setEditingArticle(null);
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setIsCreating(true);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags?.join(", ") || "",
      readTime: article.readTime
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
    };

    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: articleData });
    } else {
      createMutation.mutate(articleData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={resetForm}
            className="mb-6"
            data-testid="button-back-to-list"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Button>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingArticle ? "Edit Article" : "Create New Article"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value)
                    });
                  }}
                  required
                  data-testid="input-article-title"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="url-friendly-name"
                  data-testid="input-article-slug"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Auto-generated from title, but you can customize
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="excerpt">Short Description</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                  rows={2}
                  data-testid="input-article-excerpt"
                />
              </div>

              <div>
                <Label htmlFor="content">Full Content (Markdown supported)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="input-article-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Policy, Guidelines, Compliance"
                    data-testid="input-article-tags"
                  />
                </div>

                <div>
                  <Label htmlFor="readTime">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    min="1"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                    required
                    data-testid="input-read-time"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-article"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingArticle ? "Update Article" : "Create Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Knowledge Base Admin</h1>
            <p className="text-muted-foreground">
              Manage company policies and legal guidance articles
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/knowledge")}
              data-testid="button-view-public"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Public KB
            </Button>
            <Button
              onClick={() => setIsCreating(true)}
              data-testid="button-create-article"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {articles?.map((article) => (
              <Card key={article.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{article.title}</h3>
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.readTime} min read</span>
                      <span>•</span>
                      <span>{article.viewCount} views</span>
                      <span>•</span>
                      <span>{article.helpfulCount} helpful</span>
                      {article.tags && article.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{article.tags.join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article)}
                      data-testid={`button-edit-${article.slug}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(article.id)}
                      data-testid={`button-delete-${article.slug}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {articles?.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No articles yet</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Article
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The article will be permanently removed from the knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
