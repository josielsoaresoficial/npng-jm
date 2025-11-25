import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string;
  gif_url: string;
}

interface SelectExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercises: Exercise[]) => void;
}

export function SelectExerciseDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectExerciseDialogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const muscleGroups = [
    { key: "peito", label: "Peito" },
    { key: "costas", label: "Costas" },
    { key: "pernas", label: "Pernas" },
    { key: "ombros", label: "Ombros" },
    { key: "biceps", label: "Bíceps" },
    { key: "triceps", label: "Tríceps" },
    { key: "abdomen", label: "Abdômen" },
    { key: "gluteos", label: "Glúteos" },
    { key: "cardio", label: "Cardio" },
  ];

  useEffect(() => {
    if (open) {
      loadExercises();
      setSelectedExercises(new Set());
      setSearchTerm("");
      setSelectedMuscleGroup(null);
    }
  }, [open]);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchTerm, selectedMuscleGroup]);

  const loadExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercise_library")
      .select("id, name, muscle_group, difficulty, gif_url")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar exercícios");
      console.error(error);
    } else {
      setExercises(data || []);
    }
    setLoading(false);
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedMuscleGroup) {
      filtered = filtered.filter((ex) => ex.muscle_group === selectedMuscleGroup);
    }

    if (searchTerm) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  const toggleExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const handleConfirm = () => {
    const selected = exercises.filter((ex) => selectedExercises.has(ex.id));
    onSelect(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Exercícios</DialogTitle>
          <DialogDescription>
            Escolha os exercícios que deseja adicionar ao seu treino
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar exercícios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedMuscleGroup === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMuscleGroup(null)}
            >
              Todos
            </Button>
            {muscleGroups.map((group) => (
              <Button
                key={group.key}
                variant={selectedMuscleGroup === group.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMuscleGroup(group.key)}
              >
                {group.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum exercício encontrado
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredExercises.map((exercise) => {
                  const isSelected = selectedExercises.has(exercise.id);
                  return (
                    <Card
                      key={exercise.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleExercise(exercise.id)}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{exercise.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {exercise.muscle_group}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {exercise.difficulty}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedExercises.size} exercício(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedExercises.size === 0}
              >
                Adicionar ({selectedExercises.size})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
