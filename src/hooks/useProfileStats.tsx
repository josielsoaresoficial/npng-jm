import { useAuth } from "./useAuth";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { supabase } from "@/integrations/supabase/client";

export const useProfileStats = () => {
  const { user } = useAuth();

  return useOptimizedQuery(
    ['profile-stats'],
    async () => {
      if (!user?.id) {
        return { totalWorkouts: 0, totalMeals: 0, activeDays: 0 };
      }

      const [workoutsRes, mealsRes] = await Promise.all([
        supabase
          .from('workout_history')
          .select('id, completed_at')
          .eq('user_id', user.id),
        supabase
          .from('meals')
          .select('id, created_at')
          .eq('user_id', user.id)
      ]);

      const totalWorkouts = workoutsRes.data?.length || 0;
      const totalMeals = mealsRes.data?.length || 0;

      // Calcular dias únicos com atividade (treino OU refeição)
      const uniqueDates = new Set([
        ...(workoutsRes.data?.map(w => new Date(w.completed_at).toDateString()) || []),
        ...(mealsRes.data?.map(m => new Date(m.created_at).toDateString()) || [])
      ]);

      return {
        totalWorkouts,
        totalMeals,
        activeDays: uniqueDates.size
      };
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!user?.id
    }
  );
};
