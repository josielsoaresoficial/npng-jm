import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { Plus, X, GripVertical } from "lucide-react";
import { SelectExerciseDialog } from "@/components/SelectExerciseDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string;
  gif_url: string;
  order_index: number;
  sets: number;
  reps: string;
  rest_time: number;
  notes?: string;
}

interface CreateCustomWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  workout?: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
  } | null;
}

export function CreateCustomWorkoutDialog({
  open,
  onOpenChange,
  onSuccess,
  workout,
}: CreateCustomWorkoutDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectExerciseOpen, setSelectExerciseOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setDescription(workout.description || "");
      setDifficulty(workout.difficulty);
      loadWorkoutExercises(workout.id);
    } else {
      resetForm();
    }
  }, [workout, open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDifficulty("intermediate");
    setExercises([]);
  };

  const loadWorkoutExercises = async (workoutId: string) => {
    const { data, error } = await supabase
      .from("custom_workout_exercises")
      .select(`
        id,
        order_index,
        sets,
        reps,
        rest_time,
        notes,
        exercise_library (
          id,
          name,
          muscle_group,
          difficulty,
          gif_url
        )
      `)
      .eq("custom_workout_id", workoutId)
      .order("order_index");

    if (error) {
      toast.error("Erro ao carregar exercícios");
    } else {
      const exercisesData = data?.map((item: any) => ({
        id: item.exercise_library.id,
        name: item.exercise_library.name,
        muscle_group: item.exercise_library.muscle_group,
        difficulty: item.exercise_library.difficulty,
        gif_url: item.exercise_library.gif_url,
        order_index: item.order_index,
        sets: item.sets,
        reps: item.reps,
        rest_time: item.rest_time,
        notes: item.notes,
      }));
      setExercises(exercisesData || []);
    }
  };

  const handleAddExercises = (selectedExercises: any[]) => {
    const newExercises = selectedExercises.map((ex, index) => ({
      id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      difficulty: ex.difficulty,
      gif_url: ex.gif_url,
      order_index: exercises.length + index,
      sets: 3,
      reps: "10-12",
      rest_time: 60,
    }));

    setExercises([...exercises, ...newExercises]);
    setSelectExerciseOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];

    // Update order_index
    newExercises.forEach((ex, i) => {
      ex.order_index = i;
    });

    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome do treino é obrigatório");
      return;
    }

    if (exercises.length === 0) {
      toast.error("Adicione pelo menos um exercício");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado");
      setLoading(false);
      return;
    }

    try {
      if (workout) {
        // Update existing workout
        const { error: updateError } = await supabase
          .from("custom_workouts")
          .update({
            name,
            description,
            difficulty,
          })
          .eq("id", workout.id);

        if (updateError) throw updateError;

        // Delete existing exercises
        await supabase
          .from("custom_workout_exercises")
          .delete()
          .eq("custom_workout_id", workout.id);

        // Insert new exercises
        const exercisesToInsert = exercises.map((ex, index) => ({
          custom_workout_id: workout.id,
          exercise_id: ex.id,
          order_index: index,
          sets: ex.sets,
          reps: ex.reps,
          rest_time: ex.rest_time,
          notes: ex.notes,
        }));

        const { error: insertError } = await supabase
          .from("custom_workout_exercises")
          .insert(exercisesToInsert);

        if (insertError) throw insertError;

        toast.success("Treino atualizado com sucesso!");
      } else {
        // Create new workout
        const { data: workoutData, error: workoutError } = await supabase
          .from("custom_workouts")
          .insert({
            user_id: user.id,
            name,
            description,
            difficulty,
          })
          .select()
          .single();

        if (workoutError) throw workoutError;

        // Insert exercises
        const exercisesToInsert = exercises.map((ex, index) => ({
          custom_workout_id: workoutData.id,
          exercise_id: ex.id,
          order_index: index,
          sets: ex.sets,
          reps: ex.reps,
          rest_time: ex.rest_time,
          notes: ex.notes,
        }));

        const { error: insertError } = await supabase
          .from("custom_workout_exercises")
          .insert(exercisesToInsert);

        if (insertError) throw insertError;

        toast.success("Treino criado com sucesso!");
      }

      onSuccess();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{workout ? "Editar Treino" : "Criar Novo Treino"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes e adicione exercícios ao seu treino personalizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Treino *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Treino de Peito e Tríceps"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o objetivo deste treino..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Exercícios ({exercises.length})</Label>
                <Button
                  type="button"
                  onClick={() => setSelectExerciseOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Exercícios
                </Button>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <Card key={`${exercise.id}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveExercise(index, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMoveExercise(index, "down")}
                            disabled={index === exercises.length - 1}
                          >
                            ↓
                          </Button>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExercise(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Séries</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) =>
                                  handleUpdateExercise(index, "sets", parseInt(e.target.value))
                                }
                                min={1}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Repetições</Label>
                              <Input
                                value={exercise.reps}
                                onChange={(e) => handleUpdateExercise(index, "reps", e.target.value)}
                                placeholder="10-12"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Descanso (s)</Label>
                              <Input
                                type="number"
                                value={exercise.rest_time}
                                onChange={(e) =>
                                  handleUpdateExercise(index, "rest_time", parseInt(e.target.value))
                                }
                                min={0}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {exercises.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum exercício adicionado ainda
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : workout ? "Salvar Alterações" : "Criar Treino"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectExerciseDialog
        open={selectExerciseOpen}
        onOpenChange={setSelectExerciseOpen}
        onSelect={handleAddExercises}
      />
    </>
  );
}
