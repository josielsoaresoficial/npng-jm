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
    <div className="fixed bottom-4 right-3 z-50">
      <div className="relative">
        <motion.div
          className="relative cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
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
