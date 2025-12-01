import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDiet21Days } from "@/hooks/useDiet21Days";
import { DietProgressHeader } from "@/components/DietProgressHeader";
import { DietMealCard } from "@/components/DietMealCard";
import { DietDayTips } from "@/components/DietDayTips";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Diet21Days = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollment, dailyPlan, loading, currentDay, createEnrollment, advanceDay, navigateToDay, getProgress } = useDiet21Days();
  const [fitnessGoal, setFitnessGoal] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('fitness_goal')
        .eq('user_id', user.id)
        .single();

      if (profile?.fitness_goal !== 'weight_loss') {
        navigate('/nutrition');
        return;
      }

      setFitnessGoal(profile.fitness_goal);
    };

    checkAccess();
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && !enrollment && fitnessGoal === 'weight_loss') {
      setShowWelcome(true);
    }
  }, [loading, enrollment, fitnessGoal]);

  const handleStartDiet = () => {
    createEnrollment();
    setShowWelcome(false);
  };

  if (loading || fitnessGoal === null) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  const progress = getProgress();

  // Função para extrair meals do dailyPlan
  const getMeals = () => {
    if (!dailyPlan?.meals) return [];
    
    try {
      // Se meals já é um array, retornar diretamente
      if (Array.isArray(dailyPlan.meals)) {
        return dailyPlan.meals;
      }
      
      // Se meals é string JSON, fazer parse
      if (typeof dailyPlan.meals === 'string') {
        return JSON.parse(dailyPlan.meals);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao processar meals:', error);
      return [];
    }
  };

  const meals = getMeals();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/nutrition')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className="text-2xl font-bold">Dieta de 21 Dias</h1>
          
          <div className="w-20" />
        </div>

        {enrollment && dailyPlan && (
          <>
            {/* Progress Header */}
            <DietProgressHeader
              currentDay={progress.currentDay}
              totalDays={progress.totalDays}
              weekNumber={progress.weekNumber}
              percentage={progress.percentage}
            />

            {/* Banner Motivacional */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <Calendar className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {dailyPlan.is_weekend ? 'Fim de Semana - Recarga de Carboidratos' : `Dia ${currentDay} - Semana ${progress.weekNumber}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dailyPlan.is_training_day 
                      ? '🏋️ Hoje é dia de treino! Lembre-se de consumir proteínas após o exercício.'
                      : '😌 Dia de descanso. Foque na alimentação e recuperação.'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jejum intermitente: {dailyPlan.fasting_hours}h
                  </p>
                </div>
              </div>
            </Card>

            {/* Plano de Refeições */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                📋 Plano de Refeições do Dia
              </h2>
              
              {meals.length > 0 ? (
                meals.map((meal: any, index: number) => (
                  <DietMealCard key={index} meal={meal} />
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <p>Nenhuma refeição disponível para este dia.</p>
                </Card>
              )}
            </div>

            {/* Dicas do Dia */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">💡 Dicas e Informações</h2>
              <DietDayTips
                tips={dailyPlan.tips}
                isTrainingDay={dailyPlan.is_training_day}
                fastingHours={dailyPlan.fasting_hours}
              />
            </div>

            {/* Navegação entre dias */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => navigateToDay(currentDay - 1)}
                disabled={currentDay <= 1}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dia Anterior
              </Button>

              <Button
                onClick={advanceDay}
                disabled={currentDay >= 21}
                className="flex-1"
              >
                Próximo Dia
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Welcome Dialog */}
        <AlertDialog open={showWelcome} onOpenChange={setShowWelcome}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Bem-vindo à Dieta de 21 Dias! 🎉</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 text-base">
                <p>
                  Você está prestes a iniciar uma jornada transformadora de emagrecimento saudável!
                </p>
                <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-foreground">O que você vai encontrar:</p>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Plano alimentar completo para 21 dias</li>
                    <li>✅ Jejum intermitente estruturado</li>
                    <li>✅ Receitas low-carb deliciosas</li>
                    <li>✅ Dicas diárias personalizadas</li>
                    <li>✅ Acompanhamento de progresso</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Com dedicação e consistência, você pode perder de <strong>5 a 15kg</strong> em 21 dias de forma saudável!
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => navigate('/nutrition')}>
                Depois
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleStartDiet}>
                Iniciar Dieta Agora
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Diet21Days;
