
import { useState, useEffect } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';

// PWA Service Worker Registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('New version available! Refresh to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// PWA Install Prompt
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { installPWA, isInstallable };
};

// PWA Install Button Component
export const PWAInstallButton: React.FC = () => {
  const { installPWA, isInstallable } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installPWA}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
    >
      Install App
    </button>
  );
};

// Fullscreen Toggle Button Component
export const FullscreenToggleButton: React.FC = () => {
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed bottom-4 left-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-50"
    >
      {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>
  );
};

