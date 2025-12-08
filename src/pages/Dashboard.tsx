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
  useOptimizedWeeklyProgress,
  useOptimizedTodayWorkoutTime
} from "@/hooks/useOptimizedQuery";
import { useHydration } from "@/hooks/useHydration";
import { useTodayWorkout } from "@/hooks/useTodayWorkout";

const Dashboard = () => {
  const { user } = useAuth();
  const motivationalMessage = useMotivationalMessage();
  const { data: profile, isLoading: loadingProfile } = useOptimizedProfile();
  const { data: nutritionData = { calories: 0, protein: 0, carbs: 0, fat: 0 }, isLoading: loadingNutrition } = useOptimizedTodayNutrition();
  const { data: caloriesBurned = 0, isLoading: loadingCalories } = useOptimizedCaloriesBurned();
  const { data: weeklyProgress, isLoading: loadingWeekly } = useOptimizedWeeklyProgress();
  const { data: workoutTime = 0, isLoading: loadingWorkoutTime } = useOptimizedTodayWorkoutTime();
  const { todayHydrationLiters, isLoading: loadingHydration } = useHydration();
  const { data: todayWorkout, isLoading: loadingTodayWorkout } = useTodayWorkout();

  // Nome formatado do usuário
  const userName = profile?.name 
    ? profile.name.trim().split(' ')[0].charAt(0).toUpperCase() + profile.name.trim().split(' ')[0].slice(1).toLowerCase()
    : 'Amigo';

  // Metas do perfil do usuário com fallbacks
  const caloriesGoal = profile?.daily_calories_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 120;
  const carbsGoal = profile?.daily_carbs_goal || 250;
  const fatGoal = profile?.daily_fat_goal || 65;
  
  const proteinPercentage = proteinGoal > 0 ? Math.round((nutritionData.protein / proteinGoal) * 100) : 0;

  return (
    <Layout>
      <WelcomeVoice />
      <div className="w-full px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header - carrega independente, só depende do profile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-3xl font-bold">
                Olá, {loadingProfile ? <Skeleton className="inline-block h-8 w-24" /> : `${userName}!`} 👋
              </h1>
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

        {/* Stats Grid - cada card carrega independentemente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {/* Calorias Queimadas - depende de loadingCalories */}
          <Link to="/stats/calories-burned">
            <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              {loadingCalories ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : (
                <StatCard 
                  icon={<Flame className="w-6 h-6" />} 
                  title="Calorias Queimadas" 
                  value={`${caloriesBurned}`} 
                  variant="fitness" 
                />
              )}
            </div>
          </Link>
          
          {/* Água Consumida - dados reais */}
          <Link to="/stats/hydration">
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              {loadingHydration ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : (
                <StatCard 
                  icon={<Droplets className="w-6 h-6" />} 
                  title="Água Consumida" 
                  value={`${todayHydrationLiters}L`} 
                  variant="default" 
                />
              )}
            </div>
          </Link>
          
          {/* Meta de Proteína - depende de loadingNutrition */}
          <Link to="/stats/protein-goal">
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              {loadingNutrition ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : (
                <StatCard 
                  icon={<Target className="w-6 h-6" />} 
                  title="Meta de Proteína" 
                  value={`${Math.round(nutritionData.protein)}g`} 
                  variant="nutrition" 
                />
              )}
            </div>
          </Link>
          
          {/* Tempo de Treino - dados reais */}
          <Link to="/stats/workout-time">
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              {loadingWorkoutTime ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : (
                <StatCard 
                  icon={<ClockIcon className="w-6 h-6" />} 
                  title="Tempo de Treino" 
                  value={`${workoutTime}min`} 
                  variant="fitness" 
                />
              )}
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Today's Workout */}
          <GymCard 
            variant="fitness"
            title="Treino de Hoje"
            description={todayWorkout ? `${todayWorkout.workoutName} - ${todayWorkout.workoutCategory}` : "Nenhum treino iniciado"}
            className="lg:col-span-2"
          >
            {loadingTodayWorkout ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : todayWorkout ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progresso</span>
                  <span className="text-sm font-medium">{todayWorkout.completedCount}/{todayWorkout.totalCount} exercícios</span>
                </div>
                <Progress value={todayWorkout.progressPercentage} className="h-2" />
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {todayWorkout.exercises.slice(0, 5).map((exercise) => (
                    <div 
                      key={exercise.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        exercise.completed 
                          ? 'bg-gradient-fitness-subtle' 
                          : 'border border-primary/20'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${!exercise.completed ? 'text-primary' : ''}`}>
                          {exercise.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets}x{exercise.reps}
                          {exercise.weight ? ` - ${exercise.weight}kg` : ''}
                        </p>
                      </div>
                      <div className={exercise.completed ? 'text-green-500 text-xl' : 'text-primary'}>
                        {exercise.completed ? '✓' : '⏳'}
                      </div>
                    </div>
                  ))}
                  {todayWorkout.exercises.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{todayWorkout.exercises.length - 5} exercícios
                    </p>
                  )}
                </div>
                
                <Link to="/workouts">
                  <Button variant="fitness" className="w-full">
                    <Zap className="w-4 h-4" />
                    {todayWorkout.isCompleted ? 'Ver Detalhes' : 'Continuar Treino'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 text-center py-6">
                <p className="text-muted-foreground">Você ainda não iniciou nenhum treino hoje.</p>
                <Link to="/workouts">
                  <Button variant="fitness">
                    <Plus className="w-4 h-4" />
                    Começar Treino
                  </Button>
                </Link>
              </div>
            )}
          </GymCard>

        {/* Nutrition Summary - carrega independente */}
          <GymCard 
            variant="nutrition"
            title="Resumo Nutricional"
            description={`Objetivo: ${caloriesGoal.toLocaleString('pt-BR')} kcal`}
          >
            <div className="space-y-4">
              <div className="text-center">
                {loadingNutrition ? (
                  <Skeleton className="h-10 w-20 mx-auto mb-2" />
                ) : (
                  <div className="text-3xl font-bold text-secondary">{Math.round(nutritionData.calories)}</div>
                )}
                <div className="text-sm text-muted-foreground">kcal consumidas</div>
                {!loadingNutrition && (
                  <div className={`text-xs mt-1 ${caloriesGoal - nutritionData.calories >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(Math.round(caloriesGoal - nutritionData.calories))} kcal {caloriesGoal - nutritionData.calories >= 0 ? 'restantes' : 'acima'}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carboidratos</span>
                    <span>{Math.round(nutritionData.carbs)}g / {carbsGoal}g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.carbs / carbsGoal) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Proteínas</span>
                    <span>{Math.round(nutritionData.protein)}g / {proteinGoal}g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.protein / proteinGoal) * 100, 100)} className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gorduras</span>
                    <span>{Math.round(nutritionData.fat)}g / {fatGoal}g</span>
                  </div>
                  <Progress value={Math.min((nutritionData.fat / fatGoal) * 100, 100)} className="h-1" />
                </div>
              </div>
              
              <Link to="/nutrition">
                <Button variant="nutrition" size="sm" className="w-full text-xs h-8 px-3">
                  <Plus className="w-3 h-3" />
                  Adicionar Refeição
                </Button>
              </Link>
            </div>
          </GymCard>
        </div>

        {/* Weekly Progress - carrega independente */}
        <GymCard 
          title="Progresso Semanal"
          description="Sua evolução nos últimos 7 dias"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-fitness-subtle">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              {loadingWeekly ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold text-primary">{weeklyProgress?.workoutsCompleted || 0}</div>
              )}
              <div className="text-sm text-muted-foreground">Treinos Completos</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-gradient-nutrition-subtle">
              <Target className="w-8 h-8 text-secondary mx-auto mb-2" />
              {loadingWeekly ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold text-secondary">{weeklyProgress?.calorieGoalPercentage || 0}%</div>
              )}
              <div className="text-sm text-muted-foreground">Meta Calórica</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              {loadingWeekly ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <div className="text-2xl font-bold">{weeklyProgress?.consecutiveDays || 0}</div>
              )}
              <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
            </div>
          </div>
        </GymCard>
      </div>
    </Layout>
  );
};

export default Dashboard;
