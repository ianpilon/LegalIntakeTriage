import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AttorneyCard } from "@/components/AttorneyCard";
import { RequestTimeline } from "@/components/RequestTimeline";
import { CheckCircle2, Home, FileText, Loader2 } from "lucide-react";
import { RequestStatus, type LegalRequest, type Attorney, type RequestStatusType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function RequestSubmitted() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const requestId = searchParams.get("id");

  const { data: request, isLoading: requestLoading } = useQuery<LegalRequest>({
    queryKey: [`/api/requests/${requestId}`],
    enabled: !!requestId
  });

  const { data: attorney, isLoading: attorneyLoading } = useQuery<Attorney>({
    queryKey: [`/api/attorneys/${request?.assignedAttorneyId}`],
    enabled: !!request?.assignedAttorneyId
  });

  if (!requestId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">No request ID provided</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (requestLoading || attorneyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Request not found</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Request Submitted Successfully</h1>
          <p className="text-lg text-muted-foreground">
            Your legal request has been received and assigned
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
              <p className="text-xl font-bold" data-testid="text-reference-number">{request.referenceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Expected Response</p>
              <p className="font-semibold">{request.expectedTimeline || "2-3 business days"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4">Request Status</h3>
            <RequestTimeline currentStatus={request.status as RequestStatusType} />
          </div>

          {attorney && (
            <div>
              <h3 className="font-semibold mb-4">Assigned Attorney</h3>
              <AttorneyCard
                attorney={attorney}
                expectedTimeline={request.expectedTimeline || "2-3 business days"}
              />
            </div>
          )}
        </Card>

        <Card className="p-6 bg-muted/20 mb-6">
          <h3 className="font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>You'll receive an email confirmation with your reference number</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{attorney?.name} will review your request and may reach out if more information is needed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>You'll be notified when your request status changes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Track progress anytime in "My Requests"</span>
            </li>
          </ul>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => setLocation("/my-requests")}
            className="flex-1"
            data-testid="button-view-requests"
          >
            <FileText className="w-4 h-4 mr-2" />
            View My Requests
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="flex-1"
            data-testid="button-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
