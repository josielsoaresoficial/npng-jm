import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface IOSInfo {
  isIOS: boolean;
  isStandalone: boolean;
  version: number | null;
  isCompatible: boolean;
}

function getIOSInfo(): IOSInfo {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check if running as standalone PWA
  const isStandalone = 
    ('standalone' in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches;
  
  // Extract iOS version
  let version: number | null = null;
  const match = ua.match(/OS (\d+)_/);
  if (match) {
    version = parseInt(match[1], 10);
  }
  
  // iOS 16.4+ required for push notifications
  const isCompatible = !isIOS || (version !== null && version >= 16 && isStandalone);
  
  return { isIOS, isStandalone, version, isCompatible };
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [iosInfo, setIosInfo] = useState<IOSInfo>({ isIOS: false, isStandalone: false, version: null, isCompatible: true });

  useEffect(() => {
    const ios = getIOSInfo();
    setIosInfo(ios);
    
    // Verificar se notificações são suportadas
    const supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    // No iOS, só suportamos se for PWA standalone e versão 16.4+
    const finalSupported = supported && ios.isCompatible;
    
    setIsSupported(finalSupported);
    
    if (finalSupported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Erro ao verificar subscrição:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notificações push não são suportadas neste navegador');
      return false;
    }

    setLoading(true);

    try {
      // Solicitar permissão
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        if (result === 'denied') {
          toast.error('Permissão negada. Veja as instruções abaixo para habilitar nas configurações do navegador.', {
            duration: 5000,
          });
        } else {
          toast.error('Permissão para notificações não concedida');
        }
        setLoading(false);
        return false;
      }

      // Registrar service worker se ainda não estiver registrado
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // VAPID public key (você deve gerar suas próprias chaves VAPID)
      // Para gerar: npx web-push generate-vapid-keys
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Criar subscrição push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Extrair dados da subscrição
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
      };

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar autenticado');
        setLoading(false);
        return false;
      }

      // Salvar subscrição no Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth,
          user_agent: navigator.userAgent,
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notificações push ativadas!');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erro ao inscrever para push:', error);
      toast.error('Erro ao ativar notificações push');
      setLoading(false);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remover do Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }

      setIsSubscribed(false);
      toast.success('Notificações push desativadas');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscrição:', error);
      toast.error('Erro ao desativar notificações push');
      setLoading(false);
      return false;
    }
  };

  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Teste de Notificação',
          body: 'Esta é uma notificação de teste do nPnG JM!',
          userId: user.id,
          data: {
            url: '/dashboard'
          }
        }
      });

      if (error) throw error;

      toast.success('Notificação de teste enviada!');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
    sendTestNotification,
    iosInfo,
  };
}