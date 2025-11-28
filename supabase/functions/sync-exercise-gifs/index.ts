import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Iniciando sincronização de GIFs...');

    // Listar todos os arquivos no bucket exercise-gifs
    const { data: files, error: listError } = await supabase
      .storage
      .from('exercise-gifs')
      .list();

    if (listError) {
      console.error('Erro ao listar arquivos:', listError);
      throw listError;
    }

    console.log(`Encontrados ${files?.length || 0} arquivos no bucket`);

    const stats = {
      total: files?.length || 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      invalidFormat: 0
    };

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Nenhum arquivo encontrado no bucket',
          stats 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar cada arquivo
    for (const file of files) {
      try {
        // Extrair o exercise_id do nome do arquivo
        // Formato esperado: {exercise_id}_{timestamp}.gif
        const parts = file.name.split('_');
        
        if (parts.length < 2 || !file.name.endsWith('.gif')) {
          console.log(`Formato inválido: ${file.name}`);
          stats.invalidFormat++;
          continue;
        }

        const exerciseId = parts[0];
        
        // Verificar se é um UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(exerciseId)) {
          console.log(`ID inválido em: ${file.name}`);
          stats.invalidFormat++;
          continue;
        }

        // Verificar se o exercício existe e se já tem gif_url
        const { data: exercise, error: fetchError } = await supabase
          .from('exercise_library')
          .select('id, name, gif_url')
          .eq('id', exerciseId)
          .single();

        if (fetchError || !exercise) {
          console.log(`Exercício não encontrado para ID: ${exerciseId}`);
          stats.failed++;
          continue;
        }

        // Se já tem gif_url, pular
        if (exercise.gif_url) {
          console.log(`Exercício "${exercise.name}" já tem GIF`);
          stats.skipped++;
          continue;
        }

        // Construir a URL pública do GIF
        const { data: urlData } = supabase
          .storage
          .from('exercise-gifs')
          .getPublicUrl(file.name);

        const gifUrl = urlData.publicUrl;

        // Atualizar o exercício com a URL do GIF
        const { error: updateError } = await supabase
          .from('exercise_library')
          .update({ gif_url: gifUrl })
          .eq('id', exerciseId);

        if (updateError) {
          console.error(`Erro ao atualizar exercício ${exerciseId}:`, updateError);
          stats.failed++;
          continue;
        }

        console.log(`✓ GIF vinculado ao exercício "${exercise.name}"`);
        stats.updated++;

      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error);
        stats.failed++;
      }
    }

    console.log('Sincronização concluída:', stats);

    return new Response(
      JSON.stringify({ 
        message: 'Sincronização concluída',
        stats 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na sincronização:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Erro ao sincronizar GIFs com exercícios' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
