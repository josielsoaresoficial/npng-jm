import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Utensils } from "lucide-react";
import { useState } from "react";
import { LiquidGlassWrapper } from "@/components/liquid-glass/LiquidGlassWrapper";

interface DietMealCardProps {
  meal: {
    time: string;
    type: string;
    description: string;
    details?: string[];
  };
  onComplete?: (completed: boolean) => void;
}

export const DietMealCard = ({ meal, onComplete }: DietMealCardProps) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsCompleted(checked);
    onComplete?.(checked);
  };

  return (
    <LiquidGlassWrapper variant="nutrition" className={`p-4 transition-all ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{meal.time}</span>
            <span className="text-sm font-semibold">•</span>
            <span className="text-sm font-semibold">{meal.type}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <Utensils className="w-4 h-4 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm">{meal.description}</p>
              {meal.details && meal.details.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {meal.details.map((detail, index) => (
                    <li key={index} className="text-xs text-muted-foreground pl-4">
                      • {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </LiquidGlassWrapper>
  );
};
