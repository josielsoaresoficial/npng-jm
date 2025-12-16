import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Loader2, Check, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/untyped";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FoodAnalysisResult {
  status: string;
  analise: {
    alimentos: Array<{
      name: string;
      quantity: string;
      confidence: number;
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
      source: string;
    }>;
    total_refeicao: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
    };
    metadados: {
      timestamp: string;
      fontes_utilizadas: string[];
      confianca_media: number;
    };
  };
}

export const FoodPhotoAnalyzer = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [editingFood, setEditingFood] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedGrams, setEditedGrams] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      analyzeImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log("Enviando imagem para análise...");
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64 }
      });

      if (error) {
        // Verificar se há mensagem específica no erro
        const errorMessage = data?.message || data?.error || error.message;
        
        // Tratamento específico para créditos insuficientes
        if (errorMessage.includes('Créditos insuficientes') || errorMessage.includes('créditos')) {
          toast.error("Créditos insuficientes", {
            description: "Você não possui créditos suficientes para análise de IA. Recarregue seus créditos ou aguarde a renovação mensal."
          });
        } else {
          toast.error("Erro na Análise", {
            description: errorMessage || "Não foi possível analisar a imagem. Tente novamente."
          });
        }
        return;
      }

      console.log("Resultado da análise:", data);
      
      if (data.status === 'sucesso') {
        setAnalysisResult(data);
        toast.success("Alimento identificado com sucesso! Revise as informações antes de salvar.");
      } else {
        toast.error("Erro na análise", {
          description: data.message || data.error || "Não foi possível processar a análise."
        });
      }

    } catch (error: any) {
      console.error('Erro ao analisar imagem:', error);
      
      // Verificar se há mensagem específica no erro
      const errorMessage = error?.message || "Erro ao analisar imagem. Tente novamente.";
      
      toast.error("Erro na Análise", {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditFood = (index: number) => {
    if (!analysisResult) return;
    
    const food = analysisResult.analise.alimentos[index];
    setEditingFood(index);
    setEditedName(food.name);
    
    // Extrair apenas os números da quantidade
    const gramsMatch = food.quantity.match(/(\d+)/);
    setEditedGrams(gramsMatch ? gramsMatch[1] : "");
  };

  const handleSaveEdit = () => {
    if (!analysisResult || editingFood === null) return;

    const food = analysisResult.analise.alimentos[editingFood];
    const originalGrams = parseFloat(food.quantity.match(/(\d+)/)?.[1] || "100");
    const newGrams = parseFloat(editedGrams);

    if (!newGrams || newGrams <= 0) {
      toast.error("Digite uma gramagem válida");
      return;
    }

    // Calcular proporção
    const ratio = newGrams / originalGrams;

    // Atualizar alimento
    const updatedFoods = [...analysisResult.analise.alimentos];
    updatedFoods[editingFood] = {
      ...food,
      name: editedName,
      quantity: `${newGrams}g`,
      nutrition: {
        calories: food.nutrition.calories * ratio,
        protein: food.nutrition.protein * ratio,
        carbs: food.nutrition.carbs * ratio,
        fat: food.nutrition.fat * ratio,
        fiber: food.nutrition.fiber ? food.nutrition.fiber * ratio : undefined
      }
    };

    // Recalcular totais
    const newTotals = updatedFoods.reduce((acc, curr) => ({
      calories: acc.calories + curr.nutrition.calories,
      protein: acc.protein + curr.nutrition.protein,
      carbs: acc.carbs + curr.nutrition.carbs,
      fat: acc.fat + curr.nutrition.fat,
      fiber: (acc.fiber || 0) + (curr.nutrition.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    setAnalysisResult({
      ...analysisResult,
      analise: {
        ...analysisResult.analise,
        alimentos: updatedFoods,
        total_refeicao: newTotals
      }
    });

    setEditingFood(null);
    toast.success("Alimento atualizado com sucesso!");
  };

  const saveToDatabase = async () => {
    if (!analysisResult || !user) return;

    try {
      const { total_refeicao, alimentos } = analysisResult.analise;

      // Preparar detalhes dos alimentos
      const foodsDetails = alimentos.map(food => ({
        name: food.name,
        quantity: food.quantity,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        confidence: food.confidence,
        source: food.source
      }));

      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        total_calories: Math.round(total_refeicao.calories),
        total_protein: Math.round(total_refeicao.protein),
        total_carbs: Math.round(total_refeicao.carbs),
        total_fat: Math.round(total_refeicao.fat),
        foods: foodsDetails,
        image_url: selectedImage,
        confidence_score: analysisResult.analise.metadados.confianca_media
      });

      if (error) throw error;

      toast.success("Refeição registrada com sucesso!");
      setSelectedImage(null);
      setAnalysisResult(null);
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error("Erro ao salvar refeição");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Análise por Foto</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tire ou envie uma foto do seu prato e deixe a IA identificar os alimentos e calcular os nutrientes automaticamente.
        </p>

        <div className="flex flex-col gap-4">
          <label htmlFor="food-photo" className="cursor-pointer">
            <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 hover:border-primary transition-colors text-center">
              <Camera className="w-12 h-12 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium">Clique para enviar uma foto</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG (máx 5MB)</p>
            </div>
            <input
              id="food-photo"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
          </label>

          {selectedImage && (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Alimento para análise" 
                className="w-full rounded-lg max-h-64 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analisando alimento...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Alimentos Identificados
                </h4>
                <div className="space-y-2">
                  {analysisResult.analise.alimentos.map((food, index) => (
                    <div key={index} className="bg-background rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">{food.quantity}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">
                              {Math.round(food.nutrition.calories)} kcal
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Confiança: {Math.round(food.confidence * 100)}%
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFood(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-muted-foreground">Proteína:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.protein)}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbo:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.carbs)}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gordura:</span>
                          <span className="ml-1 font-medium">{Math.round(food.nutrition.fat)}g</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Fonte: {food.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Total da Refeição</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(analysisResult.analise.total_refeicao.calories)}
                    </p>
                    <p className="text-xs text-muted-foreground">Calorias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {Math.round(analysisResult.analise.total_refeicao.protein)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">
                      {Math.round(analysisResult.analise.total_refeicao.carbs)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(analysisResult.analise.total_refeicao.fat)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Gorduras</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setShowConfirmDialog(true)} className="w-full" size="lg">
                Salvar Refeição
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={editingFood !== null} onOpenChange={() => setEditingFood(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Alimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="food-name">Nome do Alimento</Label>
              <Input
                id="food-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Ex: Arroz branco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="food-grams">Gramagem (g)</Label>
              <Input
                id="food-grams"
                type="number"
                value={editedGrams}
                onChange={(e) => setEditedGrams(e.target.value)}
                placeholder="Ex: 150"
              />
              <p className="text-xs text-muted-foreground">
                Os valores nutricionais serão recalculados automaticamente
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditingFood(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Gramaturas dos Alimentos</DialogTitle>
          </DialogHeader>
          {analysisResult && (
            <div className="py-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Total da Refeição</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(analysisResult.analise.total_refeicao.calories)}
                    </p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {Math.round(analysisResult.analise.total_refeicao.protein)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Proteína</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {Math.round(analysisResult.analise.total_refeicao.carbs)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {Math.round(analysisResult.analise.total_refeicao.fat)}g
                    </p>
                    <p className="text-xs text-muted-foreground">Gordura</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowConfirmDialog(false);
              saveToDatabase();
            }}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
