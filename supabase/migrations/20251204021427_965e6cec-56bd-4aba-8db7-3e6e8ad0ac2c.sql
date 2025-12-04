-- Atualizar exercícios para cada tipo de workout existente

-- Full Body Hipertrofia - 8 exercícios variados
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 3),
      'reps', COALESCE(reps, '10-12'),
      'rest_time', COALESCE(rest_time, 60),
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Peito', 'Costas', 'Pernas', 'Ombros')
    ORDER BY RANDOM()
    LIMIT 8
  ) sub
)
WHERE name = 'Full Body Hipertrofia';

-- Treino ABC Clássico - Peito, Costas, Pernas
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 3),
      'reps', COALESCE(reps, '10-12'),
      'rest_time', COALESCE(rest_time, 60),
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Peito', 'Costas', 'Pernas')
    ORDER BY muscle_group, RANDOM()
    LIMIT 9
  ) sub
)
WHERE name = 'Treino ABC Clássico';

-- HIIT Cardio Intenso - Cardio + exercícios compostos
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', 4,
      'reps', '30 seg',
      'rest_time', 15,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Cardio', 'Pernas', 'Abdômen')
    ORDER BY RANDOM()
    LIMIT 6
  ) sub
)
WHERE name = 'HIIT Cardio Intenso';

-- Treino de Força - Exercícios compostos pesados
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', 5,
      'reps', '5',
      'rest_time', 180,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Pernas', 'Costas', 'Peito')
    ORDER BY RANDOM()
    LIMIT 5
  ) sub
)
WHERE name = 'Treino de Força';

-- Core & Abs - Foco no abdômen
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 3),
      'reps', COALESCE(reps, '15-20'),
      'rest_time', 30,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group = 'Abdômen'
    ORDER BY RANDOM()
    LIMIT 8
  ) sub
)
WHERE name = 'Core & Abs';

-- Upper Body Express - Parte superior
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 3),
      'reps', COALESCE(reps, '12'),
      'rest_time', 45,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Peito', 'Ombros', 'Bíceps', 'Tríceps')
    ORDER BY RANDOM()
    LIMIT 8
  ) sub
)
WHERE name = 'Upper Body Express';

-- Lower Body Power - Pernas e glúteos
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 4),
      'reps', COALESCE(reps, '8-10'),
      'rest_time', 90,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Pernas', 'Glúteos')
    ORDER BY RANDOM()
    LIMIT 8
  ) sub
)
WHERE name = 'Lower Body Power';

-- Treino Push (Empurrar) - Peito, Ombros, Tríceps
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 4),
      'reps', COALESCE(reps, '8-12'),
      'rest_time', 60,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Peito', 'Ombros', 'Tríceps')
    ORDER BY RANDOM()
    LIMIT 9
  ) sub
)
WHERE name = 'Treino Push (Empurrar)';

-- Treino Pull (Puxar) - Costas, Bíceps
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 4),
      'reps', COALESCE(reps, '8-12'),
      'rest_time', 60,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    WHERE muscle_group IN ('Costas', 'Bíceps')
    ORDER BY RANDOM()
    LIMIT 8
  ) sub
)
WHERE name = 'Treino Pull (Puxar)';

-- Treino de Resistência - Volume alto, descanso curto
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', 3,
      'reps', '15-20',
      'rest_time', 30,
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    ORDER BY RANDOM()
    LIMIT 10
  ) sub
)
WHERE name = 'Treino de Resistência';

-- Para quaisquer workouts ainda sem exercícios, popular com exercícios genéricos
UPDATE workouts 
SET exercises_data = (
  SELECT jsonb_agg(exercise_data)
  FROM (
    SELECT jsonb_build_object(
      'id', id::text,
      'name', name,
      'sets', COALESCE(sets, 3),
      'reps', COALESCE(reps, '10-12'),
      'rest_time', COALESCE(rest_time, 60),
      'muscle_group', muscle_group
    ) as exercise_data
    FROM exercise_library 
    ORDER BY RANDOM()
    LIMIT 6
  ) sub
)
WHERE exercises_data = '[]'::jsonb OR exercises_data IS NULL;