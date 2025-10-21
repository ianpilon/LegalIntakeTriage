import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { RequestTimeline } from "@/components/RequestTimeline";
import { AttorneyCard } from "@/components/AttorneyCard";
import { ArrowLeft, FileText, Clock, Loader2 } from "lucide-react";
import { RequestStatus, type RequestStatusType } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function MyRequests() {
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests"]
  });

  const filteredRequests = selectedStatus === "all"
    ? requests || []
    : (requests || []).filter((r: any) => r.status === selectedStatus);

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
          <h1 className="text-3xl font-bold mb-2">My Requests</h1>
          <p className="text-muted-foreground">
            Track the status of your legal requests
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {["all", RequestStatus.SUBMITTED, RequestStatus.TRIAGED, RequestStatus.IN_REVIEW, RequestStatus.COMPLETED].map((status) => (
            <Badge
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              className="cursor-pointer hover-elevate px-4 py-2"
              onClick={() => setSelectedStatus(status)}
              data-testid={`filter-status-${status}`}
            >
              {status === "all" ? "All Requests" : status.replace("_", " ")}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-6">
            {filteredRequests.map((request: any) => (
              <Card
                key={request.id}
                className="p-6 hover-elevate cursor-pointer transition-all"
                onClick={() => setLocation(`/request/${request.id}`)}
                data-testid={`card-request-${request.id}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {request.referenceNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">{request.category.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <RequestTimeline currentStatus={request.status as RequestStatusType} />
                </div>

                {request.attorney && (
                  <AttorneyCard
                    attorney={request.attorney}
                    expectedTimeline={request.expectedTimeline}
                  />
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No requests found
            </p>
            <Button onClick={() => setLocation("/")}>
              Create New Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
