import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Target, 
  ChevronLeft,
  CheckCircle2,
  Circle,
  Flame,
  TrendingDown,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/Layout";
import { useDiet21 } from "@/hooks/useDiet21";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Diet21Days = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    program,
    enrollment, 
    dailyPlan, 
    isEnrolled, 
    isLoading,
    startDiet,
    markMealComplete,
    nextDay,
    getProgress,
    getWeekNumber,
    getDaysRemaining
  } = useDiet21();

  const [showStartDialog, setShowStartDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Se não está inscrito, mostrar tela de boas-vindas
  if (!isLoading && !isEnrolled) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl">Dieta de 21 Dias</CardTitle>
                <CardDescription className="text-base">
                  Programa de emagrecimento saudável baseado em jejum intermitente e alimentação low-carb
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-center">
                  <p className="text-muted-foreground">
                    Perca de <span className="font-bold text-foreground">5 a 15kg</span> em 21 dias de forma sustentável
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">21</div>
                      <div className="text-xs text-muted-foreground">Dias</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">5</div>
                      <div className="text-xs text-muted-foreground">Refeições/dia</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">14h+</div>
                      <div className="text-xs text-muted-foreground">Jejum</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => startDiet({})}
                  className="w-full" 
                  size="lg"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Iniciar Dieta Agora
                </Button>

                <Button 
                  onClick={() => navigate("/nutrition")}
                  variant="outline" 
                  className="w-full"
                >
                  Voltar para Nutrição
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  const progress = getProgress();
  const weekNumber = getWeekNumber();
  const daysRemaining = getDaysRemaining();
  const currentDay = enrollment?.current_day || 1;
  const isCompleted = enrollment?.status === 'completed';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/nutrition")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Badge variant="outline" className="gap-2">
            <Calendar className="w-3 h-3" />
            Semana {weekNumber}
          </Badge>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Dieta de 21 Dias</CardTitle>
                <CardDescription>
                  {isCompleted ? "Programa concluído! 🎉" : `Dia ${currentDay} de 21`}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                <div className="text-xs text-muted-foreground">Completo</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{daysRemaining}</div>
                  <div className="text-xs text-muted-foreground">Dias restantes</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingDown className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">
                    {enrollment?.target_weight_loss || "5-15"}kg
                  </div>
                  <div className="text-xs text-muted-foreground">Meta de perda</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Plan Card */}
        {dailyPlan && !isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Plano do Dia {currentDay}
              </CardTitle>
              <CardDescription>
                Jejum de {dailyPlan.fasting_hours}h • {dailyPlan.is_weekend ? "Fim de semana (recarga)" : "Dia de semana"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meals */}
              <div className="space-y-3">
                {dailyPlan.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={meal.completed}
                      onCheckedChange={(checked) => 
                        markMealComplete({ mealIndex: index, completed: checked as boolean })
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{meal.type}</div>
                        <Badge variant="outline" className="text-xs">
                          {meal.time}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {meal.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {dailyPlan.tips && dailyPlan.tips.length > 0 && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Dicas do dia</div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {dailyPlan.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Day Button */}
              <Button
                onClick={() => nextDay()}
                className="w-full"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Concluir Dia {currentDay}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {isCompleted && (
          <Card className="border-2 border-primary">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Parabéns! 🎉</h3>
                <p className="text-muted-foreground mt-2">
                  Você completou os 21 dias da dieta!
                </p>
              </div>
              <Button onClick={() => navigate("/progress")} className="mt-4">
                Ver Progresso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Calendar Visual */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário dos 21 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
                const isPast = day < currentDay;
                const isCurrent = day === currentDay;
                const isFuture = day > currentDay;

                return (
                  <div
                    key={day}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                      transition-all
                      ${isPast ? 'bg-primary text-primary-foreground' : ''}
                      ${isCurrent ? 'bg-primary/50 text-primary-foreground ring-2 ring-primary' : ''}
                      ${isFuture ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Diet21Days;
