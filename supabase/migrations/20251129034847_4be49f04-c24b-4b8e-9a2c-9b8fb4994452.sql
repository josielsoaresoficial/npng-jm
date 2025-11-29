-- Criar tabela de alimentos personalizados dos usuários
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein NUMERIC NOT NULL CHECK (protein >= 0),
  carbs NUMERIC NOT NULL CHECK (carbs >= 0),
  fat NUMERIC NOT NULL CHECK (fat >= 0),
  portion TEXT NOT NULL DEFAULT '100g',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca rápida por usuário
CREATE INDEX idx_custom_foods_user_id ON public.custom_foods(user_id);

-- Índice para busca por nome (case insensitive)
CREATE INDEX idx_custom_foods_name ON public.custom_foods(LOWER(name));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_custom_foods_updated_at
  BEFORE UPDATE ON public.custom_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: usuários só podem ver e gerenciar seus próprios alimentos
CREATE POLICY "Users can view their own custom foods"
  ON public.custom_foods
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom foods"
  ON public.custom_foods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom foods"
  ON public.custom_foods
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom foods"
  ON public.custom_foods
  FOR DELETE
  USING (auth.uid() = user_id);