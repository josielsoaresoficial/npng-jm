import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { SaveRecipeDialog } from './SaveRecipeDialog';
import VoiceTextInput from './VoiceTextInput';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Mic, MicOff, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const NutriAI = () => {
  const { 
    messages, 
    sendMessage, 
    startConversation,
    isProcessing,
    currentMood,
    isAISpeaking
  } = useChat('elevenlabs-male');
  
  const [isOpen, setIsOpen] = useState(false);
  const [saveRecipeDialog, setSaveRecipeDialog] = useState(false);
  const [selectedRecipeContent, setSelectedRecipeContent] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook de reconhecimento de voz
  const voiceRecognition = useVoiceRecognition({
    language: 'pt-BR',
    continuous: true,
    silenceTimeout: 2000,
    enabled: voiceEnabled && isOpen && !isAISpeaking && !isProcessing,
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

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Abrir/Fechar chat
  const toggleChat = async () => {
    if (!isOpen) {
      setIsOpen(true);
      if (messages.length === 0) {
        await startConversation();
      }
    } else {
      setIsOpen(false);
      setVoiceEnabled(false);
      voiceRecognition.stop();
    }
  };

  // Toggle voz
  const toggleVoice = () => {
    if (voiceEnabled) {
      setVoiceEnabled(false);
      voiceRecognition.stop();
    } else {
      setVoiceEnabled(true);
    }
  };

  // Enviar mensagem de texto
  const handleSendMessage = (text: string) => {
    sendMessage(text, false);
  };

  // Status badge
  const getStatusBadge = () => {
    if (isAISpeaking) return { text: 'Falando', variant: 'default' as const, className: 'bg-green-500' };
    if (isProcessing) return { text: 'Pensando...', variant: 'secondary' as const, className: 'bg-yellow-500' };
    if (voiceEnabled && voiceRecognition.status === 'listening') return { text: 'Ouvindo', variant: 'default' as const, className: 'bg-blue-500' };
    return { text: 'Online', variant: 'outline' as const, className: '' };
  };

  const status = getStatusBadge();

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-20 right-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3"
            >
              <Card className="w-80 shadow-xl border-border/50 bg-card">
                {/* Header */}
                <CardHeader className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">NutriAI</h3>
                        <Badge 
                          variant={status.variant} 
                          className={cn("text-[10px] px-1.5 py-0", status.className)}
                        >
                          {status.text}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={toggleVoice}
                      >
                        {voiceEnabled ? (
                          <Mic className="h-4 w-4 text-green-500" />
                        ) : (
                          <MicOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={toggleChat}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="p-0">
                  <ScrollArea className="h-72 p-3">
                    <div className="space-y-3">
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex",
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[10px] opacity-70 mt-1 block">
                              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Indicador de digitação */}
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <VoiceTextInput 
                    onSend={handleSendMessage}
                    disabled={isProcessing || isAISpeaking}
                    placeholder="Digite sua mensagem..."
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de toggle */}
        <motion.button
          onClick={toggleChat}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
            "bg-primary hover:bg-primary/90 transition-colors",
            isOpen && "bg-destructive hover:bg-destructive/90"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
        </motion.button>
      </div>

      <SaveRecipeDialog 
        open={saveRecipeDialog}
        onOpenChange={setSaveRecipeDialog}
        recipeContent={selectedRecipeContent}
      />
    </>
  );
};

export default NutriAI;
