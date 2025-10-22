import { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface DeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  requestTitle?: string;
}

const DECLINE_REASONS = [
  {
    value: "out_of_scope",
    label: "Out of Scope",
    description: "This request falls outside the scope of legal team services"
  },
  {
    value: "insufficient_info",
    label: "Insufficient Information",
    description: "Not enough details provided to properly assess this request"
  },
  {
    value: "duplicate",
    label: "Duplicate Request",
    description: "This appears to be a duplicate of an existing request"
  },
  {
    value: "other",
    label: "Other Reason",
    description: "Specify a custom reason below"
  }
];

export function DeclineDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  requestTitle = "this request"
}: DeclineDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    let reason = "";

    if (selectedReason === "other") {
      reason = customReason || "No reason provided";
    } else {
      const selected = DECLINE_REASONS.find(r => r.value === selectedReason);
      reason = selected?.label || "No reason provided";
    }

    onConfirm(reason);

    // Reset form
    setSelectedReason("");
    setCustomReason("");
  };

  const canConfirm = selectedReason && (selectedReason !== "other" || customReason.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Decline Request</DialogTitle>
          <DialogDescription>
            Please select a reason for declining {requestTitle}. This will be shared with the requester.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {DECLINE_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                    {reason.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {selectedReason === "other" && (
            <div className="space-y-2 pl-7">
              <Label htmlFor="custom-reason">Custom Reason *</Label>
              <Textarea
                id="custom-reason"
                placeholder="Please explain why you're declining this request..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-24"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedReason("");
              setCustomReason("");
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Decline Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
