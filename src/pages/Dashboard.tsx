import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { GymCard } from "@/components/GymCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock as ClockIcon, Target, Flame, Droplets, Zap, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useMotivationalMessage } from "@/hooks/useMotivationalMessage";
import { WelcomeVoice } from "@/components/WelcomeVoice";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useOptimizedProfile,
  useOptimizedTodayNutrition,
  useOptimizedCaloriesBurned,
  useOptimizedWeeklyProgress
} from "@/hooks/useOptimizedQuery";

const Dashboard = () => {
  const { user } = useAuth();
  const motivationalMessage = useMotivationalMessage();
  const { data: profile, isLoading: loadingProfile } = useOptimizedProfile();
  const { data: nutritionData, isLoading: loadingNutrition } = useOptimizedTodayNutrition();
  const { data: caloriesBurned = 0, isLoading: loadingCalories } = useOptimizedCaloriesBurned();
  const { data: weeklyProgress, isLoading: loadingWeekly } = useOptimizedWeeklyProgress();

  const userName = profile?.name 
    ? profile.name.trim().split(' ')[0].charAt(0).toUpperCase() + profile.name.trim().split(' ')[0].slice(1).toLowerCase()
    : 'Amigo';

  const proteinGoal = profile?.daily_protein_goal || 120;
  const proteinPercentage = proteinGoal > 0 ? Math.round((nutritionData.protein / proteinGoal) * 100) : 0;
  
  const isLoading = loadingProfile || loadingNutrition || loadingCalories || loadingWeekly;
  
  const todayStats = [
    { icon: <Flame className="w-6 h-6" />, title: "Calorias Queimadas", value: `${caloriesBurned}`, variant: "fitness" as const, link: "/stats/calories-burned" },
    { icon: <Droplets className="w-6 h-6" />, title: "Água Consumida", value: "1.8L", variant: "default" as const, link: "/stats/hydration" },
    { icon: <Target className="w-6 h-6" />, title: "Meta de Proteína", value: `${Math.round(nutritionData.protein)}g`, variant: "nutrition" as const, link: "/stats/protein-goal" },
    { icon: <ClockIcon className="w-6 h-6" />, title: "Tempo de Treino", value: "45min", variant: "fitness" as const, link: "/stats/workout-time" },
  ];

  return (
    <Layout>
      <WelcomeVoice />
      <div className="w-full px-4 md:px-16 py-6 space-y-8 max-w-7xl mx-auto">
        {/* Header Netflix Style */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
        ) : (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-display font-bold text-white">Olá, {userName}!</h1>
            <div className="md:hidden">
              <ThemeSelector />
            </div>
          </div>
          <p className="text-xl text-primary font-medium">{motivationalMessage}</p>
          <div className="flex gap-3">
            <Link to="/workouts">
              <Button variant="netflix" size="default">
                <Plus className="w-4 h-4" />
                Novo Treino
              </Button>
            </Link>
            <Link to="/nutrition">
              <Button variant="netflix-outline" size="default">
                <Plus className="w-4 h-4" />
                Analisar Refeição
              </Button>
            </Link>
          </div>
        </div>
        )}

        {/* Stats Grid - Minimalista */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {todayStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <div 
                className="netflix-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* Main Content - Netflix Cards */}
        <div className="space-y-6 w-full">
          <h2 className="text-2xl font-bold text-white">Continue Assistindo</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Today's Workout - Hero Card */}
            <GymCard 
              variant="fitness"
              title="Treino de Hoje"
              description="Peito e Tríceps - Hipertrofia"
              className="lg:col-span-2 netflix-card-hover"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progresso</span>
                  <span className="text-sm font-semibold">3/5 exercícios</span>
                </div>
                <Progress value={60} className="h-1" />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Supino reto com barra</p>
                      <p className="text-xs text-muted-foreground">3x12 - 70kg</p>
                    </div>
                    <div className="text-green-500">✓</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Supino inclinado</p>
                      <p className="text-xs text-muted-foreground">3x10 - 60kg</p>
                    </div>
                    <div className="text-green-500">✓</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded border border-primary/50">
                    <div>
                      <p className="font-medium text-sm text-primary">Crucifixo com halteres</p>
                      <p className="text-xs text-muted-foreground">3x12 - 20kg</p>
                    </div>
                    <div className="text-primary">⏳</div>
                  </div>
                </div>
                
                <Link to="/workouts">
                  <Button variant="netflix" className="w-full">
                    <Zap className="w-4 h-4" />
                    Continuar Treino
                  </Button>
                </Link>
              </div>
            </GymCard>

            {/* Nutrition Summary */}
            <GymCard 
              variant="nutrition"
              title="Resumo Nutricional"
              description="Objetivo: 2.200 kcal"
              className="netflix-card-hover"
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{Math.round(nutritionData.calories)}</div>
                  <div className="text-sm text-muted-foreground">kcal consumidas</div>
                  <div className={`text-xs mt-1 ${2200 - nutritionData.calories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(Math.round(2200 - nutritionData.calories))} kcal {2200 - nutritionData.calories >= 0 ? 'restantes' : 'acima'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Carboidratos</span>
                      <span className="font-semibold">{Math.round(nutritionData.carbs)}g / 220g</span>
                    </div>
                    <Progress value={Math.min((nutritionData.carbs / 220) * 100, 100)} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Proteínas</span>
                      <span className="font-semibold">{Math.round(nutritionData.protein)}g / 120g</span>
                    </div>
                    <Progress value={Math.min((nutritionData.protein / 120) * 100, 100)} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Gorduras</span>
                      <span className="font-semibold">{Math.round(nutritionData.fat)}g / 60g</span>
                    </div>
                    <Progress value={Math.min((nutritionData.fat / 60) * 100, 100)} className="h-1" />
                  </div>
                </div>
                
                <Link to="/nutrition">
                  <Button variant="netflix" className="w-full">
                    <Plus className="w-4 h-4" />
                    Adicionar Refeição
                  </Button>
                </Link>
              </div>
            </GymCard>
          </div>
        </div>

        {/* Weekly Progress */}
        <GymCard 
          title="Progresso Semanal"
          description="Sua evolução nos últimos 7 dias"
          className="netflix-card-hover"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded bg-muted/30">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{weeklyProgress?.workoutsCompleted || 0}</div>
              <div className="text-sm text-muted-foreground">Treinos Completos</div>
            </div>
            
            <div className="text-center p-4 rounded bg-muted/30">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{weeklyProgress?.calorieGoalPercentage || 0}%</div>
              <div className="text-sm text-muted-foreground">Meta Calórica</div>
            </div>
            
            <div className="text-center p-4 rounded bg-muted/30">
              <Calendar className="w-8 h-8 text-foreground/60 mx-auto mb-2" />
              <div className="text-3xl font-bold">{weeklyProgress?.consecutiveDays || 0}</div>
              <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
            </div>
          </div>
        </GymCard>
      </div>
    </Layout>
  );
};

export default Dashboard;
