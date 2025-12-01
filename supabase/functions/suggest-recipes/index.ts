import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fitnessGoal, dailyCalories, dailyProtein, dailyCarbs, dailyFat } = await req.json();

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY não configurada');
    }

    // Mapear objetivos para contexto nutricional
    const goalMap: Record<string, string> = {
      'weight_loss': 'perda de peso com déficit calórico, rica em proteínas e baixa em carboidratos',
      'muscle_gain': 'ganho de massa muscular com superávit calórico, muito rica em proteínas',
      'maintenance': 'manutenção do peso com macros balanceados',
      'endurance': 'resistência com ênfase em carboidratos complexos',
      'strength': 'força e potência com alta proteína e carboidratos moderados',
    };
    const goalContext = goalMap[fitnessGoal] || 'saudável e balanceada';

    const prompt = `Você é um chef especializado em nutrição esportiva e fitness. Gere EXATAMENTE 3 receitas aleatórias e variadas para um objetivo de ${goalContext}.

IMPORTANTE:
- As receitas devem ser COMPLETAMENTE DIFERENTES entre si (café da manhã, almoço, jantar)
- Varie os tipos de proteína (frango, peixe, carne vermelha, ovos, leguminosas)
- Inclua diferentes estilos culinários (brasileiro, mediterrâneo, asiático, etc)
- Seja criativo e evite receitas genéricas
- Cada receita deve ter valores nutricionais compatíveis com as metas diárias

Metas nutricionais diárias:
- Calorias: ${dailyCalories} kcal
- Proteína: ${dailyProtein}g
- Carboidratos: ${dailyCarbs}g
- Gorduras: ${dailyFat}g

Para cada receita, considere que ela representa uma refeição (cerca de 25-35% das metas diárias).

RETORNE UM JSON VÁLIDO com este formato EXATO:
{
  "recipes": [
    {
      "title": "Nome da receita",
      "description": "Descrição breve",
      "prepTime": "30 min",
      "servings": 2,
      "calories": 500,
      "protein": 30,
      "carbs": 60,
      "fat": 15,
      "ingredients": ["ingrediente 1 com quantidade", "ingrediente 2"],
      "instructions": ["passo 1", "passo 2"],
      "category": "Almoço"
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API Google Gemini:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de requisições da API excedido. Por favor, aguarde 30 segundos e tente novamente.',
            retryAfter: 30
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Erro ao gerar receitas');
    }

    const data = await response.json();
    console.log('Resposta da API:', JSON.stringify(data, null, 2));

    // Removed MAX_TOKENS check - let the model complete the response

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Nenhuma receita gerada');
    }

    const recipes = JSON.parse(content).recipes;

    return new Response(
      JSON.stringify({ recipes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro em suggest-recipes:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao gerar receitas' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
