import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Filter, Database, Upload, Plus, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/untyped';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ExerciseManagementCard from '@/components/ExerciseManagementCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BulkGifUploader } from '@/components/BulkGifUploader';
import { GifValidationUploader } from '@/components/GifValidationUploader';
import AddExerciseDialog from '@/components/AddExerciseDialog';
import AutoGifUploader from '@/components/AutoGifUploader';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: string | null;
  description: string | null;
  gif_url: string | null;
  equipment: any;
  sets: number | null;
  reps: string | null;
  rest_time: number | null;
  duration: string | null;
  instructions: any;
  tips: any;
}

const ExerciseManagement: React.FC = () => {
  const { session } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [validationUploadOpen, setValidationUploadOpen] = useState(false);
  const [autoUploadOpen, setAutoUploadOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [rebuildConfirmOpen, setRebuildConfirmOpen] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [clearStorageConfirmOpen, setClearStorageConfirmOpen] = useState(false);
  const [clearingStorage, setClearingStorage] = useState(false);

  const muscleGroups = [
    { value: 'all', label: 'Todos os Grupos' },
    { value: 'peito', label: 'Peito' },
    { value: 'costas', label: 'Costas' },
    { value: 'pernas', label: 'Pernas' },
    { value: 'ombros', label: 'Ombros' },
    { value: 'bracos', label: 'Braços' },
    { value: 'abdomen', label: 'Abdômen' },
    { value: 'gluteos', label: 'Glúteos' },
    { value: 'antebracos', label: 'Antebraços' },
    { value: 'cardio', label: 'Cardio' },
  ];

  const difficulties = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediário', label: 'Intermediário' },
    { value: 'avançado', label: 'Avançado' },
  ];

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdate = () => {
    fetchExercises();
  };

  const handleExerciseDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercise_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Exercício deletado com sucesso');
      fetchExercises();
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      toast.error('Erro ao deletar exercício');
    }
  };

  const handleSyncGifs = async () => {
    if (!session) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      setSyncing(true);
      toast.loading('Sincronizando GIFs...', { id: 'sync-gifs' });

      const { data, error } = await supabase.functions.invoke('sync-exercise-gifs', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const stats = data?.stats;
      if (stats) {
        toast.success(
          `Sincronização concluída! ${stats.updated} GIFs vinculados, ${stats.skipped} já existiam, ${stats.invalidFormat} ignorados`,
          { id: 'sync-gifs' }
        );
      } else {
        toast.success('Sincronização concluída!', { id: 'sync-gifs' });
      }

      fetchExercises();
    } catch (error) {
      console.error('Erro ao sincronizar GIFs:', error);
      toast.error('Erro ao sincronizar GIFs', { id: 'sync-gifs' });
    } finally {
      setSyncing(false);
    }
  };

  const handleClearStorage = async () => {
    try {
      setClearingStorage(true);
      setClearStorageConfirmOpen(false);
      toast.loading('Limpando storage...', { id: 'clear-storage' });

      const { data, error } = await supabase.functions.invoke('clear-exercise-gifs');

      if (error) throw error;

      const result = data;
      if (result?.success) {
        const stats = result.stats;
        toast.success(
          `Limpeza completa! ${stats.exercises_deleted} exercícios deletados do banco, ${stats.files_deleted} GIFs deletados do storage${stats.files_failed > 0 ? `, ${stats.files_failed} falharam` : ''}`,
          { id: 'clear-storage', duration: 5000 }
        );
        
        // Recarregar lista de exercícios
        fetchExercises();
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      toast.error('Erro ao limpar storage', { id: 'clear-storage' });
    } finally {
      setClearingStorage(false);
    }
  };

  const handleRebuildLibrary = async () => {
    if (!session) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      setRebuilding(true);
      setRebuildConfirmOpen(false);
      toast.loading('Reconstruindo biblioteca...', { id: 'rebuild-library' });

      const { data, error } = await supabase.functions.invoke('rebuild-exercise-library', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const result = data;
      if (result?.success) {
        const stats = result.stats;
        let message = `Biblioteca reconstruída! ${stats.created} exercícios criados`;
        
        if (stats.failed > 0) {
          message += `, ${stats.failed} falharam`;
        }

        toast.success(message, { id: 'rebuild-library', duration: 5000 });
        
        // Mostrar distribuição por grupo muscular
        if (stats.byMuscleGroup) {
          console.log('Distribuição por grupo muscular:', stats.byMuscleGroup);
        }

        fetchExercises();
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao reconstruir biblioteca:', error);
      toast.error('Erro ao reconstruir biblioteca', { id: 'rebuild-library' });
    } finally {
      setRebuilding(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscle_group === selectedMuscleGroup;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesMuscleGroup && matchesDifficulty;
  });

  const exercisesWithGif = filteredExercises.filter(ex => ex.gif_url).length;
  const exercisesWithoutGif = filteredExercises.filter(ex => !ex.gif_url).length;

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Exercícios</h1>
                <p className="text-muted-foreground">
                  Gerencie, edite e atualize a biblioteca de exercícios
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setAutoUploadOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Upload className="w-4 h-4" />
                Upload Automático
              </Button>
              <Button 
                onClick={() => setAddExerciseOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Exercício
              </Button>
              <Button 
                onClick={() => setClearStorageConfirmOpen(true)}
                disabled={clearingStorage}
                variant="outline"
                className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
              >
                <Trash2 className={`w-4 h-4 ${clearingStorage ? 'animate-spin' : ''}`} />
                {clearingStorage ? 'Limpando...' : 'Limpar Storage'}
              </Button>
              <Button 
                onClick={() => setRebuildConfirmOpen(true)}
                disabled={rebuilding}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className={`w-4 h-4 ${rebuilding ? 'animate-spin' : ''}`} />
                {rebuilding ? 'Reconstruindo...' : 'Reconstruir Biblioteca'}
              </Button>
              <Button 
                onClick={handleSyncGifs}
                disabled={syncing}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar GIFs'}
              </Button>
              <Button 
                onClick={() => setValidationUploadOpen(true)}
                className="flex items-center gap-2 bg-gradient-hero"
              >
                <Sparkles className="w-4 h-4" />
                Validação Inteligente
              </Button>
              <Button 
                onClick={() => setBulkUploadOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload em Lote
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total de Exercícios</div>
            <div className="text-3xl font-bold text-primary">{filteredExercises.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Com GIF</div>
            <div className="text-3xl font-bold text-green-500">{exercisesWithGif}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Sem GIF</div>
            <div className="text-3xl font-bold text-orange-500">{exercisesWithoutGif}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Muscle Group Filter */}
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Grupo Muscular" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedMuscleGroup !== 'all' || selectedDifficulty !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedMuscleGroup('all');
                setSelectedDifficulty('all');
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          )}
        </Card>

        {/* Exercise List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-full h-4" />
              </Card>
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhum exercício encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseManagementCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={handleExerciseUpdate}
                onDelete={handleExerciseDelete}
              />
            ))}
          </div>
        )}

        {/* Add Exercise Dialog */}
        <AddExerciseDialog
          open={addExerciseOpen}
          onOpenChange={setAddExerciseOpen}
          onSuccess={fetchExercises}
        />

        {/* Auto Upload Dialog */}
        <Dialog open={autoUploadOpen} onOpenChange={setAutoUploadOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-500" />
                Upload Automático de GIFs
              </DialogTitle>
              <DialogDescription>
                Cada GIF criará automaticamente um exercício no banco de dados
              </DialogDescription>
            </DialogHeader>
            <AutoGifUploader />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                onClick={() => {
                  setAutoUploadOpen(false);
                  fetchExercises();
                }}
                variant="outline"
              >
                Fechar e Atualizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Validation Upload Dialog */}
        <Dialog open={validationUploadOpen} onOpenChange={setValidationUploadOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Validação Inteligente de GIFs com IA
              </DialogTitle>
              <DialogDescription>
                Sistema avançado: analisa cada GIF com IA, valida nomes, sugere correções e associa automaticamente
              </DialogDescription>
            </DialogHeader>
            <GifValidationUploader 
              onComplete={() => {
                fetchExercises();
                setValidationUploadOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload em Lote de GIFs</DialogTitle>
              <DialogDescription>
                Sistema com filtro por grupo muscular e correspondência automática inteligente
              </DialogDescription>
            </DialogHeader>
            <BulkGifUploader 
              selectedMuscleGroup={selectedMuscleGroup === 'all' ? undefined : selectedMuscleGroup}
              onComplete={() => {
                fetchExercises();
                setBulkUploadOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>

        {/* Clear Storage Confirmation Dialog */}
        <AlertDialog open={clearStorageConfirmOpen} onOpenChange={setClearStorageConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Limpar Storage de GIFs?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold">⚠️ ATENÇÃO: Esta é uma operação DESTRUTIVA!</p>
                <p>Esta ação irá:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Deletar TODOS os arquivos GIF do storage</li>
                  <li>Remover as demonstrações visuais dos exercícios</li>
                  <li>Liberar espaço para novos GIFs</li>
                  <li>NÃO deletar os exercícios da biblioteca</li>
                </ul>
                <p className="text-destructive font-medium mt-4">Esta ação NÃO PODE ser desfeita!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  💡 Use esta função quando quiser fazer upload de novos GIFs com nomes corretos
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearStorage}
                className="bg-destructive hover:bg-destructive/90"
              >
                Sim, Limpar Storage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rebuild Library Confirmation Dialog */}
        <AlertDialog open={rebuildConfirmOpen} onOpenChange={setRebuildConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Reconstruir Biblioteca de Exercícios?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold">⚠️ ATENÇÃO: Esta é uma operação DESTRUTIVA!</p>
                <p>Esta ação irá:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Deletar TODOS os {exercises.length} exercícios existentes</li>
                  <li>Criar novos exercícios automaticamente a partir dos GIFs no storage</li>
                  <li>Detectar nomes e grupos musculares baseado nos arquivos</li>
                  <li>Definir valores padrão para sets, reps e rest_time</li>
                </ul>
                <p className="text-destructive font-medium mt-4">Esta ação NÃO PODE ser desfeita!</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRebuildLibrary}
                className="bg-destructive hover:bg-destructive/90"
              >
                Sim, Reconstruir Biblioteca
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ExerciseManagement;
