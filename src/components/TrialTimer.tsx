import { Clock } from "lucide-react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { cn } from "@/lib/utils";

interface TrialTimerProps {
  inline?: boolean;
}

export function TrialTimer({ inline = false }: TrialTimerProps) {
  const { isTrialActive, timeRemaining } = useTrialStatus();

  if (!isTrialActive) return null;

  // Converter segundos para HH:MM:SS
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Animação pulsante quando < 1 hora
  const isUrgent = timeRemaining < 3600;

  return (
    <div 
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md",
        "bg-red-500/90 text-white shadow-sm",
        "transition-all duration-300",
        !inline && "fixed top-2 right-2 z-50 backdrop-blur-sm shadow-lg gap-1.5 px-2.5 py-1.5 rounded-lg",
        isUrgent && "animate-pulse"
      )}
    >
      <Clock className="w-3 h-3" />
      <span className="font-mono text-[10px] font-semibold">
        {formattedTime}
      </span>
    </div>
  );
}
