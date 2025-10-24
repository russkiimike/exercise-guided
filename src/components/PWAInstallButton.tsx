import React from 'react';
import { usePWAInstall } from '../utils/pwa';

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
