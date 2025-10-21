import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  selected?: boolean;
  onClick: () => void;
}

export function CategoryCard({ icon: Icon, title, description, selected, onClick }: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      data-testid={`card-category-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`
        p-6 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2
        ${selected ? 'border-2 border-primary bg-primary/5' : 'border-2 border-transparent'}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          p-3 rounded-lg
          ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        `}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}
