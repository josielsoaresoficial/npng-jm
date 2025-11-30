import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  variant?: "fitness" | "nutrition" | "default";
  className?: string;
}

export function StatCard({ icon, title, value, variant = "default", className }: StatCardProps) {
  const variantClasses = {
    fitness: "bg-card/50 border-border/20 hover:border-primary/30 transition-smooth",
    nutrition: "bg-card/50 border-border/20 hover:border-primary/30 transition-smooth",
    default: "bg-card/50 border-border/20 hover:border-border/40 transition-smooth"
  };

  const iconClasses = {
    fitness: "text-primary",
    nutrition: "text-primary",
    default: "text-foreground/60"
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={iconClasses[variant]}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{value}</h3>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}