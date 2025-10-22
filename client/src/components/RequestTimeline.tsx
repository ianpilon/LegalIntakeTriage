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

  // Special handling: if status is not in the normal flow (e.g., awaiting_info, declined),
  // we should still show "Submitted" as completed
  const showSubmittedAsComplete = currentIndex === -1;

  return (
    <div className="flex items-center w-full" data-testid="timeline-request">
      {timelineSteps.map((step, index) => {
        // Always mark submitted as completed, or use normal logic
        const isCompleted = (index === 0 && showSubmittedAsComplete) || index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex items-center" style={{ flex: index === timelineSteps.length - 1 ? '0 0 auto' : '1 1 0%' }}>
            <div className="flex flex-col items-center">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${isCompleted
                  ? 'bg-primary border-primary'
                  : 'bg-background border-border'
                }
                ${isCurrent ? 'ring-2 ring-primary/20' : ''}
              `}>
                {isCompleted && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium whitespace-nowrap
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
