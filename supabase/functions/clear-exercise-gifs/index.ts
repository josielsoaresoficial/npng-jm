import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ Starting complete cleanup (storage + database)...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

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

    // Step 1: Delete all exercises from database
    console.log('🗄️ Deleting all exercises from database...');
    const { error: deleteDbError, count: deletedExercises } = await supabase
      .from('exercise_library')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteDbError) {
      console.error('Error deleting exercises from database:', deleteDbError);
      throw deleteDbError;
    }

    console.log(`✅ Deleted ${deletedExercises || 0} exercises from database`);

    // Step 2: List all files in the bucket with pagination
    console.log('📁 Listing all files in exercise-gifs bucket...');
    
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

    if (allFiles.length === 0) {
      console.log('ℹ️ No files in storage, but still deleting exercises from database');
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Storage já estava vazio. Exercícios do banco deletados.',
          stats: {
            exercises_deleted: deletedExercises || 0,
            files_deleted: 0,
            files_failed: 0,
            total_files: 0
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Step 3: Delete all files in batches
    console.log(`🗑️ Deleting ${allFiles.length} files from storage...`);
    
    const filePaths = allFiles.map(file => file.name);
    let deletedCount = 0;
    let failedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      
      const { data, error } = await supabase.storage
        .from('exercise-gifs')
        .remove(batch);

      if (error) {
        console.error(`Error deleting batch ${i / batchSize + 1}:`, error);
        failedCount += batch.length;
      } else {
        deletedCount += batch.length;
        console.log(`✅ Deleted batch ${i / batchSize + 1} (${batch.length} files)`);
      }
    }

    console.log(`🎉 Cleanup complete!`);
    console.log(`📊 Database: ${deletedExercises || 0} exercises deleted`);
    console.log(`📂 Storage: ${deletedCount} files deleted, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Limpeza completa realizada!`,
        stats: {
          exercises_deleted: deletedExercises || 0,
          files_deleted: deletedCount,
          files_failed: failedCount,
          total_files: allFiles.length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in clear-exercise-gifs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
