import { useSystemStatus } from "@/contexts/SystemStatusContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SystemStatusIndicator() {
  const { isConnected, lastChecked } = useSystemStatus();

  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="relative">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-300",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            {isConnected && (
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">
            {isConnected ? "Backend Connected" : "Backend Disconnected"}
          </div>
          <div className="text-muted-foreground">
            Last checked: {getTimeAgo(lastChecked)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
