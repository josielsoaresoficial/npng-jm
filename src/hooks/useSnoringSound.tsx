import { useEffect, useRef } from 'react';

export const useSnoringSound = (isActive: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Inicializar AudioContext apenas uma vez
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const startSnoring = () => {
      if (isPlayingRef.current || !audioContextRef.current) return;

      const audioContext = audioContextRef.current;
      
      // Criar oscilador para o som de ronco
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configurar o som de ronco
      oscillator.type = 'sine'; // Onda senoidal para som suave
      oscillator.frequency.value = 80; // Frequência baixa (ronco grave)
      
      // Volume muito baixo para ser suave
      gainNode.gain.value = 0;
      
      // Conectar oscilador -> ganho -> saída
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Iniciar o som
      oscillator.start();
      
      // Animar o volume para criar efeito de respiração
      const breatheIn = () => {
        if (!isPlayingRef.current) return;
        
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 1.5); // Inspire (1.5s)
        
        setTimeout(() => {
          if (!isPlayingRef.current) return;
          breatheOut();
        }, 1500);
      };
      
      const breatheOut = () => {
        if (!isPlayingRef.current) return;
        
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5); // Expire (1.5s)
        
        setTimeout(() => {
          if (!isPlayingRef.current) return;
          breatheIn();
        }, 1500);
      };
      
      // Começar o ciclo de respiração
      breatheIn();
      
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      isPlayingRef.current = true;
    };

    const stopSnoring = () => {
      if (!isPlayingRef.current) return;
      
      isPlayingRef.current = false;
      
      if (gainNodeRef.current && audioContextRef.current) {
        // Fade out suave
        gainNodeRef.current.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        gainNodeRef.current.gain.setValueAtTime(
          gainNodeRef.current.gain.value,
          audioContextRef.current.currentTime
        );
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current.currentTime + 0.3
        );
        
        // Parar o oscilador após o fade out
        setTimeout(() => {
          if (oscillatorRef.current) {
            try {
              oscillatorRef.current.stop();
            } catch (e) {
              // Ignorar erro se já parou
            }
            oscillatorRef.current = null;
          }
        }, 300);
      }
      
      gainNodeRef.current = null;
    };

    // Controlar o som baseado no estado do robô
    if (!isActive) {
      startSnoring();
    } else {
      stopSnoring();
    }

    // Cleanup ao desmontar
    return () => {
      stopSnoring();
    };
  }, [isActive]);

  return null;
};
