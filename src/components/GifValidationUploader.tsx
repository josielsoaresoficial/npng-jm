import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Upload, Sparkles, FileWarning, Loader2, X, Play, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  compareExerciseNames, 
  generateFileName, 
  findBestExerciseMatch,
  normalizeExerciseName 
} from '@/lib/exerciseNameMatcher';

interface GifFile {
  file: File;
  preview: string;
  originalName: string;
  aiAnalysis?: {
    exerciseName: string;
    muscleGroup: string;
    equipment: string[];
    confidence: 'alta' | 'média' | 'baixa';
    description: string;
  };
  comparison?: {
    isMatch: boolean;
    similarity: number;
    suggestedName: string;
    status: 'correct' | 'incorrect' | 'uncertain';
  };
  selectedExerciseId?: string;
  selectedExerciseName?: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'uploading' | 'uploaded' | 'error';
  error?: string;
  userApproved?: boolean;
  finalName?: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface GifValidationUploaderProps {
  onComplete?: () => void;
}

export const GifValidationUploader: React.FC<GifValidationUploaderProps> = ({ onComplete }) => {
  const [files, setFiles] = useState<GifFile[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'review' | 'upload-final'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setIsLoadingExercises(true);
      const { data, error } = await supabase
        .from('exercise_library')
        .select('id, name, muscle_group')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      toast.error('Erro ao carregar biblioteca de exercícios');
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    const gifFiles = selectedFiles.filter(file => file.type === 'image/gif');
    
    if (gifFiles.length === 0) {
      toast.error('Por favor, selecione apenas arquivos GIF');
      return;
    }

    const newFiles: GifFile[] = gifFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      originalName: file.name,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`${gifFiles.length} GIF(s) adicionado(s)`);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const analyzeWithAI = async () => {
    if (files.length === 0) {
      toast.error('Adicione GIFs primeiro');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('analyze');
    setAnalysisProgress(0);

    const delayBetweenRequests = 60000; // 60 segundos entre cada análise para evitar rate limit

    // Processa um GIF por vez
    for (let i = 0; i < files.length; i++) {
      const gifFile = files[i];
      
      try {
        // Atualiza status para analyzing
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'analyzing' };
          return newFiles;
        });

        // Converte GIF para base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(gifFile.file);
        });

        const base64 = await base64Promise;

        // Chama edge function com retry
        let retries = 3;
        let success = false;
        
        while (retries > 0 && !success) {
          try {
            const { data, error } = await supabase.functions.invoke('analyze-exercise-gif', {
              body: {
                imageBase64: base64,
                fileName: gifFile.originalName
              }
            });

            if (error) {
              // Se for erro 429 (rate limit), aguarda mais tempo
              if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
                console.log('Rate limit detectado, aguardando 120 segundos...');
                await new Promise(resolve => setTimeout(resolve, 120000));
                retries--;
                continue;
              }
              throw error;
            }

            if (data?.success && data?.analysis) {
              const analysis = data.analysis;
              const comparison = compareExerciseNames(
                gifFile.originalName,
                analysis.exerciseName,
                analysis.confidence
              );

              // Tenta encontrar match automático
              const bestMatch = findBestExerciseMatch(
                analysis.exerciseName,
                analysis.muscleGroup,
                exercises
              );

              setFiles(prev => {
                const newFiles = [...prev];
                newFiles[i] = {
                  ...newFiles[i],
                  aiAnalysis: analysis,
                  comparison,
                  selectedExerciseId: bestMatch.exerciseId || undefined,
                  selectedExerciseName: bestMatch.matchedName || undefined,
                  status: 'analyzed',
                  finalName: generateFileName(analysis.exerciseName)
                };
                return newFiles;
              });
              
              success = true;
            } else {
              throw new Error('Análise falhou');
            }
          } catch (innerError) {
            if (retries === 1) {
              throw innerError;
            }
            retries--;
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }

      } catch (error) {
        console.error('Erro ao analisar GIF:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = {
            ...newFiles[i],
            status: 'error',
            error: errorMessage.includes('429') 
              ? 'Limite de API excedido. Aguarde alguns minutos e tente novamente.'
              : errorMessage
          };
          return newFiles;
        });
      }

      setAnalysisProgress(Math.round(((i + 1) / files.length) * 100));

      // Aguarda entre requisições (exceto na última)
      if (i < files.length - 1) {
        console.log(`Aguardando ${delayBetweenRequests / 1000}s antes da próxima análise...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    setIsAnalyzing(false);
    setCurrentStep('review');
    
    const successCount = files.filter(f => f.status === 'analyzed').length;
    const errorCount = files.filter(f => f.status === 'error').length;
    
    if (errorCount > 0) {
      toast.warning(`${successCount} análises concluídas, ${errorCount} com erro`);
    } else {
      toast.success('Análise concluída! Revise os resultados');
    }
  };

  const approveFile = (index: number, approved: boolean) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], userApproved: approved };
      return newFiles;
    });
  };

  const updateExerciseSelection = (index: number, exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        selectedExerciseId: exerciseId,
        selectedExerciseName: exercise?.name || ''
      };
      return newFiles;
    });
  };

  const startUpload = async () => {
    const approvedFiles = files.filter(f => f.userApproved && f.selectedExerciseId);

    if (approvedFiles.length === 0) {
      toast.error('Aprove pelo menos um GIF antes de fazer upload');
      return;
    }

    setIsUploading(true);
    setCurrentStep('upload-final');
    setUploadProgress(0);

    let successCount = 0;

    for (let i = 0; i < approvedFiles.length; i++) {
      const gifFile = approvedFiles[i];

      try {
        setFiles(prev => 
          prev.map(f => f.originalName === gifFile.originalName 
            ? { ...f, status: 'uploading' as const }
            : f
          )
        );

        const fileName = gifFile.finalName || gifFile.originalName;
        const filePath = `${fileName}`;

        // Upload para storage
        const { error: uploadError } = await supabase.storage
          .from('exercise-gifs')
          .upload(filePath, gifFile.file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Pega URL pública
        const { data: urlData } = supabase.storage
          .from('exercise-gifs')
          .getPublicUrl(filePath);

        // Atualiza exercise_library
        const { error: updateError } = await supabase
          .from('exercise_library')
          .update({ gif_url: urlData.publicUrl })
          .eq('id', gifFile.selectedExerciseId);

        if (updateError) throw updateError;

        setFiles(prev =>
          prev.map(f => f.originalName === gifFile.originalName
            ? { ...f, status: 'uploaded' as const }
            : f
          )
        );

        successCount++;

      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        setFiles(prev =>
          prev.map(f => f.originalName === gifFile.originalName
            ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Erro no upload' }
            : f
          )
        );
      }

      setUploadProgress(Math.round(((i + 1) / approvedFiles.length) * 100));
    }

    setIsUploading(false);
    toast.success(`${successCount} GIF(s) enviado(s) com sucesso!`);

    if (onComplete) {
      setTimeout(() => onComplete(), 1500);
    }
  };

  const getStatusIcon = (file: GifFile) => {
    switch (file.status) {
      case 'analyzing':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'analyzed':
        return file.comparison?.status === 'correct' 
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'uploaded':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FileWarning className="w-5 h-5 text-red-500" />;
      default:
        return <Play className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const stats = {
    total: files.length,
    analyzed: files.filter(f => f.status === 'analyzed').length,
    correct: files.filter(f => f.comparison?.status === 'correct').length,
    incorrect: files.filter(f => f.comparison?.status === 'incorrect').length,
    approved: files.filter(f => f.userApproved).length
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Analisados</div>
          <div className="text-2xl font-bold text-blue-500">{stats.analyzed}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Corretos</div>
          <div className="text-2xl font-bold text-green-500">{stats.correct}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Incorretos</div>
          <div className="text-2xl font-bold text-orange-500">{stats.incorrect}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Aprovados</div>
          <div className="text-2xl font-bold text-purple-500">{stats.approved}</div>
        </Card>
      </div>

      {/* Etapa 1: Upload */}
      {currentStep === 'upload' && (
        <Card className="p-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Arraste seus GIFs aqui
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar arquivos
            </p>
            <input
              type="file"
              multiple
              accept="image/gif"
              onChange={handleFileSelect}
              className="hidden"
              id="gif-upload"
            />
            <label htmlFor="gif-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Selecionar GIFs</span>
              </Button>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {files.length} arquivo(s) selecionado(s)
                </p>
                <Button
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing || files.length === 0}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analisar com IA
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Etapa 2: Análise */}
      {currentStep === 'analyze' && (
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">
              Analisando GIFs com IA
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Processando 1 GIF por minuto para evitar limites de API...
              <br />
              Tempo estimado: {Math.ceil(files.length)} minutos
            </p>
            <Progress value={analysisProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {analysisProgress}% concluído
            </p>
          </div>
        </Card>
      )}

      {/* Lista de arquivos */}
      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-4 space-y-3">
          {files.map((gifFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={gifFile.preview}
                    alt={gifFile.originalName}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(gifFile)}
                        <p className="text-sm font-medium truncate">
                          {gifFile.originalName}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(gifFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Análise da IA */}
                  {gifFile.aiAnalysis && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            🤖 IA identificou: {gifFile.aiAnalysis.exerciseName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {gifFile.aiAnalysis.muscleGroup}
                            </Badge>
                            <Badge 
                              variant={
                                gifFile.aiAnalysis.confidence === 'alta' ? 'default' :
                                gifFile.aiAnalysis.confidence === 'média' ? 'secondary' : 
                                'outline'
                              }
                              className="text-xs"
                            >
                              Confiança: {gifFile.aiAnalysis.confidence}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Status da comparação */}
                      {gifFile.comparison && (
                        <div className="mt-2">
                          {gifFile.comparison.status === 'correct' ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm">Nome correto ({gifFile.comparison.similarity}% similar)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">
                                Nome incorreto ({gifFile.comparison.similarity}% similar)
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Sugestão: {gifFile.finalName}
                          </p>
                        </div>
                      )}

                      {/* Seleção de exercício */}
                      {currentStep === 'review' && (
                        <div className="mt-3 space-y-2">
                          <Select
                            value={gifFile.selectedExerciseId || ''}
                            onValueChange={(value) => updateExerciseSelection(index, value)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Selecione o exercício" />
                            </SelectTrigger>
                            <SelectContent>
                              {exercises
                                .filter(ex => 
                                  normalizeExerciseName(ex.muscle_group) === 
                                  normalizeExerciseName(gifFile.aiAnalysis!.muscleGroup)
                                )
                                .map(exercise => (
                                  <SelectItem key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={gifFile.userApproved ? 'default' : 'outline'}
                              onClick={() => approveFile(index, true)}
                              disabled={!gifFile.selectedExerciseId}
                              className="flex-1"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {gifFile.error && (
                    <div className="mt-2 text-sm text-red-500">
                      Erro: {gifFile.error}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Botões de ação */}
      {currentStep === 'review' && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('upload')}
          >
            Adicionar Mais GIFs
          </Button>
          <Button
            onClick={startUpload}
            disabled={isUploading || stats.approved === 0}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Fazer Upload ({stats.approved})
              </>
            )}
          </Button>
        </div>
      )}

      {currentStep === 'upload-final' && (
        <Card className="p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">
              Fazendo upload dos GIFs
            </h3>
            <Progress value={uploadProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {uploadProgress}% concluído
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
