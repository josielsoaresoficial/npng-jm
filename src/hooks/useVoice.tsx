import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VoiceProvider = 'google' | 'elevenlabs-male' | 'elevenlabs-female';

export const useVoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar timeout de segurança
  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // Resetar estado de reprodução
  const resetPlayingState = useCallback(() => {
    setIsPlaying(false);
    setIsLoading(false);
    sessionStorage.removeItem('voice_playing');
    clearSafetyTimeout();
  }, [clearSafetyTimeout]);

  const speak = useCallback(async (text: string, voiceProvider: VoiceProvider = 'elevenlabs-male', onSpeechEnd?: () => void) => {
    if (!text || isPlaying) return;

    // Verificar se outra voz já está tocando (previne duplicação)
    const globalPlaying = sessionStorage.getItem('voice_playing') === 'true';
    if (globalPlaying) {
      console.log('Outra voz já está tocando, aguardando...');
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem('voice_playing', 'true');
    
    // Timeout de segurança: resetar estado se áudio não iniciar em 15 segundos
    safetyTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança: áudio não iniciou em 15s, resetando estado');
      resetPlayingState();
      toast.error('Voz temporariamente indisponível', { duration: 3000 });
    }, 15000);
    
    try {
      console.log('🔊 Requesting speech for:', { text: text.substring(0, 50), voiceProvider });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceProvider },
      });

      if (error) {
        console.error('Error generating speech:', error);
        resetPlayingState();
        return;
      }

      if (!data?.audioContent) {
        console.error('No audio content received');
        resetPlayingState();
        return;
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Play audio
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => {
        console.log('✅ Áudio iniciado com sucesso');
        setIsPlaying(true);
        setIsLoading(false);
        clearSafetyTimeout();
      };
      
      audio.onended = () => {
        console.log('✅ Áudio finalizado');
        setIsPlaying(false);
        sessionStorage.removeItem('voice_playing');
        URL.revokeObjectURL(url);
        clearSafetyTimeout();
        onSpeechEnd?.();
        window.dispatchEvent(new Event('speechSynthesisEnded'));
      };
      
      audio.onerror = (e) => {
        console.error('❌ Erro ao reproduzir áudio:', e);
        resetPlayingState();
        URL.revokeObjectURL(url);
      };

      // Tentar reproduzir com tratamento de autoplay bloqueado
      try {
        await audio.play();
        console.log('🔊 Audio playing successfully');
      } catch (playError: any) {
        if (playError.name === 'NotAllowedError') {
          console.warn('⚠️ Autoplay bloqueado pelo navegador');
          toast.info('Clique em qualquer lugar para ativar o áudio', { duration: 4000 });
        } else {
          console.error('❌ Erro ao iniciar reprodução:', playError);
        }
        resetPlayingState();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error in speak function:', error);
      resetPlayingState();
    }
  }, [isPlaying, resetPlayingState, clearSafetyTimeout]);

  // Função para parar o áudio
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    resetPlayingState();
  }, [resetPlayingState]);

  return { speak, isLoading, isPlaying, stopSpeaking };
};
