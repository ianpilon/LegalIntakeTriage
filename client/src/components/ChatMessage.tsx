import { Bot, User } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { detectTemplates, type Template } from "@/lib/templateRegistry";
import { detectCategories, type RequestCategory } from "@/lib/categoryRegistry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const [, setLocation] = useLocation();
  const [pendingNavigation, setPendingNavigation] = useState<{
    path: string;
    item: Template | RequestCategory;
    type: 'template' | 'category';
  } | null>(null);

  // Detect templates and categories in assistant messages only
  const renderContent = () => {
    if (!isAssistant) {
      return <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>;
    }

    const templateDetections = detectTemplates(content);
    const categoryDetections = detectCategories(content);

    // Combine all detections
    const allDetections: Array<{
      startIndex: number;
      endIndex: number;
      match: string;
      path: string;
      item: Template | RequestCategory;
      type: 'template' | 'category';
    }> = [
      ...templateDetections.map(d => ({
        startIndex: d.startIndex,
        endIndex: d.endIndex,
        match: d.match,
        path: d.template.path,
        item: d.template,
        type: 'template' as const
      })),
      ...categoryDetections.map(d => ({
        startIndex: d.startIndex,
        endIndex: d.endIndex,
        match: d.match,
        path: d.category.path,
        item: d.category,
        type: 'category' as const
      }))
    ];

    if (allDetections.length === 0) {
      return <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>;
    }

    // Sort by start index and remove overlaps
    allDetections.sort((a, b) => a.startIndex - b.startIndex);
    const nonOverlapping: typeof allDetections = [];
    let lastEnd = -1;

    for (const detection of allDetections) {
      if (detection.startIndex >= lastEnd) {
        nonOverlapping.push(detection);
        lastEnd = detection.endIndex;
      }
    }

    // Split content into parts with links
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    nonOverlapping.forEach((detection, idx) => {
      // Add text before the link
      if (detection.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {content.substring(lastIndex, detection.startIndex)}
          </span>
        );
      }

      // Add the link
      parts.push(
        <button
          key={`link-${idx}`}
          onClick={() => setPendingNavigation({
            path: detection.path,
            item: detection.item,
            type: detection.type
          })}
          className="text-primary underline hover:text-primary/80 font-medium transition-colors cursor-pointer"
        >
          {detection.match}
        </button>
      );

      lastIndex = detection.endIndex;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return <p className="text-base leading-relaxed whitespace-pre-wrap">{parts}</p>;
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigation) {
      setLocation(pendingNavigation.path);
      setPendingNavigation(null);
    }
  };

  return (
    <>
      <div className={`flex gap-4 mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
        {isAssistant && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <div className={`
          max-w-prose p-4 rounded-xl
          ${isAssistant
            ? 'bg-card text-foreground'
            : 'bg-primary/10 text-primary-foreground border border-primary/20'
          }
        `}>
          {renderContent()}
        </div>
        {!isAssistant && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingNavigation} onOpenChange={() => setPendingNavigation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingNavigation?.item.description}
              <br /><br />
              You will be taken out of this chat and can return later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay in chat</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              {pendingNavigation?.type === 'template' ? 'View template' : 'Start a Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
