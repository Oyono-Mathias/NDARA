import { useState, useEffect, useCallback } from 'react';

// Interface definition for the BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type ConnectionStatus = 'online' | 'offline';

export type InstallStatus =
  | 'installation_unavailable'
  | 'installable'
  | 'installation_in_progress'
  | 'installation_success'
  | 'installation_dismissed'
  | 'installed';

export const usePWA = () => {
  // Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // PWA Install State
  const [installStatus, setInstallStatus] = useState<InstallStatus>('installation_unavailable');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Connectivity Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Re-check just in case it changed between initial render and effect execution
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install Listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallStatus('installable');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstallStatus('installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed (standalone mode)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setInstallStatus('installed');
    } else if (
      // For iOS Safari (which doesn't support beforeinstallprompt currently)
      'standalone' in navigator && (navigator as any).standalone === true
    ) {
      setInstallStatus('installed');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    setInstallStatus('installation_in_progress');
    
    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallStatus('installation_success');
      } else {
        setInstallStatus('installation_dismissed');
      }
      
      // We've used the prompt, and can't use it again until it's fired.
      setDeferredPrompt(null);
    } catch (error) {
      // If it fails (e.g., prompt already handled), revert
      setInstallStatus('installable');
      console.error("Erreur lors de l'installation de la PWA:", error);
    }
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setDeferredPrompt(null);
    setInstallStatus('installation_dismissed');
  }, []);

  const retryConnection = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    connectionStatus: (isOnline ? 'online' : 'offline') as ConnectionStatus,
    installStatus,
    isInstallable: installStatus === 'installable',
    isInstalled: installStatus === 'installed' || installStatus === 'installation_success',
    canInstall: deferredPrompt !== null,
    installPWA,
    dismissInstallPrompt,
    retryConnection
  };
};
