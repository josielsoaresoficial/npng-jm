import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/untyped';
import { useChat } from '@/hooks/useChat';
import { VoiceProvider } from '@/hooks/useVoice';
import VoiceSettings from './VoiceSettings';
import ConversationHistory from './ConversationHistory';
import { SaveRecipeDialog } from './SaveRecipeDialog';
import { History, BookmarkPlus } from 'lucide-react';

const NutriAI = () => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    startConversation,
    loadConversation,
    isProcessing,
    voiceProvider,
    setVoiceProvider 
  } = useChat('google-male'); // ✅ Iniciar com Google como padrão
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saveRecipeDialog, setSaveRecipeDialog] = useState(false);
  const [selectedRecipeContent, setSelectedRecipeContent] = useState('');
  const [profileName, setProfileName] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isRecognitionActive = useRef(false);
  const interimTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [textInput, setTextInput] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);

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
    return matchCount >= 2; // Se tiver pelo menos 2 keywords, provavelmente é uma receita
  };

  const handleSaveRecipe = (content: string) => {
    setSelectedRecipeContent(content);
    setSaveRecipeDialog(true);
  };

  // ✅ BUSCAR NOME DO PERFIL
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const profile = data as any;
      if (profile && profile.name) {
        setProfileName(profile.name);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Trocar voz manualmente (temporário, não persiste)
  const handleVoiceChange = (newVoice: VoiceProvider) => {
    setVoiceProvider(newVoice);
  };

  // ✅ EXTRAIR PRIMEIRO NOME DO PERFIL
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'Amigo';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(profileName);

  // ✅ DETECTAR SUPORTE A VOZ
  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setVoiceSupported(supported);
    if (!supported) {
      console.log('⚠️ Reconhecimento de voz não disponível - usando entrada de texto');
    }
  }, []);

  // ✅ FUNÇÃO PARA ENVIAR TEXTO DIGITADO
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing) {
      sendMessage(textInput.trim(), true);
      setTextInput('');
    }
  };

  // ✅ CONFIGURAÇÃO AVANÇADA DE VOZ
  useEffect(() => {
    console.log('🔧 useEffect reconhecimento - isActive:', isActive, 'isPaused:', isPaused);
    
    if (!('webkitSpeechRecognition' in window)) {
      console.error('❌ webkitSpeechRecognition não disponível neste navegador');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('🎤 Reconhecimento de voz INICIADO - Microfone ativo');
      isRecognitionActive.current = true;
      setIsListening(true);
    };

    recognition.onend = () => {
      console.log('🔇 Reconhecimento parou');
      isRecognitionActive.current = false;
      setIsListening(false);
      
      // ✅ RECONECTAR AUTOMATICAMENTE se ainda estiver ativo E NÃO PAUSADO
      if (isActive && !isPaused) {
        setTimeout(() => {
          if (recognitionRef.current && isActive && !isPaused && !isRecognitionActive.current) {
            try {
              console.log('🔄 Reiniciando reconhecimento...');
              recognitionRef.current.start();
            } catch (e) {
              console.log('⚠️ Reconhecimento já ativo');
            }
          }
        }, 800);
      }
    };

    recognition.onresult = (event: any) => {
      console.log('🎧 CAPTANDO AUDIO - isPaused:', isPaused, 'isAISpeaking:', isAISpeaking, 'isProcessing:', isProcessing);
      
      // ✅ Cancelar fala anterior se AI ainda está falando
      if (window.speechSynthesis.speaking) {
        console.log('🔇 Cancelando fala anterior da AI...');
        window.speechSynthesis.cancel();
        setIsAISpeaking(false);
      }
      
      // ✅ NÃO PROCESSAR SE ESTIVER PAUSADO OU AI FALANDO
      if (isPaused || isAISpeaking) {
        console.log('⏸️ Reconhecimento pausado ou AI falando, ignorando entrada');
        return;
      }
      
      // Limpar timer anterior
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`📊 Resultado ${i}: "${transcript}" (final: ${event.results[i].isFinal})`);
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Se tiver resultado final, processar imediatamente
      if (finalTranscript.trim()) {
        console.log('✅ Texto FINAL capturado:', finalTranscript);
        interimTranscriptRef.current = '';
        sendMessage(finalTranscript, true);
      } else if (interimTranscript.trim()) {
        // Armazenar resultado intermediário
        interimTranscriptRef.current = interimTranscript;
        console.log('💬 Texto INTERMEDIÁRIO armazenado:', interimTranscript);
        
        // Se não houver mais fala em 1.5s, processar o resultado intermediário
        silenceTimerRef.current = setTimeout(() => {
          if (interimTranscriptRef.current.trim()) {
            console.log('⏱️ Processando por SILÊNCIO:', interimTranscriptRef.current);
            sendMessage(interimTranscriptRef.current, true);
            interimTranscriptRef.current = '';
          }
        }, 1500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Erro no reconhecimento:', event.error);
      isRecognitionActive.current = false;
      if (event.error === 'not-allowed') {
        alert('Permissão de microfone negada. Ative o microfone para conversar com o NutriAI.');
      }
    };

    recognitionRef.current = recognition;
    
    // ✅ INICIAR RECONHECIMENTO SE JÁ ESTÁ ATIVO
    if (isActive && !isPaused && !isRecognitionActive.current) {
      setTimeout(() => {
        try {
          console.log('▶️ Iniciando reconhecimento de voz automaticamente...');
          recognition.start();
        } catch (e) {
          console.error('❌ Erro ao iniciar reconhecimento:', e);
        }
      }, 2500);
    }
    
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current && isRecognitionActive.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, isPaused, sendMessage]);

  // ✅ Monitorar quando AI termina de falar e reiniciar reconhecimento
  useEffect(() => {
    const handleSpeechEnd = () => {
      console.log('✅ AI terminou de falar, preparando para ouvir novamente...');
      setIsAISpeaking(false);
      
      // Reiniciar reconhecimento imediatamente após AI terminar
      if (recognitionRef.current && isActive && !isPaused && !isRecognitionActive.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            console.log('🎤 Reconhecimento reiniciado após AI falar');
          } catch (e) {
            console.log('⚠️ Reconhecimento já ativo');
          }
        }, 300);
      }
    };
    
    window.addEventListener('speechSynthesisEnded', handleSpeechEnd);
    return () => window.removeEventListener('speechSynthesisEnded', handleSpeechEnd);
  }, [isActive, isPaused]);

  // ✅ Monitorar estado de speechSynthesis continuamente
  useEffect(() => {
    const checkSpeaking = () => {
      const isSpeaking = window.speechSynthesis.speaking;
      if (isAISpeaking && !isSpeaking) {
        console.log('✅ speechSynthesis parou, atualizando estado...');
        setIsAISpeaking(false);
        
        // Reiniciar reconhecimento se necessário
        if (recognitionRef.current && isActive && !isPaused && !isRecognitionActive.current) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
              console.log('🎤 Reconhecimento reiniciado');
            } catch (e) {
              console.log('⚠️ Erro ao reiniciar:', e);
            }
          }, 500);
        }
      } else if (!isAISpeaking && isSpeaking) {
        setIsAISpeaking(true);
        console.log('🔊 AI começou a falar, pausando reconhecimento...');
      }
    };
    
    const interval = setInterval(checkSpeaking, 300);
    return () => clearInterval(interval);
  }, [isActive, isPaused, isAISpeaking]);



  // ✅ ATIVAÇÃO DO NUTRIAI
  const activateNutriAI = async () => {
    console.log('🚀 ATIVANDO NutriAI...');
    setIsActive(true);
    
    // Inicia a conversa
    await startConversation();
    console.log('💬 Conversa iniciada, preparando reconhecimento de voz...');
  };

  // ✅ PAUSAR/RETOMAR CONVERSA
  const togglePause = () => {
    const newPausedState = !isPaused;
    console.log(`${newPausedState ? '⏸️ PAUSANDO' : '▶️ RETOMANDO'} NutriAI`);
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      // PAUSAR - parar o reconhecimento
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          isRecognitionActive.current = false;
        } catch (e) {
          console.log('⚠️ Erro ao parar reconhecimento');
        }
      }
    } else {
      // RETOMAR - reiniciar o reconhecimento
      setTimeout(() => {
        if (recognitionRef.current && !isRecognitionActive.current) {
          try {
            recognitionRef.current.start();
            console.log('✅ Reconhecimento retomado');
          } catch (e) {
            console.log('⚠️ Reconhecimento já ativo');
          }
        }
      }, 300);
    }
  };

  // ✅ DESATIVAR CORRETAMENTE
  const deactivateNutriAI = () => {
    console.log('❌ Desativando NutriAI');
    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('⚠️ Erro ao parar reconhecimento');
      }
    }
    isRecognitionActive.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsPaused(false);
  };


  return (
    <div className="nutri-ai-container">
      {!isActive && (
        <button 
          onClick={activateNutriAI}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform z-50"
        >
          <span className="flex items-center gap-1.5 text-sm md:text-base font-semibold">
            🧠 NutriAI
          </span>
        </button>
      )}

      {isActive && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[90vw] max-w-sm md:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-800 z-50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">NutriAI - {firstName}</h3>
                <p className="text-xs opacity-90">
                  {voiceProvider === 'google-male' && '👨 Voz Masculina (Google)'}
                  {voiceProvider === 'google-female' && '👩 Voz Feminina (Google)'}
                  {voiceProvider === 'elevenlabs-male' && '😊 Voz Masculina (ElevenLabs)'}
                  {voiceProvider === 'elevenlabs-female' && '😊 Voz Feminina (ElevenLabs)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-white hover:text-green-200 text-base bg-green-600 hover:bg-green-700 w-7 h-7 rounded-full flex items-center justify-center"
                  title="Histórico de conversas"
                >
                  <History className="h-4 w-4" />
                </button>
                <VoiceSettings 
                  currentVoice={voiceProvider}
                  onVoiceChange={handleVoiceChange}
                />
                <button 
                  onClick={togglePause}
                  className="text-white hover:text-green-200 text-base bg-green-600 hover:bg-green-700 w-7 h-7 rounded-full flex items-center justify-center"
                  title={isPaused ? 'Retomar conversa' : 'Pausar conversa'}
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
                <button 
                  onClick={deactivateNutriAI}
                  className="text-white hover:text-green-200 text-base bg-green-600 hover:bg-green-700 w-7 h-7 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          
          {showHistory ? (
            <ConversationHistory 
              onSelectConversation={(convId) => {
                loadConversation(convId);
                setShowHistory(false);
              }}
              onClose={() => setShowHistory(false)}
            />
          ) : (
            <div className="h-60 md:h-72 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-950">
              {messages.map((msg, index) => (
              <div key={index} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[85%] p-2 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-100 rounded-bl-none border border-green-200 dark:border-green-700'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && isRecipeMessage(msg.content) && (
                  <button
                    onClick={() => handleSaveRecipe(msg.content)}
                    className="ml-2 text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md flex items-center gap-1 mt-1 inline-flex"
                    title="Salvar esta receita"
                  >
                    <BookmarkPlus className="h-3 w-3" />
                    Salvar
                  </button>
                )}
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
              {/* ✅ INDICADOR DE STATUS */}
              {(isListening || isProcessing || isPaused || isAISpeaking || !voiceSupported) && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {isPaused && '⏸️ Conversa pausada'}
                  {!isPaused && isAISpeaking && '🔊 NutriAI falando...'}
                  {!isPaused && !isAISpeaking && isListening && '🎤 Ouvindo... Fale agora!'}
                  {!isPaused && !isAISpeaking && isProcessing && '💭 NutriAI processando...'}
                  {!isPaused && !isAISpeaking && !isProcessing && !isListening && !voiceSupported && '⌨️ Digite sua mensagem abaixo'}
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={voiceSupported ? "Digite ou fale..." : "Digite sua mensagem..."}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isProcessing || isPaused}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isProcessing || isPaused}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Enviar
              </button>
            </form>
            {!voiceSupported && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
                ⚠️ Voz indisponível neste navegador - use o campo de texto
              </p>
            )}
          </div>
        </div>
      )}

      <SaveRecipeDialog 
        open={saveRecipeDialog}
        onOpenChange={setSaveRecipeDialog}
        recipeContent={selectedRecipeContent}
      />
    </div>
  );
};

export default NutriAI;
