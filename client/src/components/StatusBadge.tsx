import { Badge } from "@/components/ui/badge";
import { RequestStatusType, RequestStatus } from "@shared/schema";
import { Clock, CheckCircle2, FileCheck, Send } from "lucide-react";

interface StatusBadgeProps {
  status: RequestStatusType;
}

const statusConfig = {
  [RequestStatus.SUBMITTED]: {
    label: "Submitted",
    icon: Send,
    className: "bg-info/10 text-info border-info/20"
  },
  [RequestStatus.TRIAGED]: {
    label: "Triaged",
    icon: FileCheck,
    className: "bg-warning/10 text-warning border-warning/20"
  },
  [RequestStatus.IN_REVIEW]: {
    label: "In Review",
    icon: Clock,
    className: "bg-primary/10 text-primary border-primary/20"
  },
  [RequestStatus.COMPLETED]: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/20"
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} font-medium px-3 py-1`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="w-3 h-3 mr-1.5" />
      {config.label}
    </Badge>
  );
}
