-- Create custom_workouts table for user-created workouts
CREATE TABLE IF NOT EXISTS public.custom_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'custom',
  difficulty text DEFAULT 'intermediate',
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create custom_workout_exercises junction table
CREATE TABLE IF NOT EXISTS public.custom_workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_workout_id uuid NOT NULL REFERENCES public.custom_workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercise_library(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  sets integer DEFAULT 3,
  reps text DEFAULT '10-12',
  rest_time integer DEFAULT 60,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on custom_workouts
ALTER TABLE public.custom_workouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own custom workouts
CREATE POLICY "Users can view their own custom workouts"
  ON public.custom_workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own custom workouts
CREATE POLICY "Users can create their own custom workouts"
  ON public.custom_workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom workouts
CREATE POLICY "Users can update their own custom workouts"
  ON public.custom_workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own custom workouts
CREATE POLICY "Users can delete their own custom workouts"
  ON public.custom_workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on custom_workout_exercises
ALTER TABLE public.custom_workout_exercises ENABLE ROW LEVEL SECURITY;

-- Users can view exercises from their own custom workouts
CREATE POLICY "Users can view their own custom workout exercises"
  ON public.custom_workout_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_workouts
      WHERE id = custom_workout_exercises.custom_workout_id
      AND user_id = auth.uid()
    )
  );

-- Users can create exercises for their own custom workouts
CREATE POLICY "Users can create their own custom workout exercises"
  ON public.custom_workout_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.custom_workouts
      WHERE id = custom_workout_exercises.custom_workout_id
      AND user_id = auth.uid()
    )
  );

-- Users can update exercises in their own custom workouts
CREATE POLICY "Users can update their own custom workout exercises"
  ON public.custom_workout_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_workouts
      WHERE id = custom_workout_exercises.custom_workout_id
      AND user_id = auth.uid()
    )
  );

-- Users can delete exercises from their own custom workouts
CREATE POLICY "Users can delete their own custom workout exercises"
  ON public.custom_workout_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.custom_workouts
      WHERE id = custom_workout_exercises.custom_workout_id
      AND user_id = auth.uid()
    )
  );

-- Create trigger to update custom_workouts updated_at
CREATE TRIGGER update_custom_workouts_updated_at
  BEFORE UPDATE ON public.custom_workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better query performance
CREATE INDEX idx_custom_workouts_user_id ON public.custom_workouts(user_id);
CREATE INDEX idx_custom_workout_exercises_workout_id ON public.custom_workout_exercises(custom_workout_id);
CREATE INDEX idx_custom_workout_exercises_order ON public.custom_workout_exercises(custom_workout_id, order_index);