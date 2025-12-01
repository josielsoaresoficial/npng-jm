import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DietEnrollment {
  id: string;
  user_id: string;
  diet_program_id: string;
  current_day: number;
  started_at: string;
  status: string;
  initial_weight?: number;
  target_weight_loss?: number;
  created_at: string;
  updated_at: string;
}

interface DailyPlan {
  id: string;
  diet_program_id: string;
  day_number: number;
  week_number: number;
  is_training_day: boolean;
  is_weekend: boolean;
  fasting_hours: number;
  meals: any;
  tips: string[] | null;
  created_at: string;
}

export const useDiet21Days = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollment, setEnrollment] = useState<DietEnrollment | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);

  // Buscar programa da dieta de 21 dias
  const getDietProgram = async () => {
    const { data, error } = await supabase
      .from('diet_programs')
      .select('id')
      .eq('target_goal', 'weight_loss')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar programa de dieta:', error);
      return null;
    }

    return data;
  };

  // Verificar se usuário está inscrito
  const checkEnrollment = async () => {
    if (!user) return;

    try {
      const program = await getDietProgram();
      if (!program) return;

      const { data, error } = await supabase
        .from('user_diet_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('diet_program_id', program.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setEnrollment(data);
        setCurrentDay(data.current_day);
        await loadDailyPlan(program.id, data.current_day);
      }
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar inscrição na dieta
  const createEnrollment = async (initialWeight?: number, targetWeightLoss?: number) => {
    if (!user) return;

    try {
      const program = await getDietProgram();
      if (!program) {
        toast({
          title: 'Erro',
          description: 'Programa de dieta não encontrado.',
          variant: 'destructive',
        });
        return;
      }

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

      setEnrollment(data);
      setCurrentDay(1);
      await loadDailyPlan(program.id, 1);

      toast({
        title: 'Dieta iniciada! 🎉',
        description: 'Você está pronto para começar sua jornada de 21 dias!',
      });
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a dieta. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Carregar plano do dia
  const loadDailyPlan = async (programId: string, dayNumber: number) => {
    try {
      const { data, error } = await supabase
        .from('diet_daily_plans')
        .select('*')
        .eq('diet_program_id', programId)
        .eq('day_number', dayNumber)
        .single();

      if (error) throw error;

      setDailyPlan(data);
    } catch (error) {
      console.error('Erro ao carregar plano do dia:', error);
    }
  };

  // Avançar para próximo dia
  const advanceDay = async () => {
    if (!enrollment || !user) return;

    const nextDay = currentDay + 1;
    if (nextDay > 21) {
      toast({
        title: 'Parabéns! 🎉',
        description: 'Você completou os 21 dias da dieta!',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_diet_enrollments')
        .update({ current_day: nextDay })
        .eq('id', enrollment.id);

      if (error) throw error;

      setCurrentDay(nextDay);
      await loadDailyPlan(enrollment.diet_program_id, nextDay);

      toast({
        title: `Dia ${nextDay} 🚀`,
        description: 'Continue assim! Você está fazendo um ótimo trabalho.',
      });
    } catch (error) {
      console.error('Erro ao avançar dia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível avançar para o próximo dia.',
        variant: 'destructive',
      });
    }
  };

  // Navegar para dia específico
  const navigateToDay = async (dayNumber: number) => {
    if (!enrollment || dayNumber < 1 || dayNumber > 21) return;

    setCurrentDay(dayNumber);
    await loadDailyPlan(enrollment.diet_program_id, dayNumber);
  };

  // Calcular progresso
  const getProgress = () => {
    return {
      currentDay,
      totalDays: 21,
      percentage: Math.round((currentDay / 21) * 100),
      weekNumber: Math.ceil(currentDay / 7),
      daysRemaining: 21 - currentDay,
    };
  };

  useEffect(() => {
    checkEnrollment();
  }, [user]);

  return {
    enrollment,
    dailyPlan,
    loading,
    currentDay,
    createEnrollment,
    advanceDay,
    navigateToDay,
    getProgress,
  };
};
