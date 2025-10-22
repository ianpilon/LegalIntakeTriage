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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Briefcase, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Attorney } from "@shared/schema";

interface ReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (attorneyId: string, notes?: string) => void;
  isLoading?: boolean;
  requestTitle?: string;
  currentAttorneyId?: string;
}

export function ReassignDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  requestTitle = "this request",
  currentAttorneyId
}: ReassignDialogProps) {
  const [selectedAttorneyId, setSelectedAttorneyId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const { data: attorneys, isLoading: loadingAttorneys } = useQuery<Attorney[]>({
    queryKey: ["/api/attorneys"],
    enabled: open
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAttorneyId("");
      setNotes("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedAttorneyId) {
      onConfirm(selectedAttorneyId, notes || undefined);
      setSelectedAttorneyId("");
      setNotes("");
    }
  };

  const selectedAttorney = attorneys?.find(a => a.id === selectedAttorneyId);
  const availableAttorneys = attorneys?.filter(a => a.id !== currentAttorneyId) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reassign Request</DialogTitle>
          <DialogDescription>
            Reassign "{requestTitle}" to a different attorney.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="attorney-select">Assigned Attorney *</Label>
            <Select
              value={selectedAttorneyId}
              onValueChange={setSelectedAttorneyId}
              disabled={isLoading || loadingAttorneys}
            >
              <SelectTrigger id="attorney-select">
                <SelectValue placeholder="Select an attorney..." />
              </SelectTrigger>
              <SelectContent>
                {loadingAttorneys ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : availableAttorneys.length === 0 ? (
                  <div className="py-4 px-2 text-sm text-muted-foreground text-center">
                    No other attorneys available
                  </div>
                ) : (
                  availableAttorneys.map((attorney) => (
                    <SelectItem key={attorney.id} value={attorney.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{attorney.name}</span>
                        <span className="text-xs text-muted-foreground">{attorney.title}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedAttorney && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Expertise:</span>
                  <span className="text-muted-foreground">
                    {selectedAttorney.expertise.join(", ") || "General"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Active cases:</span>
                  <span className="text-muted-foreground">
                    {selectedAttorney.activeRequestCount}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedAttorney.availability === "available"
                      ? "bg-success"
                      : selectedAttorney.availability === "busy"
                      ? "bg-warning"
                      : "bg-destructive"
                  }`} />
                  <span className="font-medium">Status:</span>
                  <span className="text-muted-foreground capitalize">
                    {selectedAttorney.availability}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reassign-notes">Notes (optional)</Label>
            <Textarea
              id="reassign-notes"
              placeholder="Add any notes about why you're reassigning this request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20"
              disabled={isLoading}
            />
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
            disabled={!selectedAttorneyId || isLoading || loadingAttorneys}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reassign Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
