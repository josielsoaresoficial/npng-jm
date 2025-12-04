-- Criar tabela calories_burned para rastrear calorias queimadas
CREATE TABLE IF NOT EXISTS public.calories_burned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  calories INTEGER NOT NULL,
  activity_type TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calories_burned ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own calories_burned records" 
ON public.calories_burned FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calories_burned records" 
ON public.calories_burned FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calories_burned records" 
ON public.calories_burned FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calories_burned records" 
ON public.calories_burned FOR DELETE 
USING (auth.uid() = user_id);

-- Adicionar coluna de meta de calorias queimadas na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_calories_burn_goal INTEGER DEFAULT 500;