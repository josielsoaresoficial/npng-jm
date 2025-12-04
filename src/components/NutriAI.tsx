import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NutriCharacter, { CharacterMood } from './NutriCharacter';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from 'sonner';
import { Mic, MicOff, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const NutriAI = () => {
  const { messages, sendMessage, startConversation, isProcessing, currentMood, isAISpeaking } = useChat();
  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [isActive, setIsActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [hasShownUnsupportedToast, setHasShownUnsupportedToast] = useState(false);

  // Controle via prop enabled - NÃO manual
  const voiceRecognition = useVoiceRecognition({
    enabled: isActive && !isAISpeaking,
    onResult: (text) => {
      console.log('🎤 NutriAI recebeu texto:', text);
      if (text && text.trim().length > 0) {
        handleUserMessage(text);
      }
    },
    onError: (error) => {
      console.error('❌ Erro voz:', error);
      if (error.includes('Permissão') || error.includes('not-allowed')) {
        toast.error('Permissão de microfone negada. Use o campo de texto abaixo.');
        setShowTextFallback(true);
      } else {
        toast.error('Erro no reconhecimento de voz: ' + error);
      }
    }
  });

  // Verificar suporte e mostrar toast apenas uma vez
  useEffect(() => {
    if (isActive && !voiceRecognition.isSupported && !hasShownUnsupportedToast) {
      toast.error('Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.', {
        duration: 5000
      });
      setShowTextFallback(true);
      setHasShownUnsupportedToast(true);
    }
  }, [isActive, voiceRecognition.isSupported, hasShownUnsupportedToast]);

  // Mostrar fallback se voz não funcionar após 3 segundos
  useEffect(() => {
    if (isActive && voiceRecognition.status === 'idle') {
      const timer = setTimeout(() => {
        if (voiceRecognition.status === 'idle' && !showTextFallback) {
          console.log('⚠️ Voz não iniciou após 3s, mostrando fallback');
          setShowTextFallback(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, voiceRecognition.status, showTextFallback]);

  // Debug state
  useEffect(() => {
    console.log('🤖 NutriAI State:', { 
      isActive, 
      isAISpeaking, 
      voiceStatus: voiceRecognition.status,
      isSupported: voiceRecognition.isSupported,
      shouldListen: isActive && !isAISpeaking,
      showTextFallback
    });
  }, [isActive, isAISpeaking, voiceRecognition.status, voiceRecognition.isSupported, showTextFallback]);

  // Map chat mood to character mood
  useEffect(() => {
    if (currentMood) {
      const moodMap: Record<string, CharacterMood> = {
        happy: 'happy',
        excited: 'excited',
        thinking: 'thinking',
        serious: 'serious',
        sad: 'sad',
        grateful: 'happy',
        neutral: 'neutral'
      };
      setMood(moodMap[currentMood] || 'neutral');
    }
  }, [currentMood]);

  const handleUserMessage = useCallback(async (text: string) => {
    setMood('thinking');
    setTextInput('');
    await sendMessage(text);
  }, [sendMessage]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput.trim());
    }
  };

  const handleCharacterClick = async () => {
    if (!isActive) {
      setIsActive(true);
      setMood('happy');

      if (messages.length === 0) {
        await startConversation();
      }
    } else {
      handleSleep();
    }
  };

  const handleSleep = () => {
    setIsActive(false);
    setMood('neutral');
    setShowTextFallback(false);
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (!isActive) return null;
    
    const getStatusInfo = () => {
      if (isAISpeaking || isProcessing) {
        return { icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Respondendo...', color: 'bg-blue-500' };
      }
      switch (voiceRecognition.status) {
        case 'listening':
          return { icon: <Mic className="w-3 h-3 animate-pulse" />, text: 'Ouvindo...', color: 'bg-green-500' };
        case 'processing':
          return { icon: <Loader2 className="w-3 h-3 animate-spin" />, text: 'Processando...', color: 'bg-yellow-500' };
        case 'error':
          return { icon: <AlertCircle className="w-3 h-3" />, text: 'Erro', color: 'bg-red-500' };
        case 'unsupported':
          return { icon: <MicOff className="w-3 h-3" />, text: 'Sem suporte', color: 'bg-gray-500' };
        default:
          return { icon: <MicOff className="w-3 h-3" />, text: 'Aguardando...', color: 'bg-gray-500' };
      }
    };
    
    const status = getStatusInfo();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`absolute -top-8 left-1/2 -translate-x-1/2 ${status.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap`}
      >
        {status.icon}
        <span>{status.text}</span>
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        <StatusIndicator />
        
        <motion.div
          className="relative cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCharacterClick}
        >
          <NutriCharacter
            isActive={isActive}
            isSpeaking={isAISpeaking || isProcessing}
            mood={mood}
            size={140}
          />
        </motion.div>

        {/* Text input fallback */}
        <AnimatePresence>
          {isActive && showTextFallback && (
            <motion.form
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onSubmit={handleTextSubmit}
              className="absolute -left-48 top-1/2 -translate-y-1/2 flex gap-1 bg-background/95 backdrop-blur-sm p-2 rounded-lg border shadow-lg"
            >
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="w-40 h-8 text-sm"
                disabled={isProcessing || isAISpeaking}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="h-8 w-8 p-0"
                disabled={!textInput.trim() || isProcessing || isAISpeaking}
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NutriAI;
