-- Create workouts table for pre-defined workout routines
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  estimated_calories integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'intermediate',
  exercises_data jsonb DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create workout_history table to track completed workouts
CREATE TABLE IF NOT EXISTS public.workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  duration_minutes integer,
  calories_burned integer,
  notes text,
  exercises_completed jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create exercise_history table to track individual exercise performance
CREATE TABLE IF NOT EXISTS public.exercise_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid REFERENCES public.exercise_library(id) ON DELETE CASCADE,
  workout_history_id uuid REFERENCES public.workout_history(id) ON DELETE CASCADE,
  sets_completed integer,
  reps_completed integer,
  weight_used numeric,
  notes text,
  completed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Anyone can view workouts
CREATE POLICY "Anyone can view workouts"
  ON public.workouts
  FOR SELECT
  USING (true);

-- Authenticated users can create workouts
CREATE POLICY "Authenticated users can create workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update workouts
CREATE POLICY "Authenticated users can update workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Authenticated users can delete workouts
CREATE POLICY "Authenticated users can delete workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Enable RLS on workout_history
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own workout history
CREATE POLICY "Users can view their own workout history"
  ON public.workout_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own workout history
CREATE POLICY "Users can create their own workout history"
  ON public.workout_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout history
CREATE POLICY "Users can update their own workout history"
  ON public.workout_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own workout history
CREATE POLICY "Users can delete their own workout history"
  ON public.workout_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on exercise_history
ALTER TABLE public.exercise_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own exercise history
CREATE POLICY "Users can view their own exercise history"
  ON public.exercise_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own exercise history
CREATE POLICY "Users can create their own exercise history"
  ON public.exercise_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exercise history
CREATE POLICY "Users can update their own exercise history"
  ON public.exercise_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own exercise history
CREATE POLICY "Users can delete their own exercise history"
  ON public.exercise_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update workouts updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample workouts
INSERT INTO public.workouts (name, description, category, duration_minutes, estimated_calories, difficulty, exercises_data) VALUES
('Treino de 7 Minutos', 'Treino rápido de alta intensidade para fazer em qualquer lugar', '7_minute', 7, 100, 'beginner', '[]'::jsonb),
('Full Body Hipertrofia', 'Treino completo focado em ganho de massa muscular', 'full_body', 60, 400, 'intermediate', '[]'::jsonb),
('Abdômen Definido', 'Treino específico para fortalecer e definir o core', 'abs', 30, 200, 'beginner', '[]'::jsonb),
('HIIT Cardio', 'Alta intensidade para queima de gordura máxima', 'hiit', 20, 300, 'advanced', '[]'::jsonb),
('Força Máxima', 'Treino focado em desenvolver força máxima', 'strength', 75, 350, 'advanced', '[]'::jsonb),
('Pernas Completo', 'Treino completo de pernas e glúteos', 'legs', 50, 450, 'intermediate', '[]'::jsonb),
('Costas e Bíceps', 'Treino focado em costas e bíceps', 'back', 55, 380, 'intermediate', '[]'::jsonb),
('Cardio Moderado', 'Treino cardiovascular de intensidade moderada', 'cardio', 40, 350, 'beginner', '[]'::jsonb);