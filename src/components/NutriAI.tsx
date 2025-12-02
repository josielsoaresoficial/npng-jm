import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NutriCharacter, { CharacterMood } from './NutriCharacter';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useVoice } from '@/hooks/useVoice';
import { toast } from 'sonner';

const NutriAI = () => {
  const { messages, sendMessage, startConversation, isProcessing, currentMood } = useChat();
  const { speak, isPlaying } = useVoice();
  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [dialogueText, setDialogueText] = useState('');
  const [showDialogue, setShowDialogue] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const voiceRecognition = useVoiceRecognition({
    onResult: (text) => {
      if (text && text.trim().length > 0) {
        handleUserMessage(text);
      }
    },
    onError: (error) => {
      toast.error('Erro no reconhecimento de voz: ' + error);
    }
  });

  const isListening = voiceRecognition.status === 'listening';
  const startListening = voiceRecognition.start;
  const stopListening = voiceRecognition.stop;

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

  // Show dialogue when there's a new AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      setDialogueText(lastMessage.content.substring(0, 150) + (lastMessage.content.length > 150 ? '...' : ''));
      setShowDialogue(true);
      
      if (voiceEnabled && lastMessage.content) {
        speak(lastMessage.content, 'elevenlabs-female');
      }

      const timer = setTimeout(() => {
        setShowDialogue(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [messages, voiceEnabled, speak]);

  const handleUserMessage = useCallback(async (text: string) => {
    setMood('thinking');
    await sendMessage(text);
  }, [sendMessage]);

  const handleCharacterClick = async () => {
    if (!isActive) {
      setIsActive(true);
      setMood('happy');
      
      const welcomeMessages = [
        "Olá! Como posso ajudar você hoje?",
        "Pronto para falarmos sobre nutrição?",
        "Estou aqui para ajudar com sua alimentação!"
      ];
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      setDialogueText(randomWelcome);
      setShowDialogue(true);

      if (messages.length === 0) {
        await startConversation();
      }

      setTimeout(() => {
        setShowDialogue(false);
      }, 5000);
    } else {
      if (isListening) {
        stopListening();
      } else {
        startListening();
        setMood('neutral');
        setDialogueText('Estou ouvindo... 🎤');
        setShowDialogue(true);
      }
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast.info(voiceEnabled ? 'Voz desativada' : 'Voz ativada');
  };

  const handleSleep = () => {
    setIsActive(false);
    setShowDialogue(false);
    setMood('neutral');
    if (isListening) {
      stopListening();
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        {/* Dialogue bubble */}
        <AnimatePresence>
          {showDialogue && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64"
            >
              <div className="relative bg-card border border-border rounded-2xl p-3 shadow-lg">
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
                <p className="text-sm text-foreground leading-relaxed relative z-10">
                  {dialogueText}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character */}
        <motion.div
          className="relative cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCharacterClick}
        >
          {/* Background glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl blur-xl"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)' }}
            animate={{
              scale: isActive ? [1, 1.1, 1] : 1,
              opacity: isActive ? [0.5, 0.8, 0.5] : 0.3
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          <NutriCharacter
            isActive={isActive}
            isSpeaking={isPlaying || isProcessing}
            mood={mood}
            size={140}
          />

          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-destructive rounded-full p-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                >
                  <Mic className="w-4 h-4 text-destructive-foreground" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Control buttons - simplified without settings */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
            >
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoice();
                }}
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSleep();
                }}
              >
                <span className="text-xs">💤</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NutriAI;
