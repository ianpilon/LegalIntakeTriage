import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  
  return (
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
        <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
