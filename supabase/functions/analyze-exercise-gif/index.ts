import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { imageBase64, fileName } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um especialista em exercícios físicos. Analise esta imagem/GIF de exercício e identifique:

1. O nome EXATO do exercício demonstrado (em português)
2. O grupo muscular principal trabalhado
3. Os equipamentos utilizados
4. O nível de confiança da sua identificação (alta/média/baixa)

IMPORTANTE:
- Seja MUITO específico com o nome: diferencie variações como "Supino Reto" vs "Supino Inclinado" vs "Supino Declinado"
- Especifique se é "com Barra", "com Halteres", "na Máquina", "com Cabo", etc.
- Especifique a pegada quando relevante: "Pegada Pronada", "Supinada", "Neutra", "Aberta", "Fechada"
- Para pernas, diferencie: "Agachamento Livre", "Agachamento Smith", "Leg Press 45°", etc.
- Para remadas, especifique: "Remada Curvada", "Remada Cavalinho", "Remada Unilateral", etc.

Responda APENAS com um JSON no seguinte formato:
{
  "exerciseName": "nome específico do exercício em português",
  "muscleGroup": "grupo muscular principal",
  "equipment": ["equipamento1", "equipamento2"],
  "confidence": "alta/média/baixa",
  "description": "breve descrição do movimento observado"
}`;

    console.log('Analisando exercício:', fileName);

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'user', 
              content: [
                { type: 'text', text: systemPrompt },
                { 
                  type: 'image_url',
                  image_url: { url: imageBase64 }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da Lovable AI:', errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit excedido. Aguarde alguns segundos.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Adicione créditos ao seu workspace.');
      }
      
      throw new Error(`Erro na Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da IA recebida');

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Nenhuma resposta da IA');
    }

    const text = data.choices[0].message.content;
    console.log('Texto da resposta:', text);

    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          exerciseName: analysis.exerciseName || '',
          muscleGroup: analysis.muscleGroup || '',
          equipment: Array.isArray(analysis.equipment) ? analysis.equipment : [],
          confidence: analysis.confidence || 'baixa',
          description: analysis.description || ''
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função analyze-exercise-gif:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
