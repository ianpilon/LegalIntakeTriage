import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface RequestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string, markAsWaiting: boolean) => void;
  isLoading?: boolean;
  requestTitle?: string;
}

const INFO_REQUEST_TEMPLATES = [
  {
    value: "more_details",
    label: "More Details Required",
    template: "Thank you for your request. To better assist you, we need more details about your specific requirements and what you're hoping to accomplish. Please provide:\n\n1. Specific objectives or goals\n2. Any relevant background information\n3. Timeline expectations\n\nThis will help us provide you with the most appropriate legal support."
  },
  {
    value: "missing_documents",
    label: "Missing Documents",
    template: "We've reviewed your request and need additional supporting documents to proceed. Please provide:\n\n• Relevant contracts or agreements\n• Any related correspondence\n• Supporting documentation\n\nOnce we receive these materials, we'll continue our review."
  },
  {
    value: "timeline_clarification",
    label: "Timeline Clarification",
    template: "To prioritize your request appropriately, we need clarification on your timeline:\n\n• When do you need this completed?\n• Are there any key deadlines we should be aware of?\n• What prompted this request now?\n\nThis information will help us allocate the right resources to your matter."
  },
  {
    value: "budget_info",
    label: "Budget Information",
    template: "To ensure we can meet your needs, we require information about budget and cost considerations:\n\n• Do you have a budget allocated for this work?\n• Are there any cost constraints we should be aware of?\n• Have you obtained necessary approvals?\n\nThis will help us scope the work appropriately."
  },
  {
    value: "custom",
    label: "Custom Message",
    template: ""
  }
];

export function RequestInfoDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  requestTitle = "this request"
}: RequestInfoDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [markAsWaiting, setMarkAsWaiting] = useState<boolean>(true);

  // Update message when template changes
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = INFO_REQUEST_TEMPLATES.find(t => t.value === selectedTemplate);
      if (template) {
        setMessage(template.template);
      }
    } else if (selectedTemplate === "custom") {
      setMessage("");
    }
  }, [selectedTemplate]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplate("");
      setMessage("");
      setMarkAsWaiting(true);
    }
  }, [open]);

  const handleConfirm = () => {
    if (message.trim()) {
      onConfirm(message, markAsWaiting);
      // Don't reset here - let the parent component handle closing the dialog
      // The useEffect will reset the form when the dialog closes
    }
  };

  const canConfirm = selectedTemplate && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request More Information</DialogTitle>
          <DialogDescription>
            Request additional information from the submitter for "{requestTitle}".
            They will receive a notification and can respond through the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>What information do you need?</Label>
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              {INFO_REQUEST_TEMPLATES.map((template) => (
                <div key={template.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={template.value} id={template.value} className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor={template.value} className="font-medium cursor-pointer">
                      {template.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedTemplate && (
            <div className="space-y-2">
              <Label htmlFor="info-message">
                Message to Submitter *
                {selectedTemplate !== "custom" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (You can edit this template)
                  </span>
                )}
              </Label>
              <Textarea
                id="info-message"
                placeholder="Enter your message requesting additional information..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="mark-waiting"
              checked={markAsWaiting}
              onCheckedChange={(checked) => setMarkAsWaiting(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="mark-waiting"
              className="text-sm font-normal cursor-pointer"
            >
              Mark request as "Awaiting Response" (status will update automatically when submitter responds)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
