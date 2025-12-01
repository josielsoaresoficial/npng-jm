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
import { Diet21WelcomeBanner } from "@/components/Diet21WelcomeBanner";
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

  // Nome formatado do usuário
  const userName = profile?.name 
    ? profile.name.trim().split(' ')[0].charAt(0).toUpperCase() + profile.name.trim().split(' ')[0].slice(1).toLowerCase()
    : 'Amigo';

  const proteinGoal = profile?.daily_protein_goal || 120;
  const proteinPercentage = proteinGoal > 0 ? Math.round((nutritionData.protein / proteinGoal) * 100) : 0;
  
  const isLoading = loadingProfile || loadingNutrition || loadingCalories || loadingWeekly;
  
  const todayStats = [
    { icon: <Flame className="w-6 h-6" />, title: "Calorias Queimadas", value: `${caloriesBurned}`, change: caloriesBurned > 0 ? `${caloriesBurned} kcal` : "0 kcal", variant: "fitness" as const, link: "/stats/calories-burned" },
    { icon: <Droplets className="w-6 h-6" />, title: "Água Consumida", value: "1.8L", change: "+5%", variant: "default" as const, link: "/stats/hydration" },
    { icon: <Target className="w-6 h-6" />, title: "Meta de Proteína", value: `${Math.round(nutritionData.protein)}g`, change: `${proteinPercentage}% da meta`, variant: "nutrition" as const, link: "/stats/protein-goal" },
    { icon: <ClockIcon className="w-6 h-6" />, title: "Tempo de Treino", value: "45min", variant: "fitness" as const, link: "/stats/workout-time" },
  ];

  return (
    <Layout>
      <WelcomeVoice />
      <Diet21WelcomeBanner />
      <div className="w-full px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
        ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-3xl font-bold">Olá, {userName}! 👋</h1>
              <div className="md:hidden">
                <ThemeSelector />
              </div>
            </div>
            <p className="motivational-text text-primary font-bold break-words whitespace-normal max-w-full">{motivationalMessage}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/workouts">
              <Button variant="fitness" size="sm">
                <Plus className="w-4 h-4" />
                Novo Treino
              </Button>
            </Link>
            <Link to="/nutrition">
              <Button variant="nutrition" size="sm">
                <Plus className="w-4 h-4" />
                Analisar Refeição
              </Button>
            </Link>
          </div>
        </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {todayStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <div 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Today's Workout */}
          <GymCard 
            variant="fitness"
            title="Treino de Hoje"
            description="Peito e Tríceps - Hipertrofia"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium">3/5 exercícios</span>
              </div>
              <Progress value={60} className="h-2" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-fitness-subtle">
                  <div>
                    <p className="font-medium">Supino reto com barra</p>
                    <p className="text-sm text-muted-foreground">3x12 - 70kg</p>
                  </div>
                  <div className="text-green-500 text-xl">✓</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-fitness-subtle">
                  <div>
                    <p className="font-medium">Supino inclinado</p>
                    <p className="text-sm text-muted-foreground">3x10 - 60kg</p>
                  </div>
                  <div className="text-green-500 text-xl">✓</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-medium text-primary">Crucifixo com halteres</p>
                    <p className="text-sm text-muted-foreground">3x12 - 20kg</p>
                  </div>
                  <div className="text-primary">⏳</div>
                </div>
              </div>
              
              <Link to="/workouts">
                <Button variant="fitness" className="w-full">
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
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">{Math.round(nutritionData.calories)}</div>
                <div className="text-sm text-muted-foreground">kcal consumidas</div>
                <div className={`text-xs mt-1 ${2200 - nutritionData.calories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(Math.round(2200 - nutritionData.calories))} kcal {2200 - nutritionData.calories >= 0 ? 'restantes' : 'acima'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carboidratos</span>
                    <span>{Math.round(nutritionData.carbs)}g / 220g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.carbs / 220) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Proteínas</span>
                    <span>{Math.round(nutritionData.protein)}g / 120g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.protein / 120) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gorduras</span>
                    <span>{Math.round(nutritionData.fat)}g / 60g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.fat / 60) * 100, 100)} className="h-1" />
                </div>
              </div>
              
              <Link to="/nutrition">
                <Button variant="nutrition" className="w-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Refeição
                </Button>
              </Link>
            </div>
          </GymCard>
        </div>

        {/* Weekly Progress */}
        <GymCard 
          title="Progresso Semanal"
          description="Sua evolução nos últimos 7 dias"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-fitness-subtle">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{weeklyProgress?.workoutsCompleted || 0}</div>
              <div className="text-sm text-muted-foreground">Treinos Completos</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
              <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary">{weeklyProgress?.calorieGoalPercentage || 0}%</div>
              <div className="text-sm text-muted-foreground">Meta Calórica</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold">{weeklyProgress?.consecutiveDays || 0}</div>
              <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
            </div>
          </div>
        </GymCard>
      </div>
    </Layout>
  );
};

export default Dashboard;