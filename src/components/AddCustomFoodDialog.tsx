import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AddCustomFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCustomFoodDialog({ open, onOpenChange, onSuccess }: AddCustomFoodDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    portion: "100g",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do alimento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const calories = parseInt(formData.calories);
    const protein = parseFloat(formData.protein);
    const carbs = parseFloat(formData.carbs);
    const fat = parseFloat(formData.fat);

    if (isNaN(calories) || calories < 0) {
      toast({
        title: "Erro",
        description: "Calorias deve ser um número válido maior ou igual a 0",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(protein) || protein < 0 || isNaN(carbs) || carbs < 0 || isNaN(fat) || fat < 0) {
      toast({
        title: "Erro",
        description: "Proteínas, carboidratos e gorduras devem ser números válidos maiores ou iguais a 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("custom_foods").insert({
        user_id: user.id,
        name: formData.name.trim(),
        calories,
        protein,
        carbs,
        fat,
        portion: formData.portion.trim() || "100g",
        notes: formData.notes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Alimento personalizado adicionado com sucesso",
      });

      // Reset form
      setFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        portion: "100g",
        notes: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao adicionar alimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o alimento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Alimento Personalizado</DialogTitle>
          <DialogDescription>
            Cadastre um novo alimento com suas informações nutricionais
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Alimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Bolo de chocolate caseiro"
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorias (kcal) *</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                step="1"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portion">Porção *</Label>
              <Input
                id="portion"
                value={formData.portion}
                onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                placeholder="100g"
                maxLength={50}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Macronutrientes (g) *</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="protein" className="text-xs text-muted-foreground">
                  Proteínas
                </Label>
                <Input
                  id="protein"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="carbs" className="text-xs text-muted-foreground">
                  Carboidratos
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fat" className="text-xs text-muted-foreground">
                  Gorduras
                </Label>
                <Input
                  id="fat"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Receita da vovó, versão sem lactose..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
