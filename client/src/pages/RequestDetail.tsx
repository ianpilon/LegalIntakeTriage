import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { RequestTimeline } from "@/components/RequestTimeline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeclineDialog } from "@/components/DeclineDialog";
import { ReassignDialog } from "@/components/ReassignDialog";
import { RequestInfoDialog } from "@/components/RequestInfoDialog";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Users,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  MessageSquare,
  Loader2,
  Paperclip,
  File,
  Download
} from "lucide-react";
import { RequestStatus } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { useRole } from "@/contexts/RoleContext";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: [`/api/requests/${id}`],
    enabled: !!id
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/requests/${id}/accept`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}`] });
      toast({
        title: "Success",
        description: "Request accepted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
    }
  });

  const declineRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiRequest("POST", `/api/requests/${id}/decline`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}`] });
      setDeclineDialogOpen(false);
      toast({
        title: "Success",
        description: "Request declined successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive"
      });
    }
  });

  const reassignRequestMutation = useMutation({
    mutationFn: async ({ attorneyId, notes }: { attorneyId: string; notes?: string }) => {
      const response = await apiRequest("POST", `/api/requests/${id}/reassign`, {
        attorneyId,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}`] });
      setReassignDialogOpen(false);
      toast({
        title: "Success",
        description: "Request reassigned successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reassign request",
        variant: "destructive"
      });
    }
  });

  const requestInfoMutation = useMutation({
    mutationFn: async ({ message, markAsWaiting }: { message: string; markAsWaiting: boolean }) => {
      const response = await apiRequest("POST", `/api/requests/${id}/request-info`, {
        message,
        markAsWaiting
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${id}`] });
      setRequestInfoDialogOpen(false);
      toast({
        title: "Success",
        description: "Information request sent successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send information request",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Request Not Found</h2>
          <p className="text-muted-foreground mb-4">The request you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/legal-inbox")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
        </div>
      </div>
    );
  }

  const getDaysOld = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysOld = getDaysOld(request.createdAt);

  // Get decline reason from metadata
  const declineReason = request.metadata?.declineReason;
  const reassignmentHistory = request.metadata?.reassignmentHistory || [];

  return (
    <div className="min-h-screen bg-background">
      {isAdmin && (
        <div className="absolute top-4 right-4">
          <UserMenu
            userName="Sarah Chen"
            userEmail="sarah.chen@iohk.io"
            userAvatar="/admin-avatar.png"
            role="admin"
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(isAdmin ? "/legal-inbox" : "/my-requests")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isAdmin ? "Back to Inbox" : "Back to My Requests"}
          </Button>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{request.title}</h1>
                {request.urgency === "urgent" && (
                  <Badge variant="destructive" className="font-medium">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {request.referenceNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {daysOld === 0 ? "Today" : `${daysOld} days ago`}
                </span>
                <Badge variant="secondary">
                  {request.category.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0 pt-1">
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Progress</h2>
          <RequestTimeline currentStatus={request.status} />
        </Card>

        {/* Decline Reason Alert */}
        {request.status === RequestStatus.DECLINED && declineReason && (
          <Card className="p-4 mb-6 border-2 border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Request Declined</h3>
                <p className="text-sm text-foreground">{declineReason}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Request Alert */}
        {request.status === RequestStatus.AWAITING_INFO && (
          <Card className="p-4 mb-6 border-2 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-600 mb-1">Awaiting Additional Information</h3>
                <p className="text-sm text-foreground">The submitter has been asked to provide more information.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Request Details */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Request Details</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-foreground whitespace-pre-wrap">{request.description}</p>
            </div>

            {request.aiSummary && (
              <div className="bg-info/5 border-l-4 border-info p-4 rounded">
                <label className="text-sm font-medium text-foreground">AI Summary</label>
                <p className="mt-1 text-sm italic text-foreground">{request.aiSummary}</p>
              </div>
            )}

            {request.urgencyReason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Urgency Reason</label>
                <p className="mt-1 text-foreground">{request.urgencyReason}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Attached Documents */}
        {request.metadata?.fileNames && request.metadata.fileNames.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Attached Documents ({request.metadata.fileNames.length})</h2>
            </div>
            <div className="space-y-2">
              {request.metadata.fileNames.map((fileName: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded with request
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Assignment Details */}
        {(request.attorney || request.expectedTimeline) && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">Assignment Details</h2>
            <div className="flex gap-8">
              {request.attorney && (
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Assigned Attorney</label>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.attorney.photoUrl || undefined} alt={request.attorney.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {request.attorney.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{request.attorney.name}</p>
                      <p className="text-sm text-muted-foreground">{request.attorney.title}</p>
                    </div>
                  </div>
                </div>
              )}
              {request.expectedTimeline && (
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">Expected Timeline</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <p className="text-foreground font-medium">{request.expectedTimeline}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Reassignment History */}
        {reassignmentHistory.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">Reassignment History</h2>
            <div className="space-y-3">
              {reassignmentHistory.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-foreground">
                      Reassigned from <span className="font-medium">{entry.from || "Unassigned"}</span> to{" "}
                      <span className="font-medium">{entry.to}</span>
                    </p>
                    {entry.notes && (
                      <p className="text-muted-foreground mt-1">{entry.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons - Admin Only */}
        {isAdmin && (
          <Card className="p-6">
            <h2 className="font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setReassignDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Reassign
              </Button>
              <Button
                variant="outline"
                onClick={() => setRequestInfoDialogOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Info
              </Button>
              {request.status === RequestStatus.SUBMITTED && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setDeclineDialogOpen(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => acceptRequestMutation.mutate()}
                    disabled={acceptRequestMutation.isPending}
                  >
                    {acceptRequestMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <DeclineDialog
        open={declineDialogOpen}
        onOpenChange={setDeclineDialogOpen}
        onConfirm={(reason) => declineRequestMutation.mutate(reason)}
        isLoading={declineRequestMutation.isPending}
        requestTitle={request.title}
      />

      <ReassignDialog
        open={reassignDialogOpen}
        onOpenChange={setReassignDialogOpen}
        onConfirm={(attorneyId, notes) => reassignRequestMutation.mutate({ attorneyId, notes })}
        isLoading={reassignRequestMutation.isPending}
        requestTitle={request.title}
        currentAttorneyId={request.assignedAttorneyId}
      />

      <RequestInfoDialog
        open={requestInfoDialogOpen}
        onOpenChange={setRequestInfoDialogOpen}
        onConfirm={(message, markAsWaiting) => requestInfoMutation.mutate({ message, markAsWaiting })}
        isLoading={requestInfoMutation.isPending}
        requestTitle={request.title}
      />
    </div>
  );
}
