import { useState, useEffect, useRef, useCallback } from 'react';

// Configuração para detecção de voz humana
const HUMAN_VOICE_CONFIG = {
  // Faixa de frequência de voz humana (Hz)
  minFrequency: 85,      // Limite inferior da voz masculina
  maxFrequency: 3400,    // Limite superior dos formantes
  
  // Thresholds de detecção - RELAXADOS para melhor sensibilidade
  energyThreshold: 0.008,    // Reduzido de 0.015 para captar vozes mais baixas
  voiceRatioThreshold: 0.25, // Reduzido de 0.35 para mais tolerância
  
  // Detecção de modulação (fala vs ruído constante)
  modulationThreshold: 0.08, // Reduzido de 0.12 para captar modulações sutis
  
  // Janela de análise
  analysisInterval: 50,      // ms entre análises
  historySize: 8,            // frames para média móvel
  
  // FFT
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
};

export interface VoiceActivityState {
  isVoiceDetected: boolean;     // Voz humana detectada
  confidence: number;           // 0-1, confiança da detecção
  energyLevel: number;          // Nível de energia atual (0-100)
  voiceRatio: number;           // % de energia na faixa de voz
  isNoise: boolean;             // Detectado como ruído (não voz)
  frequencyPeak: number;        // Pico de frequência dominante (Hz)
  isActive: boolean;            // Se o VAD está ativo
}

interface UseVoiceActivityDetectionOptions {
  enabled?: boolean;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onNoiseDetected?: () => void;
}

export const useVoiceActivityDetection = ({
  enabled = false,
  onVoiceStart,
  onVoiceEnd,
  onNoiseDetected
}: UseVoiceActivityDetectionOptions = {}) => {
  const [state, setState] = useState<VoiceActivityState>({
    isVoiceDetected: false,
    confidence: 0,
    energyLevel: 0,
    voiceRatio: 0,
    isNoise: false,
    frequencyPeak: 0,
    isActive: false
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const energyHistoryRef = useRef<number[]>([]);
  const wasVoiceDetectedRef = useRef(false);
  const noiseCountRef = useRef(0);
  
  // REFS ESTÁVEIS para callbacks - evita loops infinitos
  const onVoiceStartRef = useRef(onVoiceStart);
  const onVoiceEndRef = useRef(onVoiceEnd);
  const onNoiseDetectedRef = useRef(onNoiseDetected);
  
  useEffect(() => { onVoiceStartRef.current = onVoiceStart; }, [onVoiceStart]);
  useEffect(() => { onVoiceEndRef.current = onVoiceEnd; }, [onVoiceEnd]);
  useEffect(() => { onNoiseDetectedRef.current = onNoiseDetected; }, [onNoiseDetected]);

  // Calcular energia em uma faixa de frequência específica
  const calculateBandEnergy = useCallback((
    dataArray: Uint8Array,
    sampleRate: number,
    minFreq: number,
    maxFreq: number
  ): number => {
    const binSize = sampleRate / HUMAN_VOICE_CONFIG.fftSize;
    const minBin = Math.floor(minFreq / binSize);
    const maxBin = Math.min(Math.ceil(maxFreq / binSize), dataArray.length - 1);
    
    let energy = 0;
    for (let i = minBin; i <= maxBin; i++) {
      energy += dataArray[i] * dataArray[i];
    }
    
    return Math.sqrt(energy / (maxBin - minBin + 1)) / 255;
  }, []);

  // Encontrar pico de frequência
  const findFrequencyPeak = useCallback((
    dataArray: Uint8Array,
    sampleRate: number
  ): number => {
    const binSize = sampleRate / HUMAN_VOICE_CONFIG.fftSize;
    let maxValue = 0;
    let maxIndex = 0;
    
    // Procurar apenas na faixa de voz humana
    const minBin = Math.floor(HUMAN_VOICE_CONFIG.minFrequency / binSize);
    const maxBin = Math.ceil(HUMAN_VOICE_CONFIG.maxFrequency / binSize);
    
    for (let i = minBin; i < Math.min(maxBin, dataArray.length); i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    return maxIndex * binSize;
  }, []);

  // Calcular modulação (variação de amplitude)
  const calculateModulation = useCallback((currentEnergy: number): number => {
    const history = energyHistoryRef.current;
    
    if (history.length < 3) {
      history.push(currentEnergy);
      return 0;
    }
    
    // Manter histórico limitado
    if (history.length >= HUMAN_VOICE_CONFIG.historySize) {
      history.shift();
    }
    history.push(currentEnergy);
    
    // Calcular variância normalizada
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
    
    return Math.sqrt(variance) / (mean + 0.001);
  }, []);

  // Analisar áudio
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const sampleRate = audioContextRef.current.sampleRate;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    analyser.getByteFrequencyData(dataArray);

    // Calcular energia total
    const totalEnergy = calculateBandEnergy(dataArray, sampleRate, 20, 20000);
    
    // Calcular energia na faixa de voz humana
    const voiceEnergy = calculateBandEnergy(
      dataArray, 
      sampleRate, 
      HUMAN_VOICE_CONFIG.minFrequency, 
      HUMAN_VOICE_CONFIG.maxFrequency
    );
    
    // Calcular energia fora da faixa de voz (ruído)
    const lowNoiseEnergy = calculateBandEnergy(dataArray, sampleRate, 20, HUMAN_VOICE_CONFIG.minFrequency);
    const highNoiseEnergy = calculateBandEnergy(dataArray, sampleRate, HUMAN_VOICE_CONFIG.maxFrequency, 8000);
    const noiseEnergy = (lowNoiseEnergy + highNoiseEnergy) / 2;
    
    // Razão de energia na faixa de voz
    const voiceRatio = totalEnergy > 0.001 ? voiceEnergy / totalEnergy : 0;
    
    // Modulação (voz tem variação, ruído é constante)
    const modulation = calculateModulation(voiceEnergy);
    
    // Pico de frequência
    const frequencyPeak = findFrequencyPeak(dataArray, sampleRate);
    
    // Detectar se é voz humana
    const hasEnoughEnergy = totalEnergy > HUMAN_VOICE_CONFIG.energyThreshold;
    const hasVoiceRatio = voiceRatio > HUMAN_VOICE_CONFIG.voiceRatioThreshold;
    const hasModulation = modulation > HUMAN_VOICE_CONFIG.modulationThreshold;
    const isInVoiceRange = frequencyPeak >= HUMAN_VOICE_CONFIG.minFrequency && 
                          frequencyPeak <= HUMAN_VOICE_CONFIG.maxFrequency;
    
    // Verificar se é ruído - CORRIGIDO: só é ruído se energia de ruído for MUITO maior que voz (2x)
    const isNoise = hasEnoughEnergy && !hasVoiceRatio && (noiseEnergy > voiceEnergy * 2);
    
    // Voz detectada - RELAXADO: não exigir todas as condições simultaneamente
    const isVoiceDetected = hasEnoughEnergy && (hasVoiceRatio || (hasModulation && isInVoiceRange)) && !isNoise;
    
    // Calcular confiança
    let confidence = 0;
    if (hasEnoughEnergy) {
      confidence += 0.2;
      if (hasVoiceRatio) confidence += 0.25;
      if (hasModulation) confidence += 0.25;
      if (isInVoiceRange) confidence += 0.2;
      if (!isNoise) confidence += 0.1;
    }

    // Callbacks para eventos - usando refs estáveis
    if (isVoiceDetected && !wasVoiceDetectedRef.current) {
      onVoiceStartRef.current?.();
    } else if (!isVoiceDetected && wasVoiceDetectedRef.current) {
      onVoiceEndRef.current?.();
    }
    
    if (isNoise) {
      noiseCountRef.current++;
      if (noiseCountRef.current >= 3) {
        onNoiseDetectedRef.current?.();
        noiseCountRef.current = 0;
      }
    } else {
      noiseCountRef.current = 0;
    }
    
    wasVoiceDetectedRef.current = isVoiceDetected;

    setState({
      isVoiceDetected,
      confidence,
      energyLevel: Math.min(100, totalEnergy * 500),
      voiceRatio,
      isNoise,
      frequencyPeak,
      isActive: true
    });

    // Continuar análise
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [calculateBandEnergy, calculateModulation, findFrequencyPeak]); // Removidas dependências de callbacks - usam refs

  // Iniciar VAD
  const start = useCallback(async () => {
    try {
      // Obter stream do microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Criar contexto de áudio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Criar analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = HUMAN_VOICE_CONFIG.fftSize;
      analyser.smoothingTimeConstant = HUMAN_VOICE_CONFIG.smoothingTimeConstant;
      analyserRef.current = analyser;

      // Conectar stream ao analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Iniciar análise
      analyzeAudio();

      console.log('🎙️ VAD iniciado - detectando voz humana');
    } catch (error) {
      console.error('❌ Erro ao iniciar VAD:', error);
      setState(prev => ({ ...prev, isActive: false }));
    }
  }, [analyzeAudio]);

  // Parar VAD
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    energyHistoryRef.current = [];
    wasVoiceDetectedRef.current = false;
    noiseCountRef.current = 0;

    setState({
      isVoiceDetected: false,
      confidence: 0,
      energyLevel: 0,
      voiceRatio: 0,
      isNoise: false,
      frequencyPeak: 0,
      isActive: false
    });

    console.log('🔇 VAD parado');
  }, []);

  // Refs para funções estáveis
  const startRef = useRef(start);
  const stopRef = useRef(stop);
  
  useEffect(() => {
    startRef.current = start;
    stopRef.current = stop;
  });

  // Gerenciar lifecycle baseado em enabled - SEM deps de funções
  useEffect(() => {
    if (enabled) {
      startRef.current();
    } else {
      stopRef.current();
    }

    return () => {
      stopRef.current();
    };
  }, [enabled]); // Apenas enabled como dependência

  return {
    ...state,
    start,
    stop
  };
};
