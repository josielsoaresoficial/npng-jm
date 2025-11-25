import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Dumbbell, Trash2, Edit, Star, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreateCustomWorkoutDialog } from "@/components/CreateCustomWorkoutDialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CustomWorkout {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  is_favorite: boolean;
  created_at: string;
  exercise_count?: number;
}

export default function CustomWorkouts() {
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<CustomWorkout | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; workoutId: string | null }>({
    open: false,
    workoutId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Você precisa estar logado");
      setLoading(false);
      return;
    }

    // Load custom workouts with exercise count
    const { data: workoutsData, error } = await supabase
      .from("custom_workouts")
      .select(`
        *,
        custom_workout_exercises(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar treinos");
      console.error(error);
    } else {
      const workoutsWithCount = workoutsData?.map((w: any) => ({
        ...w,
        exercise_count: w.custom_workout_exercises?.[0]?.count || 0,
      }));
      setWorkouts(workoutsWithCount || []);
    }
    setLoading(false);
  };

  const handleEdit = (workout: CustomWorkout) => {
    setEditingWorkout(workout);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.workoutId) return;

    const { error } = await supabase
      .from("custom_workouts")
      .delete()
      .eq("id", deleteDialog.workoutId);

    if (error) {
      toast.error("Erro ao excluir treino");
    } else {
      toast.success("Treino excluído com sucesso");
      loadWorkouts();
    }

    setDeleteDialog({ open: false, workoutId: null });
  };

  const handleToggleFavorite = async (workoutId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from("custom_workouts")
      .update({ is_favorite: !currentFavorite })
      .eq("id", workoutId);

    if (error) {
      toast.error("Erro ao atualizar favorito");
    } else {
      loadWorkouts();
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    navigate(`/workout-session/${workoutId}?custom=true`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Iniciante";
      case "intermediate":
        return "Intermediário";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Meus Treinos Personalizados</h1>
            <p className="text-muted-foreground">
              Crie e gerencie seus treinos personalizados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingWorkout(null);
              setDialogOpen(true);
            }}
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Treino
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workouts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum treino criado ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro treino personalizado
              </p>
              <Button
                onClick={() => {
                  setEditingWorkout(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Treino
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {workout.name}
                        {workout.is_favorite && (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {workout.description || "Sem descrição"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getDifficultyColor(workout.difficulty)}>
                      {getDifficultyLabel(workout.difficulty)}
                    </Badge>
                    <Badge variant="outline">
                      {workout.exercise_count} exercícios
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartWorkout(workout.id)}
                      className="flex-1"
                      disabled={workout.exercise_count === 0}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                    <Button
                      onClick={() => handleToggleFavorite(workout.id, workout.is_favorite)}
                      variant="outline"
                      size="icon"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          workout.is_favorite ? "fill-yellow-500 text-yellow-500" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      onClick={() => handleEdit(workout)}
                      variant="outline"
                      size="icon"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setDeleteDialog({ open: true, workoutId: workout.id })}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateCustomWorkoutDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingWorkout(null);
          }}
          onSuccess={() => {
            loadWorkouts();
            setDialogOpen(false);
            setEditingWorkout(null);
          }}
          workout={editingWorkout}
        />

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, workoutId: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir treino</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
