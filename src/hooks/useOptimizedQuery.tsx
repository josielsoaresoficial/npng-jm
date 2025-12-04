import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/untyped';
import { useAuth } from './useAuth';

/**
 * Hook otimizado para queries do Supabase com cache inteligente
 */
export const useOptimizedQuery = <T,>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    enabled?: boolean;
  }
) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...queryKey, user?.id],
    queryFn,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 min cache padrão
    gcTime: options?.cacheTime ?? 1000 * 60 * 10, // 10 min garbage collection
    enabled: options?.enabled !== false && !!user,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hooks específicos otimizados para queries comuns
 */
export const useOptimizedProfile = () => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['profile'],
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    { staleTime: 1000 * 60 * 10 } // Profile cache 10 min
  );
};

export const useOptimizedTodayMeals = () => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['meals', 'today'],
    async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    { staleTime: 1000 * 30 } // 30 sec para meals (dados mais dinâmicos)
  );
};

export const useOptimizedTodayNutrition = () => {
  const { data: meals = [], isLoading } = useOptimizedTodayMeals();
  
  const totals = meals.reduce((acc, meal: any) => ({
    calories: acc.calories + (Number(meal.total_calories) || 0),
    protein: acc.protein + (Number(meal.total_protein) || 0),
    carbs: acc.carbs + (Number(meal.total_carbs) || 0),
    fat: acc.fat + (Number(meal.total_fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return { data: totals, isLoading, meals };
};

export const useOptimizedWorkoutHistory = (limit = 5) => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['workout-history', 'recent', limit.toString()],
    async () => {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*, workouts(*)')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    { staleTime: 1000 * 60 * 2 } // 2 min cache
  );
};

export const useOptimizedWeeklyProgress = () => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['weekly-progress'],
    async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Consolidar queries em uma Promise.all para paralelização (incluindo perfil)
      const [workoutsRes, mealsRes, profileRes] = await Promise.all([
        supabase
          .from('workout_history')
          .select('id, completed_at')
          .eq('user_id', user?.id)
          .gte('completed_at', sevenDaysAgo.toISOString()),
        supabase
          .from('meals')
          .select('total_calories, created_at')
          .eq('user_id', user?.id)
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('profiles')
          .select('daily_calories_goal')
          .eq('user_id', user?.id)
          .maybeSingle()
      ]);

      const workouts = workoutsRes.data || [];
      const meals = mealsRes.data || [];
      const caloriesGoal = profileRes.data?.daily_calories_goal || 2000;

      // Calcular dados
      const workoutsCompleted = workouts.length;
      
      const dailyCalories: { [key: string]: number } = {};
      meals.forEach((meal: any) => {
        const date = new Date(meal.created_at).toISOString().split('T')[0];
        dailyCalories[date] = (dailyCalories[date] || 0) + (Number(meal.total_calories) || 0);
      });

      const days = Object.keys(dailyCalories);
      const calorieGoalPercentage = days.length > 0
        ? Math.round(days.reduce((acc, date) => 
            acc + Math.min((dailyCalories[date] / caloriesGoal) * 100, 100), 0) / days.length)
        : 0;

      // Calcular dias consecutivos
      let consecutiveDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasActivity = workouts.some((w: any) => 
          new Date(w.completed_at).toISOString().split('T')[0] === dateStr
        ) || meals.some((m: any) => 
          new Date(m.created_at).toISOString().split('T')[0] === dateStr
        );
        
        if (hasActivity) {
          consecutiveDays++;
        } else {
          break;
        }
      }

      return {
        workoutsCompleted,
        calorieGoalPercentage,
        consecutiveDays
      };
    },
    { staleTime: 1000 * 60 * 5 } // 5 min cache
  );
};

export const useOptimizedCaloriesBurned = () => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['calories-burned', 'today'],
    async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('workout_history')
        .select('calories_burned')
        .eq('user_id', user?.id)
        .gte('completed_at', todayStart.toISOString());
      
      if (error) throw error;
      return data?.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0) || 0;
    },
    { staleTime: 1000 * 60 * 2 } // 2 min cache
  );
};

export const useOptimizedTodayWorkoutTime = () => {
  const { user } = useAuth();
  
  return useOptimizedQuery(
    ['workout-time', 'today'],
    async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('workout_history')
        .select('duration_minutes')
        .eq('user_id', user?.id)
        .gte('completed_at', todayStart.toISOString());
      
      if (error) throw error;
      return data?.reduce((sum, workout) => sum + (workout.duration_minutes || 0), 0) || 0;
    },
    { staleTime: 1000 * 60 * 2 } // 2 min cache
  );
};

/**
 * Hook para invalidar caches quando dados mudam
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateMeals: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
    invalidateWorkouts: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-progress'] });
    },
    invalidateProfile: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    }
  };
};
