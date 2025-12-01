import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DietEnrollment {
  id: string;
  user_id: string;
  diet_program_id: string;
  started_at: string;
  current_day: number;
  status: 'active' | 'paused' | 'completed';
  target_weight_loss: number | null;
  initial_weight: number | null;
}

export interface DailyPlan {
  id: string;
  day_number: number;
  week_number: number;
  is_training_day: boolean;
  is_weekend: boolean;
  meals: Array<{
    time: string;
    type: string;
    description: string;
    completed: boolean;
  }>;
  tips: string[];
  fasting_hours: number;
}

export interface DietProgram {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  target_goal: string;
}

export const useDiet21 = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar programa "Dieta de 21 Dias"
  const { data: program } = useQuery({
    queryKey: ['diet-program'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_programs')
        .select('*')
        .eq('name', 'Dieta de 21 Dias')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as DietProgram;
    },
  });

  // Buscar inscrição do usuário
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['diet-enrollment', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_diet_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as DietEnrollment | null;
    },
    enabled: !!user?.id,
  });

  // Buscar plano diário
  const { data: dailyPlan, isLoading: planLoading } = useQuery({
    queryKey: ['diet-daily-plan', enrollment?.current_day, program?.id],
    queryFn: async () => {
      if (!enrollment?.current_day || !program?.id) return null;

      const { data, error } = await supabase
        .from('diet_daily_plans')
        .select('*')
        .eq('diet_program_id', program.id)
        .eq('day_number', enrollment.current_day)
        .single();

      if (error) throw error;
      return data as unknown as DailyPlan;
    },
    enabled: !!enrollment?.current_day && !!program?.id,
  });

  // Iniciar dieta
  const startDiet = useMutation({
    mutationFn: async ({ initialWeight, targetWeightLoss }: { initialWeight?: number, targetWeightLoss?: number }) => {
      if (!user?.id || !program?.id) throw new Error("Usuário ou programa não encontrado");

      const { data, error } = await supabase
        .from('user_diet_enrollments')
        .insert({
          user_id: user.id,
          diet_program_id: program.id,
          current_day: 1,
          status: 'active',
          initial_weight: initialWeight,
          target_weight_loss: targetWeightLoss,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-enrollment'] });
      toast.success("Dieta iniciada com sucesso! 🎉");
    },
    onError: (error) => {
      console.error('Erro ao iniciar dieta:', error);
      toast.error("Erro ao iniciar dieta");
    },
  });

  // Marcar refeição como concluída
  const markMealComplete = useMutation({
    mutationFn: async ({ mealIndex, completed }: { mealIndex: number, completed: boolean }) => {
      if (!dailyPlan) throw new Error("Plano diário não encontrado");

      const updatedMeals = [...dailyPlan.meals];
      updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], completed };

      const { error } = await supabase
        .from('diet_daily_plans')
        .update({ meals: updatedMeals })
        .eq('id', dailyPlan.id);

      if (error) throw error;
      return updatedMeals;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-daily-plan'] });
    },
  });

  // Avançar para próximo dia
  const nextDay = useMutation({
    mutationFn: async () => {
      if (!enrollment) throw new Error("Inscrição não encontrada");

      const newDay = enrollment.current_day + 1;
      const newStatus = newDay > 21 ? 'completed' : 'active';

      const { error } = await supabase
        .from('user_diet_enrollments')
        .update({ 
          current_day: newDay,
          status: newStatus
        })
        .eq('id', enrollment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-enrollment'] });
      queryClient.invalidateQueries({ queryKey: ['diet-daily-plan'] });
      
      if (enrollment && enrollment.current_day === 21) {
        toast.success("🎉 Parabéns! Você completou os 21 dias!");
      } else {
        toast.success("Dia concluído! Continue assim! 💪");
      }
    },
  });

  // Calcular progresso
  const getProgress = () => {
    if (!enrollment) return 0;
    return (enrollment.current_day / 21) * 100;
  };

  const getWeekNumber = () => {
    if (!enrollment) return 1;
    return Math.ceil(enrollment.current_day / 7);
  };

  const getDaysRemaining = () => {
    if (!enrollment) return 21;
    return 21 - enrollment.current_day + 1;
  };

  return {
    program,
    enrollment,
    dailyPlan,
    isEnrolled: !!enrollment,
    isLoading: enrollmentLoading || planLoading,
    startDiet: startDiet.mutate,
    markMealComplete: markMealComplete.mutate,
    nextDay: nextDay.mutate,
    getProgress,
    getWeekNumber,
    getDaysRemaining,
  };
};
