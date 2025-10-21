import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Filter, 
  CheckCircle2, 
  UserPlus, 
  MessageSquare,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import { RequestStatus, RequestCategory, type RequestStatusType } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

export default function LegalInbox() {
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests"]
  });

  const filteredRequests = (requests || []).filter((request: any) => {
    const statusMatch = filterStatus === "all" || request.status === filterStatus;
    const categoryMatch = filterCategory === "all" || request.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "border-l-urgent";
      case "high": return "border-l-destructive";
      case "medium": return "border-l-warning";
      default: return "border-l-border";
    }
  };

  const getDaysOld = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold mb-2">Legal Team Inbox</h1>
          <p className="text-muted-foreground">
            Triage and manage incoming legal requests
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={RequestStatus.SUBMITTED}>Submitted</SelectItem>
                  <SelectItem value={RequestStatus.TRIAGED}>Triaged</SelectItem>
                  <SelectItem value={RequestStatus.IN_REVIEW}>In Review</SelectItem>
                  <SelectItem value={RequestStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger data-testid="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={RequestCategory.CONTRACT_REVIEW}>Contracts</SelectItem>
                  <SelectItem value={RequestCategory.MARKETING}>Marketing</SelectItem>
                  <SelectItem value={RequestCategory.EMPLOYMENT}>Employment</SelectItem>
                  <SelectItem value={RequestCategory.PARTNERSHIP}>Partnership</SelectItem>
                  <SelectItem value={RequestCategory.REGULATORY}>Regulatory</SelectItem>
                  <SelectItem value={RequestCategory.IP}>IP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request: any) => {
              const daysOld = getDaysOld(request.createdAt);
              return (
                <Card
                  key={request.id}
                  className={`border-l-4 ${getUrgencyColor(request.urgency)} hover-elevate cursor-pointer transition-all`}
                  onClick={() => setLocation(`/request/${request.id}`)}
                  data-testid={`card-inbox-request-${request.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {request.submitterName.split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.submitterName} • {request.submitterTeam || "Unknown team"} • {request.referenceNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={request.status} />
                            {request.urgency === "urgent" && (
                              <Badge variant="destructive" className="font-medium">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>

                        {request.aiSummary && (
                          <div className="bg-info/5 border-l-4 border-info p-3 rounded mb-4">
                            <p className="text-sm italic text-foreground">
                              <span className="font-medium not-italic">AI Summary:</span> {request.aiSummary}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{daysOld === 0 ? "Today" : `${daysOld} days ago`}</span>
                            <Badge variant="secondary" className="ml-2">
                              {request.category.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              data-testid={`button-reassign-${request.id}`}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Reassign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              data-testid={`button-request-info-${request.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Request Info
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              data-testid={`button-accept-${request.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No requests match the selected filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
