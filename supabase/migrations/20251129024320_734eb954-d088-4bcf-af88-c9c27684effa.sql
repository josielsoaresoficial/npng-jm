
-- Adicionar 24 novos treinos distribuídos nas 8 categorias

-- FULL BODY (3 novos treinos)
INSERT INTO workouts (name, category, difficulty, duration_minutes, estimated_calories, description, exercises_data)
VALUES 
  (
    'Full Body Iniciante',
    'full_body',
    'beginner',
    30,
    200,
    'Treino completo para iniciantes trabalhando todo o corpo com exercícios básicos',
    '[
      {"id": "cd6bfb61-b5a6-4d93-bcc1-88923e6084c7", "name": "Abdominal Crunch Deitado", "sets": 3, "reps": "10-12", "rest": 60},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 3, "reps": "12-15", "rest": 60},
      {"id": "ccea6cb3-f4f2-456a-a8c7-6cdd83f1dc00", "name": "Flexao Joelhos", "sets": 3, "reps": "8-10", "rest": 60},
      {"id": "16c05bfc-9b30-4fe3-a43c-0e8b7bff85c1", "name": "Rosca Direta Barra", "sets": 3, "reps": "10-12", "rest": 60}
    ]'::jsonb
  ),
  (
    'Full Body Força Total',
    'full_body',
    'advanced',
    45,
    500,
    'Treino intenso focado em exercícios compostos para ganho de força',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "46f43f79-8bea-4d8f-9a4b-8a20dfb8bfc2", "name": "Levantamento Terra Barra", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "fbf7faae-0a33-4b4c-b0fb-0d01c1b46eee", "name": "Supino Reto Barra", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "35e68b1a-f58e-4e8f-9b61-c15f31ee07aa", "name": "Desenvolvimento Barra", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "32c3b93c-3524-4565-8121-c838ff1a19e9", "name": "Abdominal Remador", "sets": 3, "reps": "12-15", "rest": 60}
    ]'::jsonb
  ),
  (
    'Full Body Express',
    'full_body',
    'intermediate',
    20,
    250,
    'Treino rápido e eficiente para todo o corpo',
    '[
      {"id": "d6e8ea93-0f7a-44bf-8afe-d6c36cf0c17a", "name": "Burpees", "sets": 3, "reps": "10-12", "rest": 45},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 3, "reps": "15-20", "rest": 45},
      {"id": "ccea6cb3-f4f2-456a-a8c7-6cdd83f1dc00", "name": "Flexao Joelhos", "sets": 3, "reps": "10-15", "rest": 45},
      {"id": "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", "name": "Prancha", "sets": 3, "reps": "30-45s", "rest": 30}
    ]'::jsonb
  ),

-- ABDÔMEN (3 novos treinos)
  (
    'Abdômen Iniciante',
    'abs',
    'beginner',
    15,
    100,
    'Treino básico de abdômen para iniciantes',
    '[
      {"id": "cd6bfb61-b5a6-4d93-bcc1-88923e6084c7", "name": "Abdominal Crunch Deitado", "sets": 3, "reps": "12-15", "rest": 45},
      {"id": "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", "name": "Prancha", "sets": 3, "reps": "20-30s", "rest": 30},
      {"id": "b5996982-a8ad-4bd0-8b5e-2309a1b06854", "name": "Crunch Reverso", "sets": 3, "reps": "10-12", "rest": 45}
    ]'::jsonb
  ),
  (
    'Core Avançado',
    'abs',
    'advanced',
    30,
    250,
    'Treino intenso para desenvolvimento completo do core',
    '[
      {"id": "55d4aa0d-0c15-4452-9720-e55a71002b61", "name": "Abdominal Roda", "sets": 4, "reps": "10-12", "rest": 60},
      {"id": "32c3b93c-3524-4565-8121-c838ff1a19e9", "name": "Abdominal Remador", "sets": 4, "reps": "15-20", "rest": 45},
      {"id": "2d4e2489-51b1-498e-8d60-996fb8163423", "name": "Bicicleta Abdominal", "sets": 4, "reps": "20-30", "rest": 45},
      {"id": "a1df84c1-574f-407d-9dfd-525b2076fab1", "name": "Prancha Alta", "sets": 4, "reps": "45-60s", "rest": 30},
      {"id": "082ba5ae-4e5a-48a8-883a-223dafbd60b8", "name": "Abdominal Suspenso Tirantes", "sets": 3, "reps": "12-15", "rest": 60}
    ]'::jsonb
  ),
  (
    'Abdômen 6 Pack',
    'abs',
    'intermediate',
    25,
    180,
    'Treino focado na definição abdominal',
    '[
      {"id": "fe11ba89-05b1-4b20-b42b-a328aa228941", "name": "Crunch Abdominal Solo", "sets": 4, "reps": "15-20", "rest": 45},
      {"id": "bebf316b-8cc2-412d-9ba0-9a175e29bac5", "name": "Crunch Reverso Elevacao Pernas", "sets": 4, "reps": "12-15", "rest": 45},
      {"id": "2d4e2489-51b1-498e-8d60-996fb8163423", "name": "Bicicleta Abdominal", "sets": 4, "reps": "20-25", "rest": 40},
      {"id": "529da298-7c2e-472a-a24f-5ffd1efe8af4", "name": "Prancha Alta Peso Corporal", "sets": 3, "reps": "40-50s", "rest": 30}
    ]'::jsonb
  ),

-- HIIT (3 novos treinos)
  (
    'HIIT Iniciante',
    'hiit',
    'beginner',
    15,
    200,
    'Treino HIIT para iniciantes com intensidade moderada',
    '[
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 4, "reps": "30s trabalho / 30s descanso", "rest": 30},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 4, "reps": "30s trabalho / 30s descanso", "rest": 30},
      {"id": "ccea6cb3-f4f2-456a-a8c7-6cdd83f1dc00", "name": "Flexao Joelhos", "sets": 4, "reps": "30s trabalho / 30s descanso", "rest": 30}
    ]'::jsonb
  ),
  (
    'HIIT Extremo',
    'hiit',
    'advanced',
    25,
    400,
    'Treino HIIT de alta intensidade para queima máxima de calorias',
    '[
      {"id": "d6e8ea93-0f7a-44bf-8afe-d6c36cf0c17a", "name": "Burpees", "sets": 5, "reps": "40s trabalho / 20s descanso", "rest": 20},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 5, "reps": "40s trabalho / 20s descanso", "rest": 20},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 5, "reps": "40s trabalho / 20s descanso", "rest": 20},
      {"id": "6e2ddac4-6d40-44e7-b7f8-f8e50ae10c40", "name": "Mountain Climbers", "sets": 5, "reps": "40s trabalho / 20s descanso", "rest": 20}
    ]'::jsonb
  ),
  (
    'Tabata Total',
    'hiit',
    'intermediate',
    20,
    350,
    'Treino no protocolo Tabata 20s/10s',
    '[
      {"id": "d6e8ea93-0f7a-44bf-8afe-d6c36cf0c17a", "name": "Burpees", "sets": 8, "reps": "20s trabalho / 10s descanso", "rest": 10},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 8, "reps": "20s trabalho / 10s descanso", "rest": 10},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 8, "reps": "20s trabalho / 10s descanso", "rest": 10},
      {"id": "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", "name": "Prancha", "sets": 8, "reps": "20s trabalho / 10s descanso", "rest": 10}
    ]'::jsonb
  ),

-- PERNAS (3 novos treinos)
  (
    'Pernas Iniciante',
    'legs',
    'beginner',
    30,
    250,
    'Treino básico de pernas para iniciantes',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 3, "reps": "12-15", "rest": 60},
      {"id": "e97d3a96-db61-47a7-a0b9-f92bf1e42a07", "name": "Agachamento Sumo Peso Corporal", "sets": 3, "reps": "12-15", "rest": 60},
      {"id": "ece07e1b-7c3f-4b41-b4f1-d3de79f9e8b6", "name": "Afundo Alternado", "sets": 3, "reps": "10-12 cada perna", "rest": 60}
    ]'::jsonb
  ),
  (
    'Pernas Power',
    'legs',
    'advanced',
    50,
    500,
    'Treino intenso de pernas focado em força e hipertrofia',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 5, "reps": "6-8", "rest": 90},
      {"id": "46f43f79-8bea-4d8f-9a4b-8a20dfb8bfc2", "name": "Levantamento Terra Barra", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "ece07e1b-7c3f-4b41-b4f1-d3de79f9e8b6", "name": "Afundo Alternado", "sets": 4, "reps": "10-12 cada perna", "rest": 60},
      {"id": "e97d3a96-db61-47a7-a0b9-f92bf1e42a07", "name": "Agachamento Sumo Peso Corporal", "sets": 4, "reps": "12-15", "rest": 60}
    ]'::jsonb
  ),
  (
    'Glúteos e Pernas',
    'legs',
    'intermediate',
    40,
    350,
    'Treino focado em glúteos e pernas com ênfase na região posterior',
    '[
      {"id": "16ff5ddc-4603-4e00-8d3d-b6f01eb06c8a", "name": "Elevacao Quadril Solo", "sets": 4, "reps": "12-15", "rest": 60},
      {"id": "e97d3a96-db61-47a7-a0b9-f92bf1e42a07", "name": "Agachamento Sumo Peso Corporal", "sets": 4, "reps": "12-15", "rest": 60},
      {"id": "ece07e1b-7c3f-4b41-b4f1-d3de79f9e8b6", "name": "Afundo Alternado", "sets": 4, "reps": "12-15 cada perna", "rest": 60},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 4, "reps": "15-20", "rest": 60}
    ]'::jsonb
  ),

-- COSTAS (3 novos treinos)
  (
    'Costas Definição',
    'back',
    'intermediate',
    40,
    300,
    'Treino de costas focado em definição muscular',
    '[
      {"id": "b69ed7df-17ce-4f75-9849-6116f4a07d0c", "name": "Remada Curvada Barra", "sets": 4, "reps": "10-12", "rest": 60},
      {"id": "0ca80e8f-27cc-4e3c-883b-b93a2faba577", "name": "Remada Unilateral Halter", "sets": 4, "reps": "10-12 cada lado", "rest": 60},
      {"id": "f08cf8b5-6abc-4cbc-9a88-05d9e39dec00", "name": "Pulldown Polia Alta", "sets": 4, "reps": "12-15", "rest": 60},
      {"id": "bec94b68-4f3c-465a-813c-cabb85c2ca4b", "name": "Puxada Frontal", "sets": 3, "reps": "10-12", "rest": 60}
    ]'::jsonb
  ),
  (
    'Costas Força',
    'back',
    'advanced',
    50,
    400,
    'Treino pesado de costas para ganho de força e massa',
    '[
      {"id": "46f43f79-8bea-4d8f-9a4b-8a20dfb8bfc2", "name": "Levantamento Terra Barra", "sets": 5, "reps": "5-6", "rest": 120},
      {"id": "b69ed7df-17ce-4f75-9849-6116f4a07d0c", "name": "Remada Curvada Barra", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "bec94b68-4f3c-465a-813c-cabb85c2ca4b", "name": "Puxada Frontal", "sets": 4, "reps": "6-8", "rest": 90},
      {"id": "0ca80e8f-27cc-4e3c-883b-b93a2faba577", "name": "Remada Unilateral Halter", "sets": 4, "reps": "8-10 cada lado", "rest": 60}
    ]'::jsonb
  ),
  (
    'Costas Iniciante',
    'back',
    'beginner',
    30,
    200,
    'Treino básico de costas para iniciantes',
    '[
      {"id": "f08cf8b5-6abc-4cbc-9a88-05d9e39dec00", "name": "Pulldown Polia Alta", "sets": 3, "reps": "12-15", "rest": 60},
      {"id": "0ca80e8f-27cc-4e3c-883b-b93a2faba577", "name": "Remada Unilateral Halter", "sets": 3, "reps": "10-12 cada lado", "rest": 60},
      {"id": "bec94b68-4f3c-465a-813c-cabb85c2ca4b", "name": "Puxada Frontal", "sets": 3, "reps": "10-12", "rest": 60}
    ]'::jsonb
  ),

-- FORÇA (3 novos treinos)
  (
    'Força Iniciante',
    'strength',
    'beginner',
    45,
    250,
    'Introdução ao treinamento de força com exercícios básicos',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 3, "reps": "10-12", "rest": 90},
      {"id": "fbf7faae-0a33-4b4c-b0fb-0d01c1b46eee", "name": "Supino Reto Barra", "sets": 3, "reps": "8-10", "rest": 90},
      {"id": "b69ed7df-17ce-4f75-9849-6116f4a07d0c", "name": "Remada Curvada Barra", "sets": 3, "reps": "8-10", "rest": 90},
      {"id": "35e68b1a-f58e-4e8f-9b61-c15f31ee07aa", "name": "Desenvolvimento Barra", "sets": 3, "reps": "8-10", "rest": 90}
    ]'::jsonb
  ),
  (
    'Força Explosiva',
    'strength',
    'advanced',
    60,
    450,
    'Treino avançado para desenvolvimento de força máxima',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 5, "reps": "3-5", "rest": 180},
      {"id": "46f43f79-8bea-4d8f-9a4b-8a20dfb8bfc2", "name": "Levantamento Terra Barra", "sets": 5, "reps": "3-5", "rest": 180},
      {"id": "fbf7faae-0a33-4b4c-b0fb-0d01c1b46eee", "name": "Supino Reto Barra", "sets": 5, "reps": "3-5", "rest": 180},
      {"id": "35e68b1a-f58e-4e8f-9b61-c15f31ee07aa", "name": "Desenvolvimento Barra", "sets": 4, "reps": "4-6", "rest": 150}
    ]'::jsonb
  ),
  (
    'Força Funcional',
    'strength',
    'intermediate',
    50,
    350,
    'Treino de força com movimentos funcionais',
    '[
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 4, "reps": "8-10", "rest": 90},
      {"id": "46f43f79-8bea-4d8f-9a4b-8a20dfb8bfc2", "name": "Levantamento Terra Barra", "sets": 4, "reps": "8-10", "rest": 90},
      {"id": "fbf7faae-0a33-4b4c-b0fb-0d01c1b46eee", "name": "Supino Reto Barra", "sets": 4, "reps": "8-10", "rest": 90},
      {"id": "ece07e1b-7c3f-4b41-b4f1-d3de79f9e8b6", "name": "Afundo Alternado", "sets": 3, "reps": "10-12 cada perna", "rest": 60}
    ]'::jsonb
  ),

-- CARDIO (3 novos treinos)
  (
    'Cardio Leve',
    'cardio',
    'beginner',
    30,
    200,
    'Treino cardiovascular de baixa intensidade',
    '[
      {"id": "cbc37d5d-e10b-4e25-9ff8-7b7d38ab58d0", "name": "Caminhada Esteira", "sets": 1, "reps": "30 minutos", "rest": 0},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 3, "reps": "30-45s", "rest": 60}
    ]'::jsonb
  ),
  (
    'Cardio Intenso',
    'cardio',
    'advanced',
    45,
    500,
    'Treino cardiovascular de alta intensidade',
    '[
      {"id": "a2e2e326-be91-4868-b68d-7ef076e6d868", "name": "Corrida Esteira", "sets": 1, "reps": "20 minutos alta intensidade", "rest": 0},
      {"id": "d6e8ea93-0f7a-44bf-8afe-d6c36cf0c17a", "name": "Burpees", "sets": 5, "reps": "15-20", "rest": 45},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 5, "reps": "45-60s", "rest": 30},
      {"id": "6e2ddac4-6d40-44e7-b7f8-f8e50ae10c40", "name": "Mountain Climbers", "sets": 4, "reps": "30-45s", "rest": 30}
    ]'::jsonb
  ),
  (
    'Cardio Mix',
    'cardio',
    'intermediate',
    35,
    350,
    'Treino cardiovascular misto com variação de intensidade',
    '[
      {"id": "cbc37d5d-e10b-4e25-9ff8-7b7d38ab58d0", "name": "Caminhada Esteira", "sets": 1, "reps": "10 minutos aquecimento", "rest": 0},
      {"id": "a2e2e326-be91-4868-b68d-7ef076e6d868", "name": "Corrida Esteira", "sets": 3, "reps": "5 minutos alta / 2 minutos baixa", "rest": 120},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 3, "reps": "45s", "rest": 45}
    ]'::jsonb
  ),

-- 7 MINUTOS (3 novos treinos)
  (
    '7 Min Abdômen',
    '7min',
    'beginner',
    7,
    80,
    'Treino rápido focado em abdômen',
    '[
      {"id": "cd6bfb61-b5a6-4d93-bcc1-88923e6084c7", "name": "Abdominal Crunch Deitado", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", "name": "Prancha", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "b5996982-a8ad-4bd0-8b5e-2309a1b06854", "name": "Crunch Reverso", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "2d4e2489-51b1-498e-8d60-996fb8163423", "name": "Bicicleta Abdominal", "sets": 1, "reps": "45s", "rest": 15}
    ]'::jsonb
  ),
  (
    '7 Min Full Body',
    '7min',
    'intermediate',
    7,
    100,
    'Treino rápido de corpo inteiro',
    '[
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "ccea6cb3-f4f2-456a-a8c7-6cdd83f1dc00", "name": "Flexao Joelhos", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", "name": "Prancha", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "ece07e1b-7c3f-4b41-b4f1-d3de79f9e8b6", "name": "Afundo Alternado", "sets": 1, "reps": "45s", "rest": 15}
    ]'::jsonb
  ),
  (
    '7 Min HIIT',
    '7min',
    'advanced',
    7,
    120,
    'Treino HIIT de 7 minutos de alta intensidade',
    '[
      {"id": "d6e8ea93-0f7a-44bf-8afe-d6c36cf0c17a", "name": "Burpees", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "f3f56af0-c4be-4a59-af7d-cf6e7b78c1ca", "name": "Polichinelo", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "6e2ddac4-6d40-44e7-b7f8-f8e50ae10c40", "name": "Mountain Climbers", "sets": 1, "reps": "45s", "rest": 15},
      {"id": "83f9f3c5-d07e-49d6-8e5c-87e5e4913579", "name": "Agachamento Livre Peso Corporal", "sets": 1, "reps": "45s", "rest": 15}
    ]'::jsonb
  );
