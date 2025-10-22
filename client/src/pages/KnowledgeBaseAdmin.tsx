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
import { Plus, ArrowLeft, Trash2, Edit, Loader2, BookOpen, Upload, FileText } from "lucide-react";
import type { KnowledgeArticle } from "@shared/schema";
import { UserMenu } from "@/components/UserMenu";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const parseMarkdownFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const content = await file.text();

      // Extract title from first H1 heading or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.name.replace(/\.md$/, "");

      // Extract first paragraph as excerpt (skip title and empty lines)
      const lines = content.split("\n");
      let excerpt = "";
      let foundTitle = false;
      for (const line of lines) {
        if (line.startsWith("# ")) {
          foundTitle = true;
          continue;
        }
        if (foundTitle && line.trim() && !line.startsWith("#") && !line.startsWith("---")) {
          excerpt = line.trim().substring(0, 200);
          break;
        }
      }

      // Estimate read time (roughly 200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Create article
      const slug = generateSlug(title);
      const articleData = {
        title,
        slug,
        content,
        excerpt: excerpt || "No description available",
        category: "Other",
        tags: ["imported"],
        readTime
      };

      await createMutation.mutateAsync(articleData);

      toast({
        title: "Success!",
        description: `"${title}" has been imported successfully`
      });

      // Navigate to the article detail page
      setLocation(`/knowledge/${slug}`);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      toast({
        title: "Error",
        description: "Failed to import markdown file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const mdFiles = files.filter(f => f.name.endsWith(".md"));

    if (mdFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload .md (Markdown) files only",
        variant: "destructive"
      });
      return;
    }

    // Process all files except the last one without navigation
    for (let i = 0; i < mdFiles.length; i++) {
      await parseMarkdownFile(mdFiles[i]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mdFiles = files.filter(f => f.name.endsWith(".md"));

    // Process all files - navigation happens in parseMarkdownFile for the last one
    for (const file of mdFiles) {
      await parseMarkdownFile(file);
    }

    // Reset input
    e.target.value = "";
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <UserMenu
            userName="Sarah Chen"
            userEmail="sarah.chen@iohk.io"
            userAvatar="/admin-avatar.png"
            role="admin"
          />
        </div>
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
              {editingArticle ? "Edit Knowledge Asset" : "Create New Knowledge Asset"}
            </h2>

            {!editingArticle && (
              <>
                {/* Auto-import section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Automatically Create New Knowledge Asset</h3>
                  <Card
                    className={`border-2 border-dashed transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-950/30"
                        : "bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
                    } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="p-6">
                      <div className="flex flex-col items-center justify-center text-center gap-4">
                        <div className={`p-4 rounded-full transition-colors ${isDragging ? "bg-blue-200 dark:bg-blue-900/40" : "bg-blue-100/80 dark:bg-blue-900/30"}`}>
                          {isProcessing ? (
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          ) : (
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">
                            {isProcessing ? "Processing..." : "Import Markdown Files"}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop .md files here, or click to browse
                          </p>
                          <input
                            type="file"
                            accept=".md"
                            multiple
                            onChange={handleFileInput}
                            className="hidden"
                            id="md-file-input"
                            disabled={isProcessing}
                          />
                          <label htmlFor="md-file-input">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              disabled={isProcessing}
                            >
                              <span className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Files
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Divider with OR */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Manual creation section */}
                <h3 className="text-lg font-semibold mb-4">Manually Create Knowledge Asset</h3>
              </>
            )}

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
      <div className="absolute top-4 right-4">
        <UserMenu
          userName="Sarah Chen"
          userEmail="sarah.chen@iohk.io"
          userAvatar="/admin-avatar.png"
          role="admin"
        />
      </div>
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
