import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting subdivision population...');

    // TRÍCEPS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Cabeça Longa' })
      .eq('muscle_group', 'triceps')
      .or('name.ilike.%francês%,name.ilike.%testa%,name.ilike.%overhead%,name.ilike.%skull crusher%,name.ilike.%sentado%,name.ilike.%acima da cabeça%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Cabeça Lateral' })
      .eq('muscle_group', 'triceps')
      .or('name.ilike.%polia%,name.ilike.%kickback%,name.ilike.%coice%,name.ilike.%pulley%,name.ilike.%invertido%,name.ilike.%corda%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Cabeça Medial' })
      .eq('muscle_group', 'triceps')
      .or('name.ilike.%diamond%,name.ilike.%close grip%,name.ilike.%mergulho%,name.ilike.%jm press%,name.ilike.%máquina%,name.ilike.%banco%,name.ilike.%elástico%,name.ilike.%pegada fechada%');

    // BÍCEPS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Cabeça Longa' })
      .eq('muscle_group', 'biceps')
      .or('name.ilike.%direta%,name.ilike.%barra%,name.ilike.%rosca w%,name.ilike.%scott%,name.ilike.%alternada%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Cabeça Curta' })
      .eq('muscle_group', 'biceps')
      .or('name.ilike.%concentrada%,name.ilike.%pregador%,name.ilike.%inclinado%,name.ilike.%spider%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Braquial' })
      .eq('muscle_group', 'biceps')
      .or('name.ilike.%martelo%,name.ilike.%inversa%,name.ilike.%pronada%');

    // PEITO
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Superior' })
      .eq('muscle_group', 'peito')
      .or('name.ilike.%inclinado%,name.ilike.%incline%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Médio' })
      .eq('muscle_group', 'peito')
      .is('subdivision', null)
      .or('name.ilike.%reto%,name.ilike.%plano%,name.ilike.%flat%,name.ilike.%crucifixo%,name.ilike.%fly%,name.ilike.%peck deck%,name.ilike.%crossover%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Inferior' })
      .eq('muscle_group', 'peito')
      .or('name.ilike.%declinado%,name.ilike.%decline%,name.ilike.%paralelas%');

    // COSTAS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Dorsal' })
      .eq('muscle_group', 'costas')
      .or('name.ilike.%puxada%,name.ilike.%pull%,name.ilike.%barra fixa%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Romboides' })
      .eq('muscle_group', 'costas')
      .or('name.ilike.%remada%,name.ilike.%row%,name.ilike.%serrote%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Trapézio' })
      .eq('muscle_group', 'costas')
      .or('name.ilike.%encolhimento%,name.ilike.%shrug%,name.ilike.%elevação%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Lombar' })
      .eq('muscle_group', 'costas')
      .or('name.ilike.%hiperextensão%,name.ilike.%levantamento terra%,name.ilike.%deadlift%,name.ilike.%good morning%');

    // OMBROS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Anterior' })
      .eq('muscle_group', 'ombros')
      .or('name.ilike.%desenvolvimento%,name.ilike.%press%,name.ilike.%frontal%,name.ilike.%militar%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Lateral' })
      .eq('muscle_group', 'ombros')
      .or('name.ilike.%lateral%,name.ilike.%abdução%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Posterior' })
      .eq('muscle_group', 'ombros')
      .or('name.ilike.%posterior%,name.ilike.%face pull%,name.ilike.%crucifixo invertido%,name.ilike.%remada alta%');

    // PERNAS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Quadríceps' })
      .eq('muscle_group', 'pernas')
      .or('name.ilike.%agachamento%,name.ilike.%squat%,name.ilike.%leg press%,name.ilike.%extensora%,name.ilike.%sissy%,name.ilike.%avanço%,name.ilike.%afundo%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Posteriores' })
      .eq('muscle_group', 'pernas')
      .or('name.ilike.%flexora%,name.ilike.%stiff%,name.ilike.%mesa%,name.ilike.%curl%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Panturrilhas' })
      .eq('muscle_group', 'pernas')
      .or('name.ilike.%panturrilha%,name.ilike.%calf%,name.ilike.%gêmeos%');

    // CARDIO
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Aeróbico' })
      .eq('muscle_group', 'Cardio')
      .or('name.ilike.%corrida%,name.ilike.%caminhada%,name.ilike.%bicicleta%,name.ilike.%elíptico%,name.ilike.%remo%,name.ilike.%natação%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Anaeróbico' })
      .eq('muscle_group', 'Cardio')
      .or('name.ilike.%sprint%,name.ilike.%tiro%,name.ilike.%velocidade%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'HIIT' })
      .eq('muscle_group', 'Cardio')
      .or('name.ilike.%burpee%,name.ilike.%jumping%,name.ilike.%mountain climber%,name.ilike.%hiit%,name.ilike.%intervalo%');

    // ABDÔMEN
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Reto Abdominal' })
      .eq('muscle_group', 'Abdômen')
      .or('name.ilike.%abdominal%,name.ilike.%crunch%,name.ilike.%sit up%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Oblíquos' })
      .eq('muscle_group', 'Abdômen')
      .or('name.ilike.%oblíquo%,name.ilike.%russian twist%,name.ilike.%lateral%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Core' })
      .eq('muscle_group', 'Abdômen')
      .or('name.ilike.%prancha%,name.ilike.%plank%,name.ilike.%hollow%');

    // GLÚTEOS
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Glúteo Máximo' })
      .eq('muscle_group', 'Glúteos');

    // ANTEBRAÇO
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Flexores' })
      .eq('muscle_group', 'Antebraço')
      .ilike('name', '%rosca%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Extensores' })
      .eq('muscle_group', 'Antebraço')
      .ilike('name', '%inversa%');

    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Pegada' })
      .eq('muscle_group', 'Antebraço')
      .or('name.ilike.%grip%,name.ilike.%farmer%,name.ilike.%dead hang%');

    // ADUTORES
    await supabaseClient
      .from('exercise_library')
      .update({ subdivision: 'Adutores' })
      .eq('muscle_group', 'adutores');

    // Get final counts
    const { data: counts } = await supabaseClient
      .from('exercise_library')
      .select('muscle_group, subdivision')
      .not('subdivision', 'is', null);

    const summary = counts?.reduce((acc: any, row: any) => {
      const key = `${row.muscle_group} - ${row.subdivision}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('Subdivision population completed!');
    console.log('Summary:', summary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subdivisões populadas com sucesso!',
        summary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
