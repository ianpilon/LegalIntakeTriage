import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategoryCard } from "@/components/CategoryCard";
import { AttorneyCard } from "@/components/AttorneyCard";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserMenu } from "@/components/UserMenu";
import { useUser } from "@/contexts/UserContext";
import {
  FileText,
  Megaphone,
  Handshake,
  Users,
  Shield,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  File
} from "lucide-react";
import { RequestCategory, type RequestCategoryType } from "@shared/schema";

const categories = [
  {
    id: RequestCategory.CONTRACT_REVIEW,
    icon: FileText,
    title: "Contract Review",
    description: "NDAs, vendor agreements, terms of service, and other contracts"
  },
  {
    id: RequestCategory.MARKETING,
    icon: Megaphone,
    title: "Marketing/Advertising Review",
    description: "Ad claims, promotional content, social media campaigns"
  },
  {
    id: RequestCategory.PARTNERSHIP,
    icon: Handshake,
    title: "Partnership/Vendor Questions",
    description: "Third-party relationships, vendor onboarding, partnerships"
  },
  {
    id: RequestCategory.EMPLOYMENT,
    icon: Users,
    title: "Employment/HR Matters",
    description: "Hiring, termination, employee agreements, workplace issues"
  },
  {
    id: RequestCategory.REGULATORY,
    icon: Shield,
    title: "Regulatory/Compliance",
    description: "Industry regulations, compliance requirements, certifications"
  },
  {
    id: RequestCategory.IP,
    icon: Lightbulb,
    title: "Intellectual Property",
    description: "Trademarks, copyrights, patents, licensing"
  },
  {
    id: RequestCategory.OTHER,
    icon: HelpCircle,
    title: "Other Legal Question",
    description: "General legal questions or matters not listed above"
  }
];

export default function DirectPath() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<RequestCategoryType | null>(null);

  // Auto-populate user data from their profile
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submitterName: user.name,
    submitterEmail: user.email,
    submitterTeam: user.team
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Check for category in URL params and auto-select
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const categoryParam = params.get('category');
    if (categoryParam && !selectedCategory) {
      // The URL param might be in different formats:
      // - "employment" (lowercase)
      // - "contract_review" (with underscore)
      // We need to match against the VALUES of RequestCategory enum
      const normalizedParam = categoryParam.toLowerCase().replace(/-/g, '_');

      // Check if this matches any of the enum values
      if (Object.values(RequestCategory).includes(normalizedParam as RequestCategoryType)) {
        setSelectedCategory(normalizedParam as RequestCategoryType);
      }
    }
  }, [searchParams, selectedCategory]);

  const { data: attorneys } = useQuery({
    queryKey: ["/api/attorneys/available"]
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setLocation(`/request-submitted?id=${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) added successfully`
      });
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) added successfully`
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "File has been removed from the upload list"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCategorySelect = (categoryId: RequestCategoryType) => {
    setSelectedCategory(categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) return;

    // Convert files to data URLs for demo purposes
    // In production, these would be uploaded to a server/cloud storage
    const fileUrls = await Promise.all(
      uploadedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(file.name); // Just store file name for now
          };
          reader.readAsDataURL(file);
        });
      })
    );

    createRequestMutation.mutate({
      category: selectedCategory,
      title: formData.title,
      description: formData.description,
      submitterName: formData.submitterName,
      submitterEmail: formData.submitterEmail,
      submitterTeam: formData.submitterTeam,
      status: "submitted",
      fileUrls: fileUrls,
      metadata: {
        fileCount: uploadedFiles.length,
        fileNames: uploadedFiles.map(f => f.name)
      }
    });
  };

  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  const assignedAttorney = attorneys?.[0];

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
          <h1 className="text-3xl font-bold mb-2">Fast-Track Request</h1>
          <p className="text-muted-foreground">
            Select your request type and provide the necessary details
          </p>
        </div>

        {!selectedCategory ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What type of legal support do you need?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  onClick={() => handleCategorySelect(category.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                {selectedCategoryInfo && (
                  <>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <selectedCategoryInfo.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedCategoryInfo.title}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCategoryInfo.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      data-testid="button-change-category"
                    >
                      Change
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="submitter-name">Your Name *</Label>
                  <Input
                    id="submitter-name"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    data-testid="input-submitter-name"
                  />
                </div>

                <div>
                  <Label htmlFor="submitter-email">Your Email *</Label>
                  <Input
                    id="submitter-email"
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    data-testid="input-submitter-email"
                  />
                </div>

                <div>
                  <Label htmlFor="submitter-team">Your Team</Label>
                  <Input
                    id="submitter-team"
                    value={formData.submitterTeam}
                    onChange={(e) => setFormData({ ...formData, submitterTeam: e.target.value })}
                    placeholder="Enter your team name"
                    data-testid="input-team"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Brief Title *</Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g., NDA review for Acme Corp"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    required
                    placeholder="Provide all relevant details..."
                    className="min-h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="input-description"
                  />
                </div>

                <div>
                  <Label>Attach Documents</Label>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".pdf,.docx,.xlsx,.doc,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload">
                    <Card
                      className={`p-8 border-2 border-dashed cursor-pointer mt-2 transition-all ${
                        isDragging
                          ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/40'
                          : 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-3 rounded-full bg-blue-100/80 dark:bg-blue-900/30 mb-3">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports .docx, .pdf, .xlsx, and more
                        </p>
                      </div>
                    </Card>
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</Label>
                      {uploadedFiles.map((file, index) => (
                        <Card key={index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                size="lg" 
                className="flex-1" 
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-request"
              >
                {createRequestMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setSelectedCategory(null)}
                disabled={createRequestMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
