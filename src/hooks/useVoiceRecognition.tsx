import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceActivityDetection } from './useVoiceActivityDetection';

export type VoiceRecognitionStatus = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

interface VoiceRecognitionState {
  status: VoiceRecognitionStatus;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  audioLevel: number;
  error: string | null;
  isSupported: boolean;
  isVoiceDetected: boolean;
  isNoise: boolean;
}

interface UseVoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  silenceTimeout?: number;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

// Padrões de ruído expandidos
const NOISE_PATTERNS = {
  // Sons vocálicos não-verbais
  vocalNoises: new Set([
    'hm', 'ah', 'uh', 'uhm', 'ahn', 'hmm', 'err', 'ehh', 'éh', 'mmm',
    'ãh', 'oh', 'ih', 'aah', 'uuh', 'eeh', 'hã', 'ham', 'hem', 'him',
    'ó', 'é', 'á', 'í', 'ú', 'hum', 'humm', 'ahã', 'uhum', 'mhm'
  ]),
  
  // Onomatopeias de ruído ambiental
  environmentalSounds: new Set([
    'tss', 'shh', 'psiu', 'fff', 'sss', 'zzz', 'click', 'pop', 'tsc',
    'pff', 'pfff', 'tch', 'tchau', 'plim', 'plom', 'bip', 'beep'
  ]),
  
  // Palavras muito curtas frequentemente falsas
  shortFalsePositives: new Set([
    'a', 'e', 'i', 'o', 'u', 'é', 'há', 'ah', 'ai', 'ei', 'ou', 'eu'
  ]),
};

// Detectar padrões de eco/repetição
const hasEchoPattern = (text: string): boolean => {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length < 4) return false;
  
  // Verificar se há repetição excessiva
  const wordCount: Record<string, number> = {};
  words.forEach(w => {
    wordCount[w] = (wordCount[w] || 0) + 1;
  });
  
  // Se alguma palavra aparece mais de 50% das vezes, é eco
  return Object.values(wordCount).some(count => count / words.length > 0.5);
};

export const useVoiceRecognition = ({
  language = 'pt-BR',
  continuous = true,
  silenceTimeout = 2000,
  onResult,
  onError,
  enabled = true
}: UseVoiceRecognitionOptions) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    status: 'idle',
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    audioLevel: 0,
    error: null,
    isSupported: typeof window !== 'undefined' && 
                 ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    isVoiceDetected: false,
    isNoise: false
  });

  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const lastProcessedTextRef = useRef<string>('');
  const processingFinalRef = useRef(false);

  // Hook de detecção de atividade de voz (VAD)
  const voiceActivity = useVoiceActivityDetection({
    enabled: enabled && state.status === 'listening',
    onNoiseDetected: () => {
      console.log('🔇 Ruído ambiental detectado - ignorando');
    }
  });

  // Atualizar estado com dados do VAD
  useEffect(() => {
    setState(prev => ({
      ...prev,
      audioLevel: voiceActivity.energyLevel,
      isVoiceDetected: voiceActivity.isVoiceDetected,
      isNoise: voiceActivity.isNoise
    }));
  }, [voiceActivity.energyLevel, voiceActivity.isVoiceDetected, voiceActivity.isNoise]);

  // Limpar timer de silêncio
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Verificar se o texto é provavelmente ruído
  const isLikelyNoise = useCallback((text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    
    // Texto muito curto
    if (trimmed.length < 3) return true;
    
    // Todas as palavras são ruídos conhecidos
    const nonNoiseWords = words.filter(w => 
      !NOISE_PATTERNS.vocalNoises.has(w) &&
      !NOISE_PATTERNS.environmentalSounds.has(w) &&
      !NOISE_PATTERNS.shortFalsePositives.has(w)
    );
    
    if (nonNoiseWords.length === 0) return true;
    
    // Verificar padrão de eco
    if (hasEchoPattern(trimmed)) return true;
    
    // Alta proporção de palavras de ruído
    if (nonNoiseWords.length / words.length < 0.3) return true;
    
    return false;
  }, []);

  // Validar se o conteúdo é válido (não é ruído)
  const isValidContent = useCallback((text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    
    // Verificar ruído baseado em padrões de texto
    if (isLikelyNoise(trimmed)) {
      console.log('❌ Descartado (padrão de ruído):', text);
      return false;
    }
    
    // Verificar se tem pelo menos uma palavra com 3+ caracteres
    const words = trimmed.split(/\s+/);
    const hasValidWord = words.some(w => 
      w.length >= 3 && 
      !NOISE_PATTERNS.vocalNoises.has(w) &&
      !NOISE_PATTERNS.environmentalSounds.has(w)
    );
    
    if (!hasValidWord) {
      console.log('❌ Descartado: sem palavras válidas -', text);
      return false;
    }
    
    return true;
  }, [isLikelyNoise]);

  // Processar resultado final
  const processFinalResult = useCallback((transcript: string, confidence: number) => {
    // VAD check RELAXADO: só descartar se VAD tiver alta certeza que é ruído
    if (voiceActivity.isActive && voiceActivity.isNoise && voiceActivity.confidence > 0.6) {
      console.log('🔇 Descartado pelo VAD: ruído com alta certeza');
      return;
    }

    // Bypass VAD se confiança baixa - deixar filtros de texto decidir
    // Reduzido threshold de 0.4 para 0.25
    if (voiceActivity.isActive && voiceActivity.confidence < 0.25 && voiceActivity.confidence > 0) {
      console.log('⚠️ VAD com baixa confiança, usando filtros de texto');
    }

    // Filtro de confiança mínima do reconhecimento RELAXADO (50% ao invés de 60%)
    if (confidence < 0.5) {
      console.log('❌ Descartado: confiança baixa -', confidence, transcript);
      return;
    }
    
    // Validar conteúdo
    if (!isValidContent(transcript)) {
      return;
    }
    
    // Cooldown de 1 segundo entre reconhecimentos
    const now = Date.now();
    if (now - lastProcessedTimeRef.current < 1000) {
      console.log('⏱️ Cooldown ativo, ignorando:', transcript);
      return;
    }
    
    // Verificar duplicata
    if (transcript === lastProcessedTextRef.current) {
      console.log('⚠️ Duplicata detectada, ignorando:', transcript);
      return;
    }
    
    console.log('✅ Resultado final válido:', transcript, 'Confiança:', confidence, 'VAD:', voiceActivity.confidence);
    clearSilenceTimer();
    processingFinalRef.current = true;
    lastProcessedTimeRef.current = now;
    lastProcessedTextRef.current = transcript;
    
    setState(prev => ({
      ...prev,
      transcript,
      interimTranscript: '',
      confidence,
      status: 'processing'
    }));

    onResult?.(transcript, confidence);
    
    // Voltar para listening após processar
    setTimeout(() => {
      processingFinalRef.current = false;
      setState(prev => prev.status === 'processing' ? { ...prev, status: 'listening' } : prev);
    }, 300);
  }, [clearSilenceTimer, onResult, isValidContent, voiceActivity.isNoise, voiceActivity.isVoiceDetected, voiceActivity.confidence, voiceActivity.isActive]);

  // Iniciar reconhecimento
  const start = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        status: 'unsupported',
        error: 'Reconhecimento de voz não suportado neste navegador' 
      }));
      onError?.('Reconhecimento de voz não suportado');
      return;
    }

    if (isActiveRef.current) {
      console.log('⚠️ Reconhecimento já ativo');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Reconhecimento iniciado (com VAD)');
        isActiveRef.current = true;
        retryCountRef.current = 0;
        setState(prev => ({ ...prev, status: 'listening', error: null }));
      };

      recognition.onend = () => {
        console.log('🔇 Reconhecimento encerrado');
        isActiveRef.current = false;
        
        // Auto-reconexão com backoff exponencial
        if (enabled && retryCountRef.current < 5) {
          const delay = Math.min(300 * Math.pow(2, retryCountRef.current), 5000);
          console.log(`🔄 Reconectando em ${delay}ms...`);
          setTimeout(() => {
            if (enabled && !isActiveRef.current) {
              retryCountRef.current++;
              start();
            }
          }, delay);
        } else {
          setState(prev => ({ ...prev, status: 'idle' }));
        }
      };

      recognition.onresult = (event: any) => {
        // Gate de voz RELAXADO - só bloquear se VAD tiver CERTEZA que é ruído
        if (voiceActivity.isActive && voiceActivity.isNoise && voiceActivity.confidence > 0.7) {
          console.log('🔇 Ignorando resultado - VAD detectou ruído com alta certeza');
          return;
        }

        clearSilenceTimer();
        
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence || 0.5;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript.trim()) {
          processFinalResult(finalTranscript.trim(), maxConfidence);
        } else if (interimTranscript.trim() && !processingFinalRef.current) {
          setState(prev => ({ ...prev, interimTranscript: interimTranscript.trim() }));
          
          // Cancelar timer anterior
          clearSilenceTimer();
          
          // Timer de silêncio adaptativo com validação
          silenceTimerRef.current = setTimeout(() => {
            // Não processar se já houve resultado final recente
            if (processingFinalRef.current) {
              console.log('⏭️ Ignorando interim - resultado final já processado');
              return;
            }

            // VAD check RELAXADO para interim
            if (voiceActivity.isActive && voiceActivity.isNoise && voiceActivity.confidence > 0.7) {
              console.log('🔇 Ignorando interim - VAD detectou ruído com alta certeza');
              return;
            }
            
            const currentInterim = interimTranscript.trim();
            const wordCount = currentInterim.split(' ').filter(w => w.length > 0).length;
            
            // Só processar se tiver conteúdo significativo (2+ palavras ou 4+ caracteres)
            if (currentInterim && (wordCount >= 2 || currentInterim.length >= 4)) {
              console.log('⏱️ Processando por silêncio:', currentInterim);
              processFinalResult(currentInterim, 0.7);
            }
          }, silenceTimeout);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Erro reconhecimento:', event.error);
        isActiveRef.current = false;
        
        let errorMessage = 'Erro desconhecido';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Permissão de microfone negada';
            break;
          case 'no-speech':
            errorMessage = 'Nenhuma fala detectada';
            break;
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio';
            break;
          case 'network':
            errorMessage = 'Erro de rede';
            break;
        }
        
        setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
        onError?.(errorMessage);
        
        // Retry automático para erros recuperáveis
        if (['no-speech', 'aborted'].includes(event.error) && enabled && retryCountRef.current < 3) {
          setTimeout(() => {
            if (enabled) {
              retryCountRef.current++;
              start();
            }
          }, 1000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error('❌ Erro ao iniciar reconhecimento:', error);
      setState(prev => ({ 
        ...prev, 
        status: 'error',
        error: 'Erro ao iniciar reconhecimento de voz'
      }));
      onError?.('Erro ao iniciar reconhecimento de voz');
    }
  }, [state.isSupported, enabled, continuous, language, silenceTimeout, clearSilenceTimer, processFinalResult, onError, voiceActivity.isActive, voiceActivity.isNoise, voiceActivity.isVoiceDetected]);

  // Parar reconhecimento
  const stop = useCallback(() => {
    console.log('🛑 Parando reconhecimento');
    clearSilenceTimer();
    
    if (recognitionRef.current && isActiveRef.current) {
      try {
        recognitionRef.current.stop();
        isActiveRef.current = false;
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error);
      }
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setState(prev => ({ ...prev, status: 'idle', interimTranscript: '', audioLevel: 0 }));
  }, [clearSilenceTimer]);

  // Reset de erro
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, status: 'idle', error: null }));
    retryCountRef.current = 0;
  }, []);

  // Refs estáveis para funções (evitar loop infinito)
  const startRef = useRef(start);
  const stopRef = useRef(stop);
  
  // Atualizar refs quando funções mudarem
  useEffect(() => {
    startRef.current = start;
    stopRef.current = stop;
  });

  // Ref para rastrear enabled
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Iniciar/parar baseado em enabled (sem dependências de funções)
  useEffect(() => {
    if (enabled && state.isSupported) {
      const timer = setTimeout(() => {
        startRef.current();
      }, 500);
      return () => {
        clearTimeout(timer);
        stopRef.current();
      };
    } else {
      stopRef.current();
    }
  }, [enabled, state.isSupported]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    resetError,
    voiceActivity // Expor estado do VAD
  };
};
