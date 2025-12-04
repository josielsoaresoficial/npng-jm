import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, TrendingUp, Calendar, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSession {
  id: string;
  workout_id: string;
  duration_minutes: number;
  completed_at: string;
  workout?: {
    name: string;
  };
}

const WorkoutTimePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscar dados de treino da semana
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['workout-time-weekly', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const result: { day: string; minutes: number; exercises: number; date: string }[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        
        const dayName = days[startDate.getDay()];
        const dateStr = startDate.toISOString().split('T')[0];

        const { data } = await supabase
          .from('workout_history')
          .select('duration_minutes, exercises_completed')
          .eq('user_id', user.id)
          .gte('completed_at', startDate.toISOString())
          .lt('completed_at', endDate.toISOString());

        const totalMinutes = data?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0;
        const totalExercises = data?.reduce((sum, w) => {
          const exercises = w.exercises_completed as any[] || [];
          return sum + exercises.length;
        }, 0) || 0;

        result.push({ day: dayName, minutes: totalMinutes, exercises: totalExercises, date: dateStr });
      }
      
      return result;
    },
    enabled: !!user?.id,
  });

  // Buscar sessões recentes
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['workout-sessions-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('workout_history')
        .select(`
          id,
          workout_id,
          duration_minutes,
          completed_at,
          workouts (name)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      return (data || []).map(session => ({
        ...session,
        workout: session.workouts as { name: string } | null
      }));
    },
    enabled: !!user?.id,
  });

  // Calcular tempo de hoje
  const todayMinutes = weeklyData?.[weeklyData.length - 1]?.minutes || 0;
  
  // Calcular total semanal
  const totalWeeklyMinutes = weeklyData?.reduce((acc, day) => acc + day.minutes, 0) || 0;
  const weeklyGoal = 300; // Meta de 300 minutos por semana

  // Formatar data relativa
  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === today.getTime()) return 'Hoje';
    if (sessionDate.getTime() === yesterday.getTime()) return 'Ontem';
    
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} dias atrás`;
  };

  const isLoading = weeklyLoading || sessionsLoading;

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/progress")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tempo de Treino</h1>
            <p className="text-muted-foreground">Estatísticas e histórico de sessões</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-primary">{todayMinutes}min</div>
                  <div className="text-sm text-muted-foreground">tempo de treino</div>
                  {todayMinutes > 0 && (
                    <div className="text-xs text-green-500 mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Excelente ritmo!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Resumo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <>
                  <div className="text-center p-4 rounded-lg bg-gradient-fitness-subtle">
                    <div className="text-3xl font-bold text-primary">{totalWeeklyMinutes}min</div>
                    <div className="text-sm text-muted-foreground">tempo total esta semana</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meta Semanal</span>
                      <span>{totalWeeklyMinutes} / {weeklyGoal} min</span>
                    </div>
                    <Progress value={(totalWeeklyMinutes / weeklyGoal) * 100} className="h-2" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Histórico Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {weeklyData?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{item.day}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.exercises > 0 ? `${item.exercises} exercícios` : 'Descanso'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.minutes > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          {item.minutes}min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sessões Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium">{session.workout?.name || 'Treino Personalizado'}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeDate(session.completed_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{session.duration_minutes || 0}min</p>
                        <p className="text-xs text-green-500">✓ Completo</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma sessão registrada ainda</p>
                  <p className="text-sm">Complete um treino para ver seu histórico</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WorkoutTimePage;