import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import NutriCharacter, { CharacterMood } from './NutriCharacter';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from 'sonner';

const NutriAI = () => {
  const { messages, sendMessage, startConversation, isProcessing, currentMood, isAISpeaking } = useChat();
  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [isActive, setIsActive] = useState(false);

  // Controle via prop enabled - NÃO manual
  const voiceRecognition = useVoiceRecognition({
    enabled: isActive && !isAISpeaking, // Automaticamente controla start/stop
    onResult: (text) => {
      console.log('🎤 NutriAI recebeu texto:', text);
      if (text && text.trim().length > 0) {
        handleUserMessage(text);
      }
    },
    onError: (error) => {
      console.error('❌ Erro voz:', error);
      toast.error('Erro no reconhecimento de voz: ' + error);
    }
  });

  // Debug state
  useEffect(() => {
    console.log('🤖 NutriAI State:', { 
      isActive, 
      isAISpeaking, 
      voiceStatus: voiceRecognition.status,
      shouldListen: isActive && !isAISpeaking
    });
  }, [isActive, isAISpeaking, voiceRecognition.status]);

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
    await sendMessage(text);
  }, [sendMessage]);

  const handleCharacterClick = async () => {
    if (!isActive) {
      setIsActive(true);
      setMood('happy');

      if (messages.length === 0) {
        await startConversation();
      }
      // Não precisa chamar startListening - o hook controla automaticamente via enabled
    } else {
      handleSleep();
    }
  };

  const handleSleep = () => {
    setIsActive(false);
    setMood('neutral');
    // Não precisa chamar stopListening - o hook controla automaticamente via enabled
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        <motion.div
          className="relative cursor-pointer"
          initial={{ scale: 1 }}
          animate={{ 
            scale: isActive ? 1.4 : 1,
            y: isActive ? -20 : 0,
            filter: isActive 
              ? 'drop-shadow(0 0 12px hsl(var(--primary))) drop-shadow(0 0 24px hsl(var(--primary) / 0.5))' 
              : 'drop-shadow(0 0 0px transparent)'
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          whileHover={{ scale: isActive ? 1.45 : 1.05 }}
          whileTap={{ scale: isActive ? 1.35 : 0.95 }}
          onClick={handleCharacterClick}
        >
          <NutriCharacter
            isActive={isActive}
            isSpeaking={isAISpeaking || isProcessing}
            mood={mood}
            size={80}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default NutriAI;
