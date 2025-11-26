import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    console.log('🔧 PWA Install Prompt: Inicializado');

    // Verificar se já foi instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    
    console.log('✅ App instalado?', isStandalone);
    console.log('❌ Prompt foi dispensado antes?', hasBeenDismissed);

    if (isStandalone) {
      console.log('⏭️ App já instalado, não mostrando prompt');
      return;
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('🎉 Evento beforeinstallprompt capturado!');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Mostrar prompt após 2 segundos
    const timer = setTimeout(() => {
      console.log('⏰ 2 segundos passados, mostrando prompt...');
      setShowPrompt(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('🎯 Botão de instalação clicado');
    
    if (deferredPrompt) {
      console.log('✨ Tentando instalação automática...');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📊 Resultado da instalação:', outcome);
        
        if (outcome === 'accepted') {
          console.log('✅ Usuário aceitou a instalação');
        }
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Erro na instalação automática:', error);
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    } else {
      console.log('⚠️ Instalação automática não disponível neste navegador');
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    console.log('❌ Usuário dispensou o prompt');
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };


  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/20 animate-in slide-in-from-top duration-500">
        <div className="relative p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <img src="/icon-192x192.png" alt="nPnG JM" className="w-16 h-16 rounded-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Instale o nPnG JM
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tenha acesso rápido e offline ao seu personal trainer com IA!
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  Acesso instantâneo da tela inicial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  Funciona offline
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  Notificações de treino
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  Experiência como app nativo
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Agora não
              </Button>
              <Button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
