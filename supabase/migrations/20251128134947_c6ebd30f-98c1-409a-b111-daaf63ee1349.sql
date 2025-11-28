-- Adicionar colunas de metas nutricionais à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN daily_calories_goal integer DEFAULT 2000,
ADD COLUMN daily_protein_goal integer DEFAULT 120,
ADD COLUMN daily_carbs_goal integer DEFAULT 250,
ADD COLUMN daily_fat_goal integer DEFAULT 65;