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
  enabled = false // Default FALSE - controlado externamente
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
  
  // REFS ESTÁVEIS para evitar closures stale
  const enabledRef = useRef(enabled);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  
  // Atualizar refs quando props mudarem
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Hook de detecção de atividade de voz (VAD)
  const voiceActivity = useVoiceActivityDetection({
    enabled: enabled && state.status === 'listening',
    onNoiseDetected: () => {
      console.log('🔇 Ruído ambiental detectado');
    }
  });
  
  // Ref para VAD evitar closures stale
  const voiceActivityRef = useRef(voiceActivity);
  useEffect(() => {
    voiceActivityRef.current = voiceActivity;
  }, [voiceActivity]);

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

  // Verificar se o texto é provavelmente ruído - RELAXADO
  const isLikelyNoise = useCallback((text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    
    // Texto muito curto - RELAXADO de 3 para 2
    if (trimmed.length < 2) return true;
    
    // Todas as palavras são ruídos conhecidos
    const nonNoiseWords = words.filter(w => 
      !NOISE_PATTERNS.vocalNoises.has(w) &&
      !NOISE_PATTERNS.environmentalSounds.has(w) &&
      !NOISE_PATTERNS.shortFalsePositives.has(w)
    );
    
    if (nonNoiseWords.length === 0) return true;
    
    // Verificar padrão de eco
    if (hasEchoPattern(trimmed)) return true;
    
    // Alta proporção de palavras de ruído - RELAXADO de 0.3 para 0.2
    if (nonNoiseWords.length / words.length < 0.2) return true;
    
    return false;
  }, []);

  // Validar se o conteúdo é válido (não é ruído) - RELAXADO
  const isValidContent = useCallback((text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    
    // Verificar ruído baseado em padrões de texto
    if (isLikelyNoise(trimmed)) {
      console.log('❌ Descartado (padrão de ruído):', text);
      return false;
    }
    
    // Verificar se tem pelo menos uma palavra com 2+ caracteres (era 3)
    const words = trimmed.split(/\s+/);
    const hasValidWord = words.some(w => 
      w.length >= 2 && 
      !NOISE_PATTERNS.vocalNoises.has(w) &&
      !NOISE_PATTERNS.environmentalSounds.has(w)
    );
    
    if (!hasValidWord) {
      console.log('❌ Descartado: sem palavras válidas -', text);
      return false;
    }
    
    return true;
  }, [isLikelyNoise]);

  // Processar resultado final - VAD APENAS COMO CONSELHEIRO (usa refs)
  const processFinalResult = useCallback((transcript: string, confidence: number) => {
    const vad = voiceActivityRef.current;
    
    // Debug VAD state
    console.log('📊 VAD State:', {
      isActive: vad.isActive,
      isNoise: vad.isNoise,
      isVoiceDetected: vad.isVoiceDetected,
      confidence: vad.confidence
    });

    // VAD COMO CONSELHEIRO - NÃO BLOQUEIA, apenas loga
    if (vad.isActive && vad.isNoise && vad.confidence > 0.8) {
      console.log('⚠️ VAD indica possível ruído (confidence:', vad.confidence, ') - verificando filtros de texto');
    }

    // Filtro de confiança mínima MUITO RELAXADO (30%)
    if (confidence < 0.3) {
      console.log('❌ Descartado: confiança muito baixa -', confidence, transcript);
      return;
    }
    
    // Validar conteúdo - os filtros de texto são mais confiáveis
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
    
    console.log('✅ Resultado final válido:', transcript, 'Confiança:', confidence);
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

    // Usar ref para callback
    onResultRef.current?.(transcript, confidence);
    
    // Voltar para listening após processar
    setTimeout(() => {
      processingFinalRef.current = false;
      setState(prev => prev.status === 'processing' ? { ...prev, status: 'listening' } : prev);
    }, 300);
  }, [clearSilenceTimer, isValidContent]); // Removidas dependências do VAD - usa refs

  // Iniciar reconhecimento (usa refs para evitar closures stale)
  const start = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        status: 'unsupported',
        error: 'Reconhecimento de voz não suportado neste navegador' 
      }));
      onErrorRef.current?.('Reconhecimento de voz não suportado');
      return;
    }

    if (isActiveRef.current) {
      console.log('⚠️ Reconhecimento já ativo');
      return;
    }

    console.log('🎤 Iniciando reconhecimento de voz...');

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('🎤 Reconhecimento ATIVO');
        isActiveRef.current = true;
        retryCountRef.current = 0;
        setState(prev => ({ ...prev, status: 'listening', error: null }));
      };

      recognition.onend = () => {
        console.log('🔇 Reconhecimento encerrado, enabled:', enabledRef.current);
        isActiveRef.current = false;
        
        // Auto-reconexão usando ref
        if (enabledRef.current && retryCountRef.current < 5) {
          const delay = Math.min(300 * Math.pow(2, retryCountRef.current), 5000);
          console.log(`🔄 Reconectando em ${delay}ms...`);
          setTimeout(() => {
            if (enabledRef.current && !isActiveRef.current) {
              retryCountRef.current++;
              start();
            }
          }, delay);
        } else {
          setState(prev => ({ ...prev, status: 'idle' }));
        }
      };

      recognition.onresult = (event: any) => {
        const vad = voiceActivityRef.current;
        
        // VAD NÃO BLOQUEIA - apenas loga
        if (vad.isActive && vad.isNoise) {
          console.log('⚠️ VAD indica ruído, mas processando...');
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
          
          clearSilenceTimer();
          
          silenceTimerRef.current = setTimeout(() => {
            if (processingFinalRef.current) return;
            
            const currentInterim = interimTranscript.trim();
            const wordCount = currentInterim.split(' ').filter(w => w.length > 0).length;
            
            if (currentInterim && (wordCount >= 2 || currentInterim.length >= 4)) {
              console.log('⏱️ Processando por silêncio:', currentInterim);
              processFinalResult(currentInterim, 0.5);
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
        onErrorRef.current?.(errorMessage);
        
        // Retry automático usando ref
        if (['no-speech', 'aborted'].includes(event.error) && enabledRef.current && retryCountRef.current < 3) {
          setTimeout(() => {
            if (enabledRef.current) {
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
      onErrorRef.current?.('Erro ao iniciar reconhecimento de voz');
    }
  }, [state.isSupported, continuous, language, silenceTimeout, clearSilenceTimer, processFinalResult]); // Removidas deps de callbacks e VAD

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

  // Refs estáveis para funções
  const startRef = useRef(start);
  const stopRef = useRef(stop);
  
  useEffect(() => {
    startRef.current = start;
    stopRef.current = stop;
  });

  // Iniciar/parar baseado em enabled
  useEffect(() => {
    console.log('🔄 Effect enabled changed:', enabled, 'isSupported:', state.isSupported, 'isActive:', isActiveRef.current);
    
    if (enabled && state.isSupported) {
      // Verificar suporte detalhado
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('❌ SpeechRecognition API não disponível');
        setState(prev => ({ ...prev, status: 'unsupported', error: 'API de voz não disponível' }));
        return;
      }
      
      console.log('✅ SpeechRecognition disponível:', !!SpeechRecognition);
      
      // Delay maior para garantir que tudo está pronto
      const timer = setTimeout(() => {
        if (!isActiveRef.current) {
          console.log('▶️ Auto-starting recognition...');
          startRef.current();
        } else {
          console.log('⚠️ Recognition já ativo, pulando start');
        }
      }, 500);
      
      return () => {
        clearTimeout(timer);
        console.log('⏹️ Auto-stopping recognition...');
        stopRef.current();
      };
    } else if (!enabled) {
      console.log('⏹️ Disabled - stopping recognition');
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
