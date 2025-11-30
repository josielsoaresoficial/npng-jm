import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GymCardProps {
  id?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: "fitness" | "nutrition" | "default";
  className?: string;
}

export function GymCard({ id, title, description, children, variant = "default", className }: GymCardProps) {
  const variantClasses = {
    fitness: "bg-card border-border/20 hover:border-primary/50 transition-smooth",
    nutrition: "bg-card border-border/20 hover:border-primary/50 transition-smooth", 
    default: "bg-card border-border/20 hover:border-border/40 transition-smooth"
  };

  return (
    <Card id={id} className={cn(variantClasses[variant], className)}>
      <CardHeader>
        <CardTitle className="text-foreground font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}