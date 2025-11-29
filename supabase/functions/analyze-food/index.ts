import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Banco de dados nutricional expandido (valores por 100g)
const nutritionDatabase: Record<string, any> = {
  // ==================== FRUTAS ====================
  "maçã": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: "100g" },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: "100g" },
  "laranja": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, portion: "100g" },
  "morango": { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, portion: "100g" },
  "abacate": { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, portion: "100g" },
  "manga": { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, portion: "100g" },
  "mamão": { calories: 43, protein: 0.5, carbs: 11, fat: 0.1, portion: "100g" },
  "melancia": { calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, portion: "100g" },
  "uva": { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, portion: "100g" },
  "abacaxi": { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, portion: "100g" },
  "kiwi": { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, portion: "100g" },
  "pêra": { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, portion: "100g" },
  
  // ==================== GRÃOS E CEREAIS ====================
  "arroz integral": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: "100g cozido" },
  "arroz branco": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g cozido" },
  "arroz branco cozido": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g" },
  "arroz integral cozido": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, portion: "100g" },
  "arroz": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: "100g" },
  "arroz à grega": { calories: 150, protein: 3, carbs: 28, fat: 3, portion: "100g" },
  "pão integral": { calories: 247, protein: 13, carbs: 41, fat: 3.4, portion: "100g" },
  "pão": { calories: 265, protein: 9, carbs: 49, fat: 3.2, portion: "100g" },
  "pão francês": { calories: 300, protein: 8.5, carbs: 58, fat: 3.3, portion: "100g" },
  "pão de queijo": { calories: 330, protein: 7, carbs: 40, fat: 15, portion: "100g" },
  "macarrão": { calories: 131, protein: 5, carbs: 25, fat: 1.1, portion: "100g cozido" },
  "espaguete": { calories: 131, protein: 5, carbs: 25, fat: 1.1, portion: "100g cozido" },
  "macarrão carbonara": { calories: 167, protein: 6, carbs: 20, fat: 7, portion: "100g" },
  "lasanha": { calories: 135, protein: 5.5, carbs: 13, fat: 6, portion: "100g" },
  "aveia": { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, portion: "100g" },
  "tapioca": { calories: 98, protein: 0.2, carbs: 24, fat: 0.1, portion: "100g" },
  "cuscuz": { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, portion: "100g" },
  "polenta": { calories: 85, protein: 2, carbs: 18, fat: 0.5, portion: "100g cozida" },
  "quinoa": { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, portion: "100g cozida" },
  
  // ==================== LEGUMINOSAS ====================
  "feijão preto": { calories: 132, protein: 8.9, carbs: 24, fat: 0.5, portion: "100g cozido" },
  "feijão carioca": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g cozido" },
  "feijão carioca cozido": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g" },
  "feijão": { calories: 100, protein: 6, carbs: 18, fat: 0.5, portion: "100g" },
  "feijoada": { calories: 150, protein: 9, carbs: 12, fat: 8, portion: "100g" },
  "lentilha": { calories: 116, protein: 9, carbs: 20, fat: 0.4, portion: "100g cozida" },
  "grão-de-bico": { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, portion: "100g cozido" },
  "ervilha": { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, portion: "100g cozida" },
  
  // ==================== PROTEÍNAS - AVES ====================
  "frango grelhado": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "peito de frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "peito de frango grelhado": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "frango": { calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: "100g" },
  "frango empanado": { calories: 260, protein: 18, carbs: 15, fat: 15, portion: "100g" },
  "frango com quiabo": { calories: 120, protein: 15, carbs: 5, fat: 5, portion: "100g" },
  "coxa de frango": { calories: 232, protein: 23, carbs: 0, fat: 15, portion: "100g" },
  
  // ==================== PROTEÍNAS - CARNES ====================
  "carne bovina": { calories: 250, protein: 26, carbs: 0, fat: 15, portion: "100g" },
  "carne": { calories: 250, protein: 26, carbs: 0, fat: 15, portion: "100g" },
  "picanha": { calories: 310, protein: 20, carbs: 0, fat: 26, portion: "100g" },
  "costela bovina": { calories: 338, protein: 17, carbs: 0, fat: 30, portion: "100g" },
  "contra-filé": { calories: 217, protein: 27, carbs: 0, fat: 11, portion: "100g" },
  "cupim": { calories: 280, protein: 22, carbs: 0, fat: 21, portion: "100g" },
  "bisteca suína": { calories: 242, protein: 25, carbs: 0, fat: 15, portion: "100g" },
  "linguiça": { calories: 301, protein: 13, carbs: 2, fat: 27, portion: "100g" },
  "bacon": { calories: 541, protein: 37, carbs: 1.4, fat: 42, portion: "100g" },
  "almôndega": { calories: 197, protein: 12, carbs: 8, fat: 13, portion: "100g" },
  "kibe": { calories: 213, protein: 12, carbs: 12, fat: 13, portion: "100g" },
  "kafta": { calories: 230, protein: 14, carbs: 5, fat: 17, portion: "100g" },
  
  // ==================== PROTEÍNAS - PEIXES E FRUTOS DO MAR ====================
  "peixe grelhado": { calories: 206, protein: 22, carbs: 0, fat: 12, portion: "100g" },
  "peixe": { calories: 206, protein: 22, carbs: 0, fat: 12, portion: "100g" },
  "salmão": { calories: 208, protein: 20, carbs: 0, fat: 13, portion: "100g" },
  "atum": { calories: 132, protein: 28, carbs: 0, fat: 1, portion: "100g" },
  "tilápia": { calories: 96, protein: 20, carbs: 0, fat: 1.7, portion: "100g" },
  "sardinha": { calories: 208, protein: 25, carbs: 0, fat: 11, portion: "100g" },
  "camarão": { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, portion: "100g" },
  "lula": { calories: 92, protein: 15.6, carbs: 3.1, fat: 1.4, portion: "100g" },
  "moqueca de peixe": { calories: 130, protein: 12, carbs: 5, fat: 7, portion: "100g" },
  "bobó de camarão": { calories: 165, protein: 10, carbs: 12, fat: 9, portion: "100g" },
  
  // ==================== OVOS ====================
  "ovo": { calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: "unidade (50g)" },
  "ovo cozido": { calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: "100g" },
  "ovo frito": { calories: 196, protein: 13.6, carbs: 0.8, fat: 15, portion: "100g" },
  "omelete": { calories: 154, protein: 10.6, carbs: 1.6, fat: 11.7, portion: "100g" },
  
  // ==================== VEGETAIS ====================
  "batata doce": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, portion: "100g" },
  "batata": { calories: 77, protein: 2, carbs: 17, fat: 0.1, portion: "100g" },
  "batata frita": { calories: 312, protein: 3.4, carbs: 41, fat: 15, portion: "100g" },
  "purê de batata": { calories: 83, protein: 2, carbs: 16, fat: 1, portion: "100g" },
  "mandioca": { calories: 125, protein: 0.6, carbs: 30, fat: 0.3, portion: "100g cozida" },
  "brócolis": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, portion: "100g" },
  "brócolis cozido": { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, portion: "100g" },
  "salada": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, portion: "100g" },
  "alface": { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, portion: "100g" },
  "tomate": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, portion: "100g" },
  "cenoura": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, portion: "100g" },
  "pimentão": { calories: 20, protein: 1, carbs: 4.6, fat: 0.3, portion: "100g" },
  "cebola": { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, portion: "100g" },
  "abobrinha": { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, portion: "100g" },
  "abóbora": { calories: 26, protein: 1, carbs: 6.5, fat: 0.1, portion: "100g" },
  "berinjela": { calories: 25, protein: 1, carbs: 5.9, fat: 0.2, portion: "100g" },
  "chuchu": { calories: 19, protein: 0.8, carbs: 4.5, fat: 0.1, portion: "100g" },
  "couve": { calories: 33, protein: 3.3, carbs: 5.4, fat: 0.4, portion: "100g" },
  "espinafre": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, portion: "100g" },
  "pepino": { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, portion: "100g" },
  "repolho": { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, portion: "100g" },
  "quiabo": { calories: 33, protein: 2, carbs: 7, fat: 0.2, portion: "100g" },
  
  // ==================== LATICÍNIOS ====================
  "leite": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, portion: "100ml" },
  "leite desnatado": { calories: 35, protein: 3.4, carbs: 5, fat: 0.2, portion: "100ml" },
  "iogurte": { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, portion: "100g" },
  "iogurte grego": { calories: 97, protein: 9, carbs: 3.6, fat: 5, portion: "100g" },
  "queijo": { calories: 402, protein: 25, carbs: 1.3, fat: 33, portion: "100g" },
  "queijo minas": { calories: 264, protein: 17.4, carbs: 3.6, fat: 20, portion: "100g" },
  "requeijão": { calories: 235, protein: 9, carbs: 5, fat: 20, portion: "100g" },
  "cream cheese": { calories: 342, protein: 5.9, carbs: 4.1, fat: 34, portion: "100g" },
  
  // ==================== PRATOS TÍPICOS BRASILEIROS ====================
  "feijoada completa": { calories: 160, protein: 10, carbs: 12, fat: 9, portion: "100g" },
  "vatapá": { calories: 180, protein: 8, carbs: 15, fat: 10, portion: "100g" },
  "acarajé": { calories: 245, protein: 6, carbs: 25, fat: 13, portion: "100g" },
  "coxinha": { calories: 280, protein: 8, carbs: 25, fat: 16, portion: "100g" },
  "pastel": { calories: 314, protein: 6, carbs: 30, fat: 19, portion: "100g" },
  "virado à paulista": { calories: 140, protein: 8, carbs: 18, fat: 5, portion: "100g" },
  "galinhada": { calories: 145, protein: 12, carbs: 16, fat: 5, portion: "100g" },
  "baião de dois": { calories: 125, protein: 6, carbs: 20, fat: 3, portion: "100g" },
  "escondidinho": { calories: 158, protein: 8, carbs: 18, fat: 6, portion: "100g" },
  "empadão": { calories: 250, protein: 9, carbs: 22, fat: 14, portion: "100g" },
  "canjica": { calories: 130, protein: 3, carbs: 26, fat: 2, portion: "100g" },
  "farofa": { calories: 360, protein: 6, carbs: 60, fat: 12, portion: "100g" },
  "vinagrete": { calories: 35, protein: 0.8, carbs: 7, fat: 0.5, portion: "100g" },
  "tutu de feijão": { calories: 85, protein: 5, carbs: 14, fat: 1, portion: "100g" },
  
  // ==================== PRATOS INTERNACIONAIS ====================
  "pizza margherita": { calories: 266, protein: 11, carbs: 33, fat: 10, portion: "100g" },
  "pizza": { calories: 266, protein: 11, carbs: 33, fat: 10, portion: "100g" },
  "hambúrguer": { calories: 295, protein: 17, carbs: 24, fat: 14, portion: "100g" },
  "hot dog": { calories: 290, protein: 10, carbs: 25, fat: 17, portion: "100g" },
  "cachorro-quente": { calories: 290, protein: 10, carbs: 25, fat: 17, portion: "100g" },
  "x-tudo": { calories: 320, protein: 15, carbs: 28, fat: 18, portion: "100g" },
  "bauru": { calories: 285, protein: 14, carbs: 26, fat: 14, portion: "100g" },
  "misto quente": { calories: 264, protein: 13, carbs: 26, fat: 12, portion: "100g" },
  "sanduíche natural": { calories: 180, protein: 8, carbs: 24, fat: 6, portion: "100g" },
  "wrap": { calories: 210, protein: 9, carbs: 28, fat: 7, portion: "100g" },
  "burrito": { calories: 206, protein: 10, carbs: 27, fat: 6, portion: "100g" },
  "taco": { calories: 226, protein: 9, carbs: 25, fat: 10, portion: "100g" },
  "sushi": { calories: 143, protein: 6, carbs: 24, fat: 2, portion: "100g" },
  "sashimi": { calories: 127, protein: 20.5, carbs: 0, fat: 4.3, portion: "100g" },
  "yakisoba": { calories: 128, protein: 5, carbs: 20, fat: 3, portion: "100g" },
  "pad thai": { calories: 190, protein: 6, carbs: 28, fat: 6, portion: "100g" },
  "risoto": { calories: 130, protein: 3, carbs: 22, fat: 4, portion: "100g" },
  "espaguete bolonhesa": { calories: 145, protein: 7, carbs: 20, fat: 4, portion: "100g" },
  "strogonoff": { calories: 165, protein: 12, carbs: 8, fat: 10, portion: "100g" },
  "quiche": { calories: 235, protein: 10, carbs: 18, fat: 14, portion: "100g" },
  "croissant": { calories: 406, protein: 8, carbs: 46, fat: 21, portion: "100g" },
  "poke bowl": { calories: 156, protein: 12, carbs: 18, fat: 4, portion: "100g" },
  "shawarma": { calories: 225, protein: 12, carbs: 22, fat: 10, portion: "100g" },
  "falafel": { calories: 333, protein: 13, carbs: 32, fat: 18, portion: "100g" },
  "hummus": { calories: 166, protein: 8, carbs: 14, fat: 10, portion: "100g" },
  "guacamole": { calories: 160, protein: 2, carbs: 9, fat: 15, portion: "100g" },
  "ceviche": { calories: 97, protein: 15, carbs: 6, fat: 1.5, portion: "100g" },
  
  // ==================== SALADAS E ACOMPANHAMENTOS ====================
  "salada caesar": { calories: 190, protein: 5, carbs: 6, fat: 17, portion: "100g" },
  "coleslaw": { calories: 150, protein: 1.5, carbs: 12, fat: 11, portion: "100g" },
  "tabule": { calories: 115, protein: 3, carbs: 18, fat: 4, portion: "100g" },
  "sopa de legumes": { calories: 45, protein: 1.8, carbs: 9, fat: 0.5, portion: "100ml" },
  "caldo verde": { calories: 55, protein: 2, carbs: 8, fat: 1.5, portion: "100ml" },
  "creme de milho": { calories: 90, protein: 2.5, carbs: 15, fat: 2.5, portion: "100ml" },
  "pirão": { calories: 70, protein: 1, carbs: 15, fat: 0.5, portion: "100g" },
  
  // ==================== LANCHES E SNACKS ====================
  "esfiha": { calories: 260, protein: 8, carbs: 30, fat: 12, portion: "100g" },
  "empada": { calories: 290, protein: 7, carbs: 28, fat: 16, portion: "100g" },
  "risole": { calories: 240, protein: 6, carbs: 24, fat: 13, portion: "100g" },
  "bolinho de bacalhau": { calories: 245, protein: 12, carbs: 18, fat: 14, portion: "100g" },
  "croquete": { calories: 232, protein: 7, carbs: 24, fat: 12, portion: "100g" },
  "torta salgada": { calories: 245, protein: 8, carbs: 22, fat: 14, portion: "100g" },
  
  // ==================== BEBIDAS E SOBREMESAS ====================
  "café com leite": { calories: 45, protein: 2.5, carbs: 4.8, fat: 2, portion: "100ml" },
  "café": { calories: 2, protein: 0.3, carbs: 0, fat: 0, portion: "100ml" },
  "suco de laranja": { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, portion: "100ml" },
  "vitamina de banana": { calories: 90, protein: 3, carbs: 16, fat: 1.5, portion: "100ml" },
  "açaí": { calories: 70, protein: 0.8, carbs: 13, fat: 2, portion: "100g" },
  "pudim": { calories: 195, protein: 4.5, carbs: 29, fat: 7, portion: "100g" },
  "mousse de chocolate": { calories: 205, protein: 3.5, carbs: 24, fat: 11, portion: "100g" },
  "sorvete": { calories: 207, protein: 3.5, carbs: 24, fat: 11, portion: "100g" },
  "bolo de cenoura": { calories: 350, protein: 5, carbs: 50, fat: 15, portion: "100g" },
  "brigadeiro": { calories: 420, protein: 4, carbs: 58, fat: 20, portion: "100g" },
  "paçoca": { calories: 488, protein: 15, carbs: 50, fat: 26, portion: "100g" },
  "pé de moleque": { calories: 475, protein: 10, carbs: 62, fat: 22, portion: "100g" },
  "rapadura": { calories: 369, protein: 0.3, carbs: 95, fat: 0.1, portion: "100g" },
  "torta de limão": { calories: 270, protein: 4, carbs: 35, fat: 13, portion: "100g" },
  "cheesecake": { calories: 321, protein: 5.5, carbs: 25, fat: 23, portion: "100g" },
  "petit gateau": { calories: 380, protein: 6, carbs: 40, fat: 22, portion: "100g" },
};

// Função para buscar dados nutricionais da API USDA (com retry)
async function fetchUSDANutrition(foodName: string, retryCount = 0): Promise<any | null> {
  try {
    const apiKey = "DEMO_KEY"; // API pública gratuita
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${apiKey}&pageSize=1`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      if (response.status === 429 && retryCount < 1) {
        // Retry após rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUSDANutrition(foodName, retryCount + 1);
      }
      return null;
    }
    
    const data = await response.json();
    const food = data.foods?.[0];
    
    if (!food) return null;
    
    // Extrair nutrientes
    const nutrients = food.foodNutrients || [];
    const getN = (name: string) => nutrients.find((n: any) => n.nutrientName.toLowerCase().includes(name.toLowerCase()))?.value || 0;
    
    return {
      calories: getN("Energy") || getN("Calories"),
      protein: getN("Protein"),
      carbs: getN("Carbohydrate"),
      fat: getN("Total lipid") || getN("Fat"),
      source: "USDA API"
    };
  } catch (error) {
    console.error(`Erro ao buscar ${foodName} na USDA:`, error);
    return null;
  }
}

// Função para fazer matching flexível do banco local
function findLocalNutrition(foodName: string): any | null {
  const searchName = foodName.toLowerCase().trim();
  
  // 1. Busca exata
  if (nutritionDatabase[searchName]) {
    return { ...nutritionDatabase[searchName], source: "Local DB (exact)" };
  }
  
  // 2. Busca parcial (ingrediente contém termo ou termo contém ingrediente)
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (searchName.includes(key) || key.includes(searchName)) {
      return { ...value, source: `Local DB (partial: ${key})` };
    }
  }
  
  // 3. Busca por palavras-chave principais
  const keywords = searchName.split(" ");
  for (const keyword of keywords) {
    if (keyword.length < 3) continue; // Ignora palavras muito curtas
    
    for (const [key, value] of Object.entries(nutritionDatabase)) {
      if (key.includes(keyword)) {
        return { ...value, source: `Local DB (keyword: ${key})` };
      }
    }
  }
  
  return null;
}

// Função para estimar porção em gramas
function estimatePortionGrams(portionText: string): number {
  const match = portionText.match(/(\d+)\s*g/i);
  if (match) return parseInt(match[1]);
  
  const matchMl = portionText.match(/(\d+)\s*ml/i);
  if (matchMl) return parseInt(matchMl[1]); // 1ml ≈ 1g para líquidos
  
  // Estimativas para porções comuns
  if (portionText.includes("unidade") || portionText.includes("unit")) return 50;
  if (portionText.includes("colher")) return 15;
  if (portionText.includes("xícara") || portionText.includes("cup")) return 240;
  if (portionText.includes("prato")) return 200;
  
  return 100; // Default 100g
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, imageBase64 } = await req.json();
    const image = imageData || imageBase64;
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração de IA não disponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Iniciando análise de imagem com Google Gemini...");

    // Preparar imagem para a API (remover prefixo data:image se presente)
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

    const systemPrompt = `Analise a imagem e retorne APENAS um JSON válido neste formato:
{
  "foods": [
    {
      "name": "nome do alimento",
      "portion": "quantidade (ex: 150g)",
      "confidence": "alta/média/baixa"
    }
  ],
  "notes": "resumo breve"
}
NÃO calcule macros, apenas liste os alimentos e porções. Seja conciso.`;

    // Chamar Google Gemini API diretamente
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API do Google Gemini:", response.status, errorText);
      
      // Tratamento para limite de requisições
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requisições excedido",
            message: "Você atingiu o limite de requisições da API do Google. Tente novamente em alguns instantes."
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Erro genérico para outros casos
      return new Response(
        JSON.stringify({ 
          error: "Erro ao analisar imagem com IA",
          message: `Erro ${response.status}: Não foi possível processar a análise da imagem. Verifique sua chave de API do Google.`
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    console.log("Resposta do Google Gemini recebida");
    console.log("Estrutura da resposta:", JSON.stringify(aiResponse).substring(0, 500));

    // Extrair conteúdo da resposta (formato Google Gemini)
    const candidate = aiResponse.candidates?.[0];
    if (!candidate) {
      console.error("Nenhum candidato na resposta:", JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ 
          error: "Resposta inválida da API",
          details: "Nenhum candidato retornado pelo modelo"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o conteúdo foi bloqueado por segurança
    if (candidate.finishReason === "SAFETY") {
      console.error("Conteúdo bloqueado por filtros de segurança:", JSON.stringify(candidate.safetyRatings));
      return new Response(
        JSON.stringify({ 
          error: "Imagem bloqueada por filtros de segurança",
          message: "A imagem foi bloqueada pelos filtros de segurança da API. Por favor, tente com outra imagem de alimento."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar limite de tokens
    if (candidate.finishReason === "MAX_TOKENS") {
      console.error("Resposta cortada por limite de tokens. Candidato:", JSON.stringify(candidate));
      return new Response(
        JSON.stringify({ 
          error: "Resposta muito longa da IA",
          message: "A resposta da IA foi cortada por limite de tamanho. Tente novamente com uma imagem mais simples ou recorte o prato para focar apenas na comida principal."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Juntar todos os trechos de texto disponíveis
    const textParts = candidate.content?.parts
      ?.map((p: any) => p.text)
      .filter((t: string | undefined) => !!t);

    const aiContent = textParts && textParts.length > 0 ? textParts.join("\n") : "";

    if (!aiContent) {
      console.error("Conteúdo vazio. Candidato completo:", JSON.stringify(candidate));
      console.error("Finish reason:", candidate.finishReason);
      return new Response(
        JSON.stringify({ 
          error: "Não foi possível analisar a imagem",
          details: `Conteúdo de resposta vazio. Motivo: ${candidate.finishReason || "desconhecido"}`
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Conteúdo extraído com sucesso");

    // Parse do JSON retornado pela IA
    let aiResult;
    try {
      // Extrair JSON da resposta (pode vir com texto ao redor)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Formato de resposta inválido");
      }
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", parseError);
      console.error("Conteúdo recebido:", aiContent);
      return new Response(
        JSON.stringify({ error: "Erro ao processar resposta da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enriquecer com dados nutricionais (API -> Local DB -> Estimativa)
    const enrichedFoods = await Promise.all(
      aiResult.foods.map(async (food: any) => {
        const foodName = food.name.toLowerCase();
        const portionGrams = estimatePortionGrams(food.portion || "100g");
        let nutritionData = null;
        let isEstimated = false;
        
        // 1. Tentar buscar na API USDA
        console.log(`Buscando nutrição para: ${foodName}`);
        nutritionData = await fetchUSDANutrition(foodName);
        
        // 2. Se API falhar, buscar no banco local com matching flexível
        if (!nutritionData) {
          console.log(`USDA falhou, buscando localmente: ${foodName}`);
          nutritionData = findLocalNutrition(foodName);
        }
        
        // 3. Se ainda não encontrou, usar estimativa básica
        if (!nutritionData) {
          console.warn(`⚠️ Não encontrado: ${foodName} - usando estimativa`);
          isEstimated = true;
          nutritionData = {
            calories: 100, // Estimativa conservadora
            protein: 5,
            carbs: 15,
            fat: 3,
            source: "Estimativa (não encontrado)"
          };
        }
        
        // Calcular valores baseados na porção
        const multiplier = portionGrams / 100; // Base é sempre 100g
        const calculatedCalories = Math.round((nutritionData.calories || 0) * multiplier);
        const calculatedProtein = Math.round((nutritionData.protein || 0) * multiplier * 10) / 10;
        const calculatedCarbs = Math.round((nutritionData.carbs || 0) * multiplier * 10) / 10;
        const calculatedFat = Math.round((nutritionData.fat || 0) * multiplier * 10) / 10;
        
        console.log(`${foodName}: ${portionGrams}g = ${calculatedCalories} kcal (fonte: ${nutritionData.source})`);
        
        return {
          ...food,
          portionGrams,
          calories: calculatedCalories,
          protein: calculatedProtein,
          carbs: calculatedCarbs,
          fat: calculatedFat,
          source: nutritionData.source,
          isEstimated,
          ...(isEstimated && { note: "Valores estimados - alimento não encontrado nas bases de dados" })
        };
      })
    );

    // Recalcular totais com dados enriquecidos
    const totals = enrichedFoods.reduce(
      (acc: any, food: any) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    // Validação: NUNCA retornar totais zerados se alimentos foram detectados
    if (enrichedFoods.length > 0 && totals.calories === 0) {
      console.error("⚠️ ERRO: Total de calorias zerado com alimentos detectados!");
      console.error("Foods:", enrichedFoods);
      
      // Recalcular com estimativa mínima (média de 150 kcal por alimento)
      const estimatedCalories = enrichedFoods.length * 150;
      const estimatedProtein = enrichedFoods.length * 8;
      const estimatedCarbs = enrichedFoods.length * 20;
      const estimatedFat = enrichedFoods.length * 5;
      
      totals.calories = estimatedCalories;
      totals.protein = estimatedProtein;
      totals.carbs = estimatedCarbs;
      totals.fat = estimatedFat;
      
      // Marcar todos como estimados
      enrichedFoods.forEach(food => {
        food.isEstimated = true;
        food.note = "Valores estimados por falha no cálculo original";
      });
    }
    
    // Arredondar totais
    totals.calories = Math.round(totals.calories);
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;
    
    const hasEstimated = enrichedFoods.some((f: any) => f.isEstimated);

    // Calcular confiança média
    const avgConfidence = enrichedFoods.reduce((sum: number, f: any) => {
      const confidence = f.confidence === 'alta' ? 0.9 : f.confidence === 'média' ? 0.7 : 0.5;
      return sum + confidence;
    }, 0) / enrichedFoods.length;

    // Formatar resposta no padrão esperado pelo componente
    const result = {
      status: 'sucesso',
      analise: {
        alimentos: enrichedFoods.map((food: any) => ({
          name: food.name,
          quantity: food.portion || `${food.portionGrams}g`,
          confidence: food.confidence === 'alta' ? 0.9 : food.confidence === 'média' ? 0.7 : 0.5,
          nutrition: {
            calories: food.calories || 0,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
          },
          source: food.source || 'Estimativa'
        })),
        total_refeicao: {
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
        },
        metadados: {
          timestamp: new Date().toISOString(),
          fontes_utilizadas: [...new Set(enrichedFoods.map((f: any) => f.source || 'Estimativa'))],
          confianca_media: avgConfidence,
        }
      },
      isEstimated: hasEstimated,
      notes: aiResult.notes || "",
    };

    console.log("✅ Análise concluída:", {
      foodsCount: enrichedFoods.length,
      totalCalories: totals.calories,
      isEstimated: hasEstimated
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função analyze-food:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro inesperado ao analisar imagem",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
