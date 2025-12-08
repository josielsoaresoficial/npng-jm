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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log('🔄 Starting exercise library rebuild...');

    // Step 1: Delete all existing exercises
    console.log('🗑️  Deleting all existing exercises...');
    const { error: deleteError, count: deletedCount } = await supabase
      .from('exercise_library')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error deleting exercises:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Deleted ${deletedCount || 0} existing exercises`);

    // Step 2: List all GIFs in storage bucket with pagination
    console.log('📁 Listing GIFs from storage bucket...');
    
    let allFiles: any[] = [];
    let offset = 0;
    const limit = 1000;
    
    while (true) {
      const { data: files, error: listError } = await supabase.storage
        .from('exercise-gifs')
        .list('', {
          limit: limit,
          offset: offset,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (listError) {
        console.error('Error listing files:', listError);
        throw listError;
      }

      if (!files || files.length === 0) break;
      
      allFiles = [...allFiles, ...files];
      console.log(`📥 Fetched ${files.length} files (total: ${allFiles.length})`);
      
      if (files.length < limit) break;
      offset += limit;
    }

    console.log(`📊 Found ${allFiles.length} total files in storage`);

    // Filter only GIF files
    const gifFiles = allFiles.filter(file => 
      file.name.toLowerCase().endsWith('.gif')
    );

    console.log(`🎬 Processing ${gifFiles.length} GIF files`);

    // Step 3: Process each GIF and create exercise
    const results = {
      total: gifFiles.length,
      created: 0,
      failed: 0,
      errors: [] as string[],
      muscleGroups: {} as Record<string, number>
    };

    for (const file of gifFiles) {
      try {
        const exerciseName = extractExerciseName(file.name);
        const muscleGroup = detectMuscleGroup(file.name);
        
        const { data: urlData } = supabase.storage
          .from('exercise-gifs')
          .getPublicUrl(file.name);
        
        const gifUrl = urlData.publicUrl;

        const { error: insertError } = await supabase
          .from('exercise_library')
          .insert({
            name: exerciseName,
            muscle_group: muscleGroup,
            gif_url: gifUrl,
            difficulty: 'intermediate',
            sets: 3,
            reps: '10-12',
            rest_time: 60,
            equipment: [],
            instructions: [],
            tips: [],
            description: `${exerciseName} - Exercício para ${muscleGroup}`
          });

        if (insertError) {
          console.error(`❌ Failed to insert ${exerciseName}:`, insertError);
          results.failed++;
          results.errors.push(`${file.name}: ${insertError.message}`);
        } else {
          console.log(`✅ Created: ${exerciseName} (${muscleGroup})`);
          results.created++;
          results.muscleGroups[muscleGroup] = (results.muscleGroups[muscleGroup] || 0) + 1;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error processing ${file.name}:`, error);
        results.failed++;
        results.errors.push(`${file.name}: ${errorMessage}`);
      }
    }

    console.log('🎉 Rebuild complete!');
    console.log(`✅ Created: ${results.created}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('📊 Muscle groups:', results.muscleGroups);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exercise library rebuilt successfully',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function extractExerciseName(filename: string): string {
  return filename.replace(/\.(gif|png|jpg)$/i, '').trim();
}

function detectMuscleGroup(filename: string): string {
  const lower = filename.toLowerCase();
  
  const mappings = [
    { 
      keywords: ['supino', 'crucifixo', 'fly', 'peitoral', 'crossover', 'chest', 'press_peito', 'peck', 'dips_peito'], 
      group: 'peito' 
    },
    { 
      keywords: ['puxada', 'remada', 'pulldown', 'pulley', 'serrote', 'barra_fixa', 'pull_up', 'pullover', 'dorsal', 'costas', 'back'], 
      group: 'costas' 
    },
    { 
      keywords: ['agachamento', 'leg_press', 'extensora', 'flexora', 'hack', 'cadeira', 'panturrilha', 'squat', 'afundo', 'lunge', 'calf', 'perna'], 
      group: 'pernas' 
    },
    { 
      keywords: ['desenvolvimento', 'elevacao_lateral', 'elevacao_frontal', 'posterior', 'shoulder', 'ombro', 'arnold', 'militar'], 
      group: 'ombros' 
    },
    { 
      keywords: ['rosca', 'biceps', 'martelo', 'scott', 'concentrada', 'curl', 'bicep'], 
      group: 'biceps' 
    },
    { 
      keywords: ['triceps', 'frances', 'testa', 'corda', 'mergulho', 'pushdown', 'tricep', 'dips_triceps'], 
      group: 'triceps' 
    },
    { 
      keywords: ['abdominal', 'prancha', 'crunch', 'obliquo', 'infra', 'abs', 'abdomen', 'plank'], 
      group: 'abdomen' 
    },
    { 
      keywords: ['gluteo', 'hip_thrust', 'elevacao_pelvica', 'coice', 'glute', 'gluteos', 'kickback'], 
      group: 'gluteos' 
    },
    { 
      keywords: ['antebraco', 'punho', 'wrist', 'forearm', 'grip'], 
      group: 'antebraco' 
    },
    { 
      keywords: ['corrida', 'bike', 'esteira', 'pular_corda', 'jumping', 'cardio', 'burpee', 'mountain', 'climber'], 
      group: 'cardio' 
    },
    { 
      keywords: ['adut', 'adutor', 'adduct', 'cadeira_adutora'], 
      group: 'adutores' 
    }
  ];
  
  for (const { keywords, group } of mappings) {
    if (keywords.some(kw => lower.includes(kw))) {
      return group;
    }
  }
  
  console.log(`⚠️ No muscle group detected for: ${filename}, defaulting to 'outros'`);
  return 'outros';
}
