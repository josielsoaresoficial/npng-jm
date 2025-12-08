import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

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

    // ========== ADMIN VERIFICATION ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado - Token ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado - Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('❌ User is not admin:', user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Acesso negado - Apenas administradores podem executar esta ação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified:', user.email);
    // ========== END ADMIN VERIFICATION ==========

    console.log('Iniciando sincronização de GIFs...');

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

    for (const file of files) {
      try {
        const parts = file.name.split('_');
        
        if (parts.length < 2 || !file.name.endsWith('.gif')) {
          console.log(`Formato inválido: ${file.name}`);
          stats.invalidFormat++;
          continue;
        }

        const exerciseId = parts[0];
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(exerciseId)) {
          console.log(`ID inválido em: ${file.name}`);
          stats.invalidFormat++;
          continue;
        }

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

        if (exercise.gif_url) {
          console.log(`Exercício "${exercise.name}" já tem GIF`);
          stats.skipped++;
          continue;
        }

        const { data: urlData } = supabase
          .storage
          .from('exercise-gifs')
          .getPublicUrl(file.name);

        const gifUrl = urlData.publicUrl;

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
