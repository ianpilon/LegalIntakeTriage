import { useState } from "react";
import { useLocation } from "wouter";
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
  Loader2
} from "lucide-react";
import { RequestCategory, type RequestCategoryType } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<RequestCategoryType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    submitterName: "",
    submitterEmail: "",
    submitterTeam: "",
    urgencyReason: "",
    isUrgent: false
  });

  const { data: attorneys } = useQuery({
    queryKey: ["/api/attorneys/available"]
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/requests", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setLocation(`/request-submitted?id=${data.request.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCategorySelect = (categoryId: RequestCategoryType) => {
    setSelectedCategory(categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    createRequestMutation.mutate({
      category: selectedCategory,
      title: formData.title,
      description: formData.description,
      submitterName: formData.submitterName,
      submitterEmail: formData.submitterEmail,
      submitterTeam: formData.submitterTeam,
      urgencyReason: formData.isUrgent ? formData.urgencyReason : undefined,
      status: "submitted",
      fileUrls: [],
      metadata: {}
    });
  };

  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);
  const assignedAttorney = attorneys?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                  <Select value={formData.submitterTeam} onValueChange={(value) => setFormData({ ...formData, submitterTeam: value })}>
                    <SelectTrigger id="submitter-team" data-testid="select-team">
                      <SelectValue placeholder="Select your team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Card className="p-8 border-2 border-dashed hover-elevate cursor-pointer mt-2">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports .docx, .pdf, .xlsx, and Google Docs links
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="is-urgent"
                    checked={formData.isUrgent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked as boolean })}
                    data-testid="checkbox-urgent"
                  />
                  <div className="flex-1">
                    <Label htmlFor="is-urgent" className="cursor-pointer">
                      This is urgent
                    </Label>
                    {formData.isUrgent && (
                      <Input
                        placeholder="Why is this urgent?"
                        className="mt-2"
                        value={formData.urgencyReason}
                        onChange={(e) => setFormData({ ...formData, urgencyReason: e.target.value })}
                        data-testid="input-urgency-reason"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {assignedAttorney && (
              <Card className="p-6 bg-muted/20">
                <h3 className="font-semibold text-lg mb-4">Request Summary</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-sm text-muted-foreground">Will be assigned to:</span>
                    <AttorneyCard
                      attorney={assignedAttorney}
                      expectedTimeline="2-3 business days"
                    />
                  </div>
                </div>
              </Card>
            )}

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
