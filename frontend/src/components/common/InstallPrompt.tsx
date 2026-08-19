import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const _isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);

    if (_isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    const hasDismissed = localStorage.getItem('installPromptDismissed');
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        // We only show the prompt if the browser fired beforeinstallprompt
        // (meaning it's installable and not already installed).
        setShowPrompt(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback if they click install but prompt isn't ready
      // (On iOS this does nothing, on Android it might do nothing if not ready)
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  // Only render if it's supposed to show AND deferredPrompt exists (meaning it's actually installable)
  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-white border border-[#E8E8E8] shadow-xl rounded-2xl p-4 z-[9999] animate-fade-in flex items-start gap-3">
      <div className="bg-[#0f766e] text-white p-2 rounded-xl shrink-0">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-[14px] font-bold text-[#1C1C1C]">Install Servora App</h3>
        <p className="text-[12px] text-[#525252] mt-0.5 mb-3 leading-snug">
          Install the app on your device for a faster, app-like experience.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 py-1.5 bg-[#0f766e] hover:bg-[#0d645e] text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            Install
          </button>
        </div>
      </div>
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-[#A0A0A0] hover:text-[#1C1C1C]"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
