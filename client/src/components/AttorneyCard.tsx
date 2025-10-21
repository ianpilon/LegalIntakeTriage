import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import type { Attorney } from "@shared/schema";

interface AttorneyCardProps {
  attorney: Attorney;
  expectedTimeline?: string;
}

export function AttorneyCard({ attorney, expectedTimeline }: AttorneyCardProps) {
  const initials = attorney.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border" data-testid={`card-attorney-${attorney.id}`}>
      <Avatar className="w-12 h-12">
        <AvatarImage src={attorney.photoUrl || undefined} alt={attorney.name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="font-semibold text-base">{attorney.name}</h4>
        <p className="text-sm text-muted-foreground">{attorney.title}</p>
      </div>
      {expectedTimeline && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{expectedTimeline}</span>
        </div>
      )}
    </div>
  );
}
