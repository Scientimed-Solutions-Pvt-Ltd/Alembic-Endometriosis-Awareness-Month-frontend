import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');

    // Check if user has dismissed the prompt before
    const hasUserDismissedPrompt = localStorage.getItem('installPromptDismissed') === 'true';

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Detect mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    setIsIOS(iOS);
    setIsMobile(mobile);

    // Only show prompt if not installed, not dismissed, and on mobile
    if (!isStandalone && !hasUserDismissedPrompt && mobile) {
      // For iOS Safari, show custom prompt after a short delay
      if (iOS) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000); // Show after 2 seconds
        return () => clearTimeout(timer);
      }
    }

    // For Chrome/Android - listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      if (!hasUserDismissedPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    // For Chrome/Android
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t-2 border-purple-600 animate-slide-up">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img src="/icon.png" alt="App icon" className="w-12 h-12 rounded-lg shadow" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install EAM App
            </h3>
            
            {isIOS ? (
              <div className="text-sm text-gray-600 space-y-2">
                <p>Install this app on your iPhone:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tap the <span className="inline-flex items-center"><svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg></span> Share button</li>
                  <li>Scroll and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Add to your home screen for quick access and a better experience!
              </p>
            )}
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {!isIOS && deferredPrompt && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
