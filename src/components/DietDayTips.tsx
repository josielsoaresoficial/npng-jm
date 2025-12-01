import { Card } from "@/components/ui/card";
import { Lightbulb, Droplet, Flame } from "lucide-react";

interface DietDayTipsProps {
  tips?: string[] | null;
  isTrainingDay: boolean;
  fastingHours: number;
}

export const DietDayTips = ({ tips, isTrainingDay, fastingHours }: DietDayTipsProps) => {
  const defaultTips = [
    "Beba pelo menos 2 litros de água ao longo do dia",
    "Evite alimentos processados e açúcares",
    "Prefira gorduras saudáveis como azeite, abacate e castanhas",
  ];

  const displayTips = tips && tips.length > 0 ? tips : defaultTips;

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Flame className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Jejum Intermitente</h3>
            <p className="text-xs text-muted-foreground">
              {fastingHours} horas de jejum hoje
            </p>
          </div>
        </div>
      </Card>

      {isTrainingDay && (
        <Card className="p-4 bg-orange-500/5 border-orange-500/20">
          <div className="flex items-start gap-3">
            <Droplet className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Dia de Treino</h3>
              <p className="text-xs text-muted-foreground">
                Lembre-se de se hidratar extra e consumir proteínas após o treino
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Dicas do Dia</h3>
            <ul className="space-y-2">
              {displayTips.map((tip, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
