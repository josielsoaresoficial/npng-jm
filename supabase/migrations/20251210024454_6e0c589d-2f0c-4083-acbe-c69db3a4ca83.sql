
-- =====================================================
-- OTIMIZAÇÃO COMPLETA DE POLÍTICAS RLS
-- =====================================================

-- =====================================================
-- FASE 1: STORAGE - CORRIGIR POLÍTICAS (CRÍTICO)
-- =====================================================

-- Remover política pública perigosa de body-photos
DROP POLICY IF EXISTS "Anyone can view body photos" ON storage.objects;

-- Recriar política de visualização restrita
DROP POLICY IF EXISTS "Users can view own body photos" ON storage.objects;
CREATE POLICY "Users can view own body photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'body-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Restringir exercise-gifs UPDATE/DELETE para admins apenas
DROP POLICY IF EXISTS "Authenticated users can update exercise GIFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete exercise GIFs" ON storage.objects;

CREATE POLICY "Only admins can update exercise GIFs" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'exercise-gifs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete exercise GIFs" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'exercise-gifs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- =====================================================
-- FASE 2 & 3: TABELAS - MIGRAR PARA AUTHENTICATED + WITH CHECK
-- =====================================================

-- BODY_PHOTOS
DROP POLICY IF EXISTS "Users can view own photos" ON public.body_photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON public.body_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.body_photos;

CREATE POLICY "Users can view own photos" ON public.body_photos 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON public.body_photos 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.body_photos 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CALORIES_BURNED
DROP POLICY IF EXISTS "Users can view own calories_burned records" ON public.calories_burned;
DROP POLICY IF EXISTS "Users can insert own calories_burned records" ON public.calories_burned;
DROP POLICY IF EXISTS "Users can update own calories_burned records" ON public.calories_burned;
DROP POLICY IF EXISTS "Users can delete own calories_burned records" ON public.calories_burned;

CREATE POLICY "Users can view own calories_burned records" ON public.calories_burned 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calories_burned records" ON public.calories_burned 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calories_burned records" ON public.calories_burned 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calories_burned records" ON public.calories_burned 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CUSTOM_FOODS
DROP POLICY IF EXISTS "Users can view their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Users can create their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Users can update their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Users can delete their own custom foods" ON public.custom_foods;

CREATE POLICY "Users can view their own custom foods" ON public.custom_foods 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom foods" ON public.custom_foods 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods" ON public.custom_foods 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods" ON public.custom_foods 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CUSTOM_WORKOUTS
DROP POLICY IF EXISTS "Users can view their own custom workouts" ON public.custom_workouts;
DROP POLICY IF EXISTS "Users can create their own custom workouts" ON public.custom_workouts;
DROP POLICY IF EXISTS "Users can update their own custom workouts" ON public.custom_workouts;
DROP POLICY IF EXISTS "Users can delete their own custom workouts" ON public.custom_workouts;

CREATE POLICY "Users can view their own custom workouts" ON public.custom_workouts 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom workouts" ON public.custom_workouts 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom workouts" ON public.custom_workouts 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom workouts" ON public.custom_workouts 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CUSTOM_WORKOUT_EXERCISES
DROP POLICY IF EXISTS "Users can view their own custom workout exercises" ON public.custom_workout_exercises;
DROP POLICY IF EXISTS "Users can create their own custom workout exercises" ON public.custom_workout_exercises;
DROP POLICY IF EXISTS "Users can update their own custom workout exercises" ON public.custom_workout_exercises;
DROP POLICY IF EXISTS "Users can delete their own custom workout exercises" ON public.custom_workout_exercises;

CREATE POLICY "Users can view their own custom workout exercises" ON public.custom_workout_exercises 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.custom_workouts WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id AND custom_workouts.user_id = auth.uid()));

CREATE POLICY "Users can create their own custom workout exercises" ON public.custom_workout_exercises 
FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.custom_workouts WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id AND custom_workouts.user_id = auth.uid()));

CREATE POLICY "Users can update their own custom workout exercises" ON public.custom_workout_exercises 
FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.custom_workouts WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id AND custom_workouts.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.custom_workouts WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id AND custom_workouts.user_id = auth.uid()));

CREATE POLICY "Users can delete their own custom workout exercises" ON public.custom_workout_exercises 
FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.custom_workouts WHERE custom_workouts.id = custom_workout_exercises.custom_workout_id AND custom_workouts.user_id = auth.uid()));

-- EXERCISE_HISTORY
DROP POLICY IF EXISTS "Users can view their own exercise history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can create their own exercise history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can update their own exercise history" ON public.exercise_history;
DROP POLICY IF EXISTS "Users can delete their own exercise history" ON public.exercise_history;

CREATE POLICY "Users can view their own exercise history" ON public.exercise_history 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise history" ON public.exercise_history 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise history" ON public.exercise_history 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise history" ON public.exercise_history 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FAVORITE_EXERCISES
DROP POLICY IF EXISTS "Users can view their own favorite exercises" ON public.favorite_exercises;
DROP POLICY IF EXISTS "Users can add their own favorite exercises" ON public.favorite_exercises;
DROP POLICY IF EXISTS "Users can remove their own favorite exercises" ON public.favorite_exercises;

CREATE POLICY "Users can view their own favorite exercises" ON public.favorite_exercises 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite exercises" ON public.favorite_exercises 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite exercises" ON public.favorite_exercises 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FAVORITE_RECIPES
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can create their own recipes" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.favorite_recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.favorite_recipes;

CREATE POLICY "Users can view their own recipes" ON public.favorite_recipes 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON public.favorite_recipes 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.favorite_recipes 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.favorite_recipes 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- HYDRATION_LOGS
DROP POLICY IF EXISTS "Users can view their own hydration logs" ON public.hydration_logs;
DROP POLICY IF EXISTS "Users can create their own hydration logs" ON public.hydration_logs;
DROP POLICY IF EXISTS "Users can delete their own hydration logs" ON public.hydration_logs;

CREATE POLICY "Users can view their own hydration logs" ON public.hydration_logs 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hydration logs" ON public.hydration_logs 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hydration logs" ON public.hydration_logs 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- MEALS
DROP POLICY IF EXISTS "Users can view their own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can create their own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON public.meals;
DROP POLICY IF EXISTS "Admins can view all meals" ON public.meals;

CREATE POLICY "Users can view their own meals" ON public.meals 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meals" ON public.meals 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals" ON public.meals 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals" ON public.meals 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all meals" ON public.meals 
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- MUSCLE_MAP_SETTINGS
DROP POLICY IF EXISTS "Users can view their own muscle map settings" ON public.muscle_map_settings;
DROP POLICY IF EXISTS "Users can create their own muscle map settings" ON public.muscle_map_settings;
DROP POLICY IF EXISTS "Users can update their own muscle map settings" ON public.muscle_map_settings;
DROP POLICY IF EXISTS "Users can delete their own muscle map settings" ON public.muscle_map_settings;

CREATE POLICY "Users can view their own muscle map settings" ON public.muscle_map_settings 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own muscle map settings" ON public.muscle_map_settings 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own muscle map settings" ON public.muscle_map_settings 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own muscle map settings" ON public.muscle_map_settings 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATION_PREFERENCES
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can delete own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences" ON public.notification_preferences 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update any profile" ON public.profiles 
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- PUSH_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own push subscriptions" ON public.push_subscriptions 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- USER_ACHIEVEMENTS
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.user_achievements;

CREATE POLICY "Users can view their own achievements" ON public.user_achievements 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON public.user_achievements 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- USER_DIET_ENROLLMENTS
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.user_diet_enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.user_diet_enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.user_diet_enrollments;
DROP POLICY IF EXISTS "Users can delete their own enrollments" ON public.user_diet_enrollments;

CREATE POLICY "Users can view their own enrollments" ON public.user_diet_enrollments 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.user_diet_enrollments 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.user_diet_enrollments 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments" ON public.user_diet_enrollments 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WORKOUT_HISTORY
DROP POLICY IF EXISTS "Users can view their own workout history" ON public.workout_history;
DROP POLICY IF EXISTS "Users can create their own workout history" ON public.workout_history;
DROP POLICY IF EXISTS "Users can update their own workout history" ON public.workout_history;
DROP POLICY IF EXISTS "Users can delete their own workout history" ON public.workout_history;
DROP POLICY IF EXISTS "Admins can view all workout history" ON public.workout_history;

CREATE POLICY "Users can view their own workout history" ON public.workout_history 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout history" ON public.workout_history 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history" ON public.workout_history 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout history" ON public.workout_history 
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all workout history" ON public.workout_history 
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- =====================================================
-- FASE 4: POLÍTICAS DE ADMIN E SISTEMA
-- =====================================================

-- USER_ROLES (já correta, apenas garantindo)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON public.user_roles 
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can insert roles" ON public.user_roles 
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update roles" ON public.user_roles 
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles" ON public.user_roles 
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- EXERCISE_LIBRARY (somente admins podem modificar)
DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercise_library;
DROP POLICY IF EXISTS "Only admins can create exercises" ON public.exercise_library;
DROP POLICY IF EXISTS "Only admins can update exercises" ON public.exercise_library;
DROP POLICY IF EXISTS "Only admins can delete exercises" ON public.exercise_library;

CREATE POLICY "Anyone can view exercises" ON public.exercise_library 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can create exercises" ON public.exercise_library 
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update exercises" ON public.exercise_library 
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete exercises" ON public.exercise_library 
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- WORKOUTS (somente admins podem modificar)
DROP POLICY IF EXISTS "Anyone can view workouts" ON public.workouts;
DROP POLICY IF EXISTS "Only admins can create workouts" ON public.workouts;
DROP POLICY IF EXISTS "Only admins can update workouts" ON public.workouts;
DROP POLICY IF EXISTS "Only admins can delete workouts" ON public.workouts;

CREATE POLICY "Anyone can view workouts" ON public.workouts 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can create workouts" ON public.workouts 
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update workouts" ON public.workouts 
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete workouts" ON public.workouts 
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- DIET_PROGRAMS (conteúdo público, apenas leitura para autenticados)
DROP POLICY IF EXISTS "Anyone can view active diet programs" ON public.diet_programs;
CREATE POLICY "Authenticated users can view active diet programs" ON public.diet_programs 
FOR SELECT TO authenticated USING (is_active = true);

-- DIET_DAILY_PLANS
DROP POLICY IF EXISTS "Authenticated users can view daily plans" ON public.diet_daily_plans;
CREATE POLICY "Authenticated users can view daily plans" ON public.diet_daily_plans 
FOR SELECT TO authenticated USING (true);

-- DIET_RECIPES
DROP POLICY IF EXISTS "Authenticated users can view recipes" ON public.diet_recipes;
CREATE POLICY "Authenticated users can view recipes" ON public.diet_recipes 
FOR SELECT TO authenticated USING (true);
