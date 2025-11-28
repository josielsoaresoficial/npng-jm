import React, { useState, useEffect } from 'react';
import { Search, Play, Info, Dumbbell, ArrowLeft, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import chestIcon from "@/assets/muscle-icons/chest-icon.png";
import backIcon from "@/assets/muscle-icons/back-icon.png";
import shouldersIcon from "@/assets/muscle-icons/shoulders-icon.png";
import bicepsIcon from "@/assets/muscle-icons/biceps-icon.png";
import tricepsIcon from "@/assets/muscle-icons/triceps-icon.png";
import forearmIcon from "@/assets/muscle-icons/forearm-icon.png";
import legsIcon from "@/assets/muscle-icons/legs-icon.png";
import glutesIcon from "@/assets/muscle-icons/glutes-icon.png";
import absIcon from "@/assets/muscle-icons/abs-icon.png";
import cardioIcon from "@/assets/muscle-icons/cardio-icon.png";

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState('peito');
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Grupos musculares
  const muscleGroups = [
    { id: 'peito', name: 'Peitoral', icon: chestIcon },
    { id: 'costas', name: 'Costas', icon: backIcon },
    { id: 'ombros', name: 'Ombros', icon: shouldersIcon },
    { id: 'biceps', name: 'Bíceps', icon: bicepsIcon },
    { id: 'triceps', name: 'Tríceps', icon: tricepsIcon },
    { id: 'pernas', name: 'Pernas', icon: legsIcon },
    { id: 'gluteos', name: 'Glúteos', icon: glutesIcon },
    { id: 'abdomen', name: 'Abdômen', icon: absIcon },
    { id: 'antebraco', name: 'Antebraço', icon: forearmIcon },
    { id: 'adutores', name: 'Adutores', icon: legsIcon },
    { id: 'cardio', name: 'Cardio', icon: cardioIcon },
    { id: 'outros', name: 'Outros', icon: null }
  ];

  // Buscar userId
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Buscar favoritos do usuário
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('favorite_exercises')
        .select('exercise_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Erro ao buscar favoritos:', error);
      } else {
        const favoriteIds = new Set(data?.map(f => f.exercise_id) || []);
        setFavorites(favoriteIds);
      }
    };
    
    fetchFavorites();
  }, [userId]);

  // Buscar exercícios do Supabase
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      
      let query = supabase
        .from('exercise_library')
        .select('*')
        .order('name');

      // Filtrar por grupo muscular se não estiver mostrando apenas favoritos
      if (!showFavoritesOnly) {
        query = query.eq('muscle_group', selectedGroup);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar exercícios:', error);
      } else {
        let filteredData = data || [];
        
        // Se mostrar apenas favoritos, filtrar
        if (showFavoritesOnly) {
          filteredData = filteredData.filter(ex => favorites.has(ex.id));
        }
        
        setExercises(filteredData);
      }
      
      setLoading(false);
    };

    fetchExercises();
  }, [selectedGroup, searchTerm, showFavoritesOnly, favorites]);

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const startWorkout = (exercise: any) => {
    // Criar um mini-treino com apenas este exercício
    const singleExerciseWorkout = {
      id: `single-${exercise.id}`,
      name: exercise.name,
      focus: exercise.muscle_group,
      duration: "15-20 min",
      exercises: [
        {
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets || 3,
          reps: exercise.reps || "10-12",
          restTime: exercise.rest_time || 60,
          muscleGroup: exercise.muscle_group,
          type: 'principal',
          equipment: exercise.equipment || [],
          instructions: exercise.instructions || [],
          animation: exercise.gif_url || exercise.name
        }
      ]
    };
    
    // Navegar para WorkoutSession passando o treino via state
    navigate('/workout-session', { 
      state: { workout: singleExerciseWorkout } 
    });
  };

  const toggleFavorite = async (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para favoritar exercícios",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.has(exerciseId);

    if (isFavorite) {
      // Remover favorito
      const { error } = await supabase
        .from('favorite_exercises')
        .delete()
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover dos favoritos",
          variant: "destructive"
        });
      } else {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(exerciseId);
          return newSet;
        });
        toast({
          title: "Removido dos favoritos",
          description: "Exercício removido da sua lista de favoritos"
        });
      }
    } else {
      // Adicionar favorito
      const { error } = await supabase
        .from('favorite_exercises')
        .insert({ user_id: userId, exercise_id: exerciseId });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar aos favoritos",
          variant: "destructive"
        });
      } else {
        setFavorites(prev => new Set(prev).add(exerciseId));
        toast({
          title: "Adicionado aos favoritos",
          description: "Exercício adicionado à sua lista de favoritos"
        });
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/workouts')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Biblioteca de Exercícios</h1>
              <p className="text-muted-foreground">Selecione um grupo muscular para explorar exercícios</p>
            </div>
          </div>

          {/* Barra de Pesquisa e Filtro de Favoritos */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>
            
            {/* Botão de Favoritos */}
            {userId && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  showFavoritesOnly
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                    : 'border-border hover:border-yellow-500/50'
                }`}
              >
                <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-yellow-500' : ''}`} />
                <span className="font-medium">
                  {showFavoritesOnly ? 'Mostrando Favoritos' : 'Ver Apenas Favoritos'}
                </span>
                {showFavoritesOnly && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs">
                    {favorites.size}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Grupos Musculares - Ocultar quando mostrar apenas favoritos */}
          {!showFavoritesOnly && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
              {muscleGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    selectedGroup === group.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="w-8 h-8 mb-1">
                    {group.icon ? (
                      <img src={group.icon} alt={group.name} className="w-full h-full object-contain" />
                    ) : (
                      <Dumbbell className="w-full h-full text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{group.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Lista de Exercícios */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map(exercise => (
                  <div key={exercise.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Preview do GIF */}
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center relative overflow-hidden">
                      {exercise.gif_url ? (
                        <img 
                          src={exercise.gif_url} 
                          alt={exercise.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Dumbbell className="w-16 h-16 text-muted-foreground/30" />
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {userId && (
                          <button
                            onClick={(e) => toggleFavorite(exercise.id, e)}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                              favorites.has(exercise.id)
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-white/90 text-gray-600 hover:bg-white'
                            }`}
                            title={favorites.has(exercise.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          >
                            <Star className={`w-4 h-4 ${favorites.has(exercise.id) ? 'fill-white' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => startWorkout(exercise)}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 shadow-lg transition-colors"
                          title="Iniciar Exercício"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExerciseClick(exercise.id)}
                          className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 shadow-lg transition-colors"
                          title="Ver Detalhes"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Informações do Exercício */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {exercise.difficulty || 'Intermediário'}
                        </span>
                        {exercise.subdivision && (
                          <>
                            <span>•</span>
                            <span>{exercise.subdivision}</span>
                          </>
                        )}
                      </div>
                      {exercise.description && (
                        <p className="text-foreground text-sm mb-4 line-clamp-2">{exercise.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {exercise.sets || 3} séries × {exercise.reps || '10-12'}
                        </div>
                        <button
                          onClick={() => handleExerciseClick(exercise.id)}
                          className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                        >
                          Ver Detalhes →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {exercises.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExerciseLibrary;
