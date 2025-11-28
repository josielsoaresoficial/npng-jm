-- Create favorite_exercises table to track user's favorite exercises
CREATE TABLE IF NOT EXISTS public.favorite_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL REFERENCES public.exercise_library(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorite exercises"
  ON public.favorite_exercises
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite exercises"
  ON public.favorite_exercises
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorite exercises"
  ON public.favorite_exercises
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_favorite_exercises_user_id ON public.favorite_exercises(user_id);
CREATE INDEX idx_favorite_exercises_exercise_id ON public.favorite_exercises(exercise_id);