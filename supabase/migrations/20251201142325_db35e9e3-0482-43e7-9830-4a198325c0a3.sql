-- Tabela de programas de dieta disponíveis
CREATE TABLE public.diet_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 21,
  target_goal TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de inscrições dos usuários nos programas
CREATE TABLE public.user_diet_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  diet_program_id UUID NOT NULL REFERENCES public.diet_programs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  target_weight_loss NUMERIC,
  initial_weight NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de planos diários estruturados
CREATE TABLE public.diet_daily_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diet_program_id UUID NOT NULL REFERENCES public.diet_programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 21),
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 3),
  is_training_day BOOLEAN NOT NULL DEFAULT true,
  is_weekend BOOLEAN NOT NULL DEFAULT false,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  tips TEXT[] DEFAULT ARRAY[]::TEXT[],
  fasting_hours INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de receitas da dieta
CREATE TABLE public.diet_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  diet_program_id UUID NOT NULL REFERENCES public.diet_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('desjejum', 'almoço', 'lanche', 'janta')),
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL,
  macros JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_low_carb BOOLEAN NOT NULL DEFAULT true,
  is_weekend_meal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diet_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diet_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para diet_programs (todos podem ver programas ativos)
CREATE POLICY "Anyone can view active diet programs"
  ON public.diet_programs
  FOR SELECT
  USING (is_active = true);

-- RLS Policies para user_diet_enrollments (usuários gerenciam suas próprias inscrições)
CREATE POLICY "Users can view their own enrollments"
  ON public.user_diet_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON public.user_diet_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
  ON public.user_diet_enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own enrollments"
  ON public.user_diet_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para diet_daily_plans (todos usuários autenticados podem ver planos)
CREATE POLICY "Authenticated users can view daily plans"
  ON public.diet_daily_plans
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies para diet_recipes (todos usuários autenticados podem ver receitas)
CREATE POLICY "Authenticated users can view recipes"
  ON public.diet_recipes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at em diet_programs
CREATE TRIGGER update_diet_programs_updated_at
  BEFORE UPDATE ON public.diet_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em user_diet_enrollments
CREATE TRIGGER update_user_diet_enrollments_updated_at
  BEFORE UPDATE ON public.user_diet_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir o programa "Dieta de 21 Dias"
INSERT INTO public.diet_programs (name, description, duration_days, target_goal, is_active)
VALUES (
  'Dieta de 21 Dias',
  'Programa de emagrecimento saudável baseado em jejum intermitente e alimentação low-carb. Perca de 5 a 15kg em 21 dias de forma sustentável.',
  21,
  'weight_loss',
  true
);

-- Inserir planos diários (exemplo para os primeiros dias da semana 1)
WITH program AS (
  SELECT id FROM public.diet_programs WHERE name = 'Dieta de 21 Dias' LIMIT 1
)
INSERT INTO public.diet_daily_plans (diet_program_id, day_number, week_number, is_training_day, is_weekend, meals, tips, fasting_hours)
SELECT 
  program.id,
  day_num,
  CASE 
    WHEN day_num <= 7 THEN 1
    WHEN day_num <= 14 THEN 2
    ELSE 3
  END as week_num,
  true,
  CASE WHEN day_num % 7 IN (0, 6) THEN true ELSE false END as is_weekend,
  CASE 
    WHEN day_num % 7 IN (0, 6) THEN -- Fim de semana (recarga)
      '[
        {"time": "08:00-10:00", "type": "Jejum", "description": "Café sem açúcar (1-2 xícaras)", "completed": false},
        {"time": "12:00-13:00", "type": "Desjejum", "description": "Pasta de amendoim (2 colheres) + Óleo de coco (1 colher)", "completed": false},
        {"time": "13:00-14:00", "type": "Almoço", "description": "Proteína (150g) + Batata doce (150g) + Verduras + Bacon", "completed": false},
        {"time": "18:00-19:00", "type": "Lanche", "description": "Vitamina de abacate ou Castanhas (30g)", "completed": false},
        {"time": "19:00-20:00", "type": "Janta", "description": "Proteína (150g) + Batata doce (100g) + Verduras", "completed": false}
      ]'::jsonb
    ELSE -- Dias de semana
      '[
        {"time": "08:00-10:00", "type": "Jejum", "description": "Café sem açúcar (1-2 xícaras)", "completed": false},
        {"time": "12:00-13:00", "type": "Desjejum", "description": "Pasta de amendoim (2 colheres) + Óleo de coco (1 colher)", "completed": false},
        {"time": "13:00-14:00", "type": "Almoço", "description": "Proteína (150g) + Ovos (2-3 unidades) + Verduras + Bacon", "completed": false},
        {"time": "18:00-19:00", "type": "Lanche", "description": "Vitamina de abacate ou Castanhas (30g)", "completed": false},
        {"time": "19:00-20:00", "type": "Janta", "description": "Proteína (150g) + Ovos (2 unidades) + Verduras", "completed": false}
      ]'::jsonb
  END as meals,
  ARRAY[
    'Mantenha-se hidratado: beba pelo menos 2 litros de água por dia',
    'Evite açúcar e alimentos processados',
    'Priorize alimentos integrais e naturais',
    'O jejum intermitente potencializa a queima de gordura'
  ],
  CASE WHEN day_num <= 7 THEN 14 WHEN day_num <= 14 THEN 16 ELSE 16 END
FROM program, generate_series(1, 21) as day_num;