import { Card, CardContent } from "@/components/ui/card";

interface MuscleGroupCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  exerciseCount?: number;
}

export function MuscleGroupCard({ name, icon, color, isSelected, onClick, exerciseCount = 0 }: MuscleGroupCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 ${
        isSelected ? 'ring-2 ring-primary shadow-xl scale-105' : ''
      }`}
      onClick={onClick}
      style={{
        borderColor: isSelected ? color : undefined,
        backgroundColor: isSelected ? `${color}15` : undefined
      }}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center gap-3 relative">
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ 
            backgroundColor: `${color}20`,
            boxShadow: isSelected ? `0 0 20px ${color}40` : undefined
          }}
        >
          <img 
            src={icon} 
            alt={name} 
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="text-center w-full">
          <span className="text-sm font-semibold block">{name}</span>
          {exerciseCount > 0 && (
            <span className="text-xs text-muted-foreground block mt-1">
              {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
