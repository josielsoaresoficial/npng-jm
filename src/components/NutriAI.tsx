import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/untyped';
import { useChat } from '@/hooks/useChat';
import { VoiceProvider } from '@/hooks/useVoice';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { SaveRecipeDialog } from './SaveRecipeDialog';
import RobotButton from './RobotButton';

const NutriAI = () => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    startConversation,
    isProcessing,
    voiceProvider,
    setVoiceProvider 
  } = useChat('google-male');
  
  const [isActive, setIsActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [saveRecipeDialog, setSaveRecipeDialog] = useState(false);
  const [selectedRecipeContent, setSelectedRecipeContent] = useState('');

  // Hook de reconhecimento de voz
  const voiceRecognition = useVoiceRecognition({
    language: 'pt-BR',
    continuous: true,
    silenceTimeout: 2000,
    enabled: isActive && !isAISpeaking,
    onResult: (transcript, confidence) => {
      console.log('🎤 Voz capturada:', transcript, 'Confiança:', confidence);
      sendMessage(transcript, true);
    },
    onError: (error) => {
      console.error('❌ Erro de voz:', error);
    }
  });

  // Detectar se uma mensagem contém uma receita
  const isRecipeMessage = (content: string) => {
    const recipeKeywords = [
      'ingredientes',
      'modo de preparo',
      'receita',
      'calorias',
      'proteína',
      'porção',
      'preparo:'
    ];
    const lowerContent = content.toLowerCase();
    const matchCount = recipeKeywords.filter(keyword => lowerContent.includes(keyword)).length;
    return matchCount >= 2;
  };

  // Verificar se a última mensagem da IA contém receita
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && isRecipeMessage(lastMessage.content)) {
        setSelectedRecipeContent(lastMessage.content);
        setSaveRecipeDialog(true);
      }
    }
  }, [messages]);

  // Monitorar quando AI termina de falar
  useEffect(() => {
    const checkSpeaking = () => {
      const isSpeaking = window.speechSynthesis.speaking;
      if (isAISpeaking && !isSpeaking) {
        console.log('✅ AI terminou de falar');
        setIsAISpeaking(false);
      } else if (!isAISpeaking && isSpeaking) {
        console.log('🔊 AI começou a falar');
        setIsAISpeaking(true);
      }
    };
    
    const interval = setInterval(checkSpeaking, 300);
    return () => clearInterval(interval);
  }, [isAISpeaking]);

  // Ativar/Desativar NutriAI
  const toggleNutriAI = async () => {
    if (!isActive) {
      console.log('🚀 ATIVANDO NutriAI...');
      setIsActive(true);
      await startConversation();
      console.log('💬 Conversa iniciada, ouvindo...');
    } else {
      console.log('❌ Desativando NutriAI');
      setIsActive(false);
      voiceRecognition.stop();
    }
  };

  return (
    <>
      <RobotButton 
        onClick={toggleNutriAI} 
        isActive={isActive}
        isListening={voiceRecognition.status === 'listening' && !isAISpeaking}
        isSpeaking={isAISpeaking}
        isProcessing={isProcessing}
      />

      <SaveRecipeDialog 
        open={saveRecipeDialog}
        onOpenChange={setSaveRecipeDialog}
        recipeContent={selectedRecipeContent}
      />
    </>
  );
};

export default NutriAI;
