import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Award, Info, ArrowLeft, Dumbbell, Edit } from 'lucide-react';
import { getExerciseById } from '@/database/exercises';
import AnimatedExercise from '@/components/AnimatedExercise';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/integrations/supabase/client";
import EditExerciseDialog from '@/components/EditExerciseDialog';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      // Primeiro tenta buscar do Supabase (UUID)
      const { data, error: dbError } = await supabase
        .from("exercise_library")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        // Mapeia os campos do Supabase para o formato esperado
        setExercise({
          id: data.id,
          name: data.name,
          muscleGroup: data.muscle_group,
          difficulty: data.difficulty,
          equipment: data.equipment || [],
          duration: data.duration || "30-45min",
          description: data.description,
          instructions: data.instructions || [],
          gif_url: data.gif_url,
          sets: data.sets || 3,
          reps: data.reps || "10-12",
          restTime: data.rest_time || 60,
          tips: data.tips || []
        });
      } else {
        // Fallback para arquivo local (IDs numéricos antigos)
        const localExercise = getExerciseById(parseInt(id));
        if (localExercise) {
          setExercise(localExercise);
        } else {
          setError(true);
        }
      }
      setLoading(false);
    };

    fetchExercise();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando exercício...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !exercise) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Exercício não encontrado</h2>
            <Button onClick={() => navigate('/exercise-library')}>
              Voltar para Biblioteca
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const startExercise = () => {
    // Criar um mini-treino com apenas este exercício
    const singleExerciseWorkout = {
      id: `single-${exercise.id}`,
      name: exercise.name,
      focus: exercise.muscleGroup,
      duration: exercise.duration || "15-20 min",
      exercises: [
        {
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets || 3,
          reps: exercise.reps || "10-12",
          restTime: exercise.restTime || 60,
          muscleGroup: exercise.muscleGroup,
          type: 'principal',
          equipment: exercise.equipment || [],
          instructions: exercise.instructions || [],
          animation: exercise.gif_url || exercise.animation || exercise.name
        }
      ]
    };
    
    // Navegar para WorkoutSession passando o treino via state
    navigate('/workout-session', { 
      state: { workout: singleExerciseWorkout } 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
            {/* Cabeçalho com Animação */}
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-primary-foreground">
              <button
                onClick={() => navigate('/exercise-library')}
                className="mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{exercise.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm mb-4 opacity-90">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {exercise.difficulty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exercise.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <p className="opacity-90">{exercise.description}</p>
                </div>
                <div className="relative bg-white/10 rounded-xl p-4">
                  {exercise.gif_url ? (
                    <img 
                      src={exercise.gif_url} 
                      alt={exercise.name}
                      className="w-full max-w-[200px] h-auto object-contain rounded-lg"
                    />
                  ) : (
                    <AnimatedExercise animation={exercise.name} size="large" />
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6">
              {/* Abas de Navegação */}
              <Tabs defaultValue="instructions" className="w-full">
                <TabsList className="w-full justify-start mb-6">
                  <TabsTrigger value="instructions">Instruções</TabsTrigger>
                  <TabsTrigger value="tips">Dicas</TabsTrigger>
                  <TabsTrigger value="equipment">Equipamento</TabsTrigger>
                </TabsList>

                {/* Conteúdo das Abas */}
                <TabsContent value="instructions" className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Como Executar</h3>
                  {exercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-foreground">{instruction}</p>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{exercise.sets}</div>
                      <div className="text-sm text-muted-foreground">Séries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{exercise.reps}</div>
                      <div className="text-sm text-muted-foreground">Repetições</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{exercise.restTime}s</div>
                      <div className="text-sm text-muted-foreground">Descanso</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="space-y-3">
                  <h3 className="text-xl font-semibold mb-4">Dicas Importantes</h3>
                  {exercise.tips && exercise.tips.length > 0 ? (
                    exercise.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-foreground">{tip}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Nenhuma dica disponível para este exercício.</p>
                  )}
                </TabsContent>

                <TabsContent value="equipment" className="space-y-3">
                  <h3 className="text-xl font-semibold mb-4">Equipamento Necessário</h3>
                  {exercise.equipment.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-foreground capitalize">{item}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Botão de Iniciar */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={startExercise}
                  className="flex-1 py-5 sm:py-6 text-base sm:text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Iniciar Exercício
                </Button>
                <div className="flex gap-3 sm:gap-4">
                  <Button
                    onClick={() => setEditDialogOpen(true)}
                    variant="outline"
                    className="flex-1 sm:flex-none px-4 sm:px-6"
                    size="lg"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => navigate('/exercise-library')}
                    variant="outline"
                    className="flex-1 sm:flex-none px-4 sm:px-6"
                    size="lg"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Edição */}
      {exercise && (
        <EditExerciseDialog
          exercise={{
            id: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscleGroup,
            difficulty: exercise.difficulty,
            description: exercise.description,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_time: exercise.restTime,
            duration: exercise.duration,
            equipment: exercise.equipment,
            instructions: exercise.instructions,
            tips: exercise.tips,
            gif_url: exercise.gif_url
          }}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            // Recarregar exercício após edição
            window.location.reload();
          }}
        />
      )}
    </Layout>
  );
};

export default ExerciseDetail;
