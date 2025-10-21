import { Check } from "lucide-react";
import { RequestStatusType, RequestStatus } from "@shared/schema";

interface RequestTimelineProps {
  currentStatus: RequestStatusType;
}

const timelineSteps = [
  { status: RequestStatus.SUBMITTED, label: "Submitted" },
  { status: RequestStatus.TRIAGED, label: "Triaged" },
  { status: RequestStatus.IN_REVIEW, label: "In Review" },
  { status: RequestStatus.COMPLETED, label: "Completed" }
];

export function RequestTimeline({ currentStatus }: RequestTimelineProps) {
  const currentIndex = timelineSteps.findIndex(step => step.status === currentStatus);

  return (
    <div className="flex items-center justify-between" data-testid="timeline-request">
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                ${isCompleted 
                  ? 'bg-primary border-primary' 
                  : 'bg-background border-border'
                }
                ${isCurrent ? 'ring-4 ring-primary/20' : ''}
              `}>
                {isCompleted && (
                  <Check className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium
                ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {step.label}
              </span>
            </div>
            {index < timelineSteps.length - 1 && (
              <div className={`
                h-0.5 flex-1 mx-2 transition-all
                ${index < currentIndex ? 'bg-primary' : 'bg-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
