import { Progress } from "@/components/ui/progress";
import { Calendar, Trophy } from "lucide-react";

interface DietProgressHeaderProps {
  currentDay: number;
  totalDays: number;
  weekNumber: number;
  percentage: number;
}

export const DietProgressHeader = ({
  currentDay,
  totalDays,
  weekNumber,
  percentage,
}: DietProgressHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dia {currentDay} de {totalDays}</h2>
          <p className="text-sm text-muted-foreground">Semana {weekNumber}</p>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Trophy className="w-5 h-5" />
          <span className="font-semibold">{percentage}%</span>
        </div>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Faltam {totalDays - currentDay} dias para completar o desafio</span>
      </div>
    </div>
  );
};
