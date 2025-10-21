import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Info, BookOpen, ArrowRight } from "lucide-react";
import { TriageOutcomeType, TriageOutcome } from "@shared/schema";

interface OutcomeCardProps {
  outcome: TriageOutcomeType;
  reasoning: string;
  recommendations?: string[];
  onCreateRequest?: () => void;
  onViewArticles?: () => void;
}

const outcomeConfig = {
  [TriageOutcome.NEEDS_REVIEW]: {
    icon: CheckCircle2,
    title: "Legal Review Recommended",
    iconBgColor: "bg-success/10",
    iconTextColor: "text-success",
    bgColor: "bg-success/5",
    borderColor: "border-success/20"
  },
  [TriageOutcome.MIGHT_NEED]: {
    icon: AlertTriangle,
    title: "Might Need Review",
    iconBgColor: "bg-warning/10",
    iconTextColor: "text-warning",
    bgColor: "bg-warning/5",
    borderColor: "border-warning/20"
  },
  [TriageOutcome.LIKELY_FINE]: {
    icon: Info,
    title: "Likely Fine to Proceed",
    iconBgColor: "bg-info/10",
    iconTextColor: "text-info",
    bgColor: "bg-info/5",
    borderColor: "border-info/20"
  },
  [TriageOutcome.SELF_SERVICE]: {
    icon: BookOpen,
    title: "Self-Service Resources Available",
    iconBgColor: "bg-info/10",
    iconTextColor: "text-info",
    bgColor: "bg-info/5",
    borderColor: "border-info/20"
  }
};

export function OutcomeCard({ 
  outcome, 
  reasoning, 
  recommendations,
  onCreateRequest,
  onViewArticles 
}: OutcomeCardProps) {
  const config = outcomeConfig[outcome];
  const Icon = config.icon;

  return (
    <Card className={`p-6 border-2 ${config.borderColor} ${config.bgColor}`} data-testid={`card-outcome-${outcome}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-2 rounded-lg ${config.iconBgColor}`}>
          <Icon className={`w-6 h-6 ${config.iconTextColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
          <p className="text-base text-foreground leading-relaxed">{reasoning}</p>
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mb-4 pl-14">
          <h4 className="font-medium text-sm mb-2">What to prepare:</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mt-6 pl-14">
        {outcome !== TriageOutcome.SELF_SERVICE && onCreateRequest && (
          <Button onClick={onCreateRequest} data-testid="button-create-request">
            Create Request
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {outcome === TriageOutcome.SELF_SERVICE && onViewArticles && (
          <Button onClick={onViewArticles} data-testid="button-view-articles">
            View Resources
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        {outcome !== TriageOutcome.NEEDS_REVIEW && onCreateRequest && (
          <Button variant="outline" onClick={onCreateRequest} data-testid="button-still-create-request">
            Still want to talk to someone?
          </Button>
        )}
      </div>
    </Card>
  );
}
