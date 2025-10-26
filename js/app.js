let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Beskytter/sw.js', { scope: '/Beskytter/' })
      .then(registration => {
        console.log('Service Worker registered:', registration);
        registration.update();
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
    fetch('/Beskytter/manifest.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load manifest.json');
        console.log('Manifest loaded successfully');
      })
      .catch(error => console.error('Manifest load error:', error));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.disabled = true;
    installButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Install button clicked, userAgent:', navigator.userAgent);
      
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS) {
        showMessage('To install Beskytter™, tap the Share button and select "Add to Home Screen".', 'info');
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log('Prompt outcome:', choiceResult.outcome);
          if (choiceResult.outcome === 'accepted') {
            showMessage('Beskytter™ installed successfully!', 'success');
          } else {
            showMessage('Installation cancelled.', 'info');
          }
          deferredPrompt = null;
        });
      } else {
        console.warn('Install prompt not available - showing manual instructions');
        let manualMsg = 'Installation prompt not ready yet. ';
        if (isAndroid) {
          manualMsg += 'On Android: Open the browser menu (3 dots) > "Add to Home screen" or "Install app". ';
        }
        manualMsg += 'Refresh the page and try again, or check if you\'re on HTTPS.';
        showMessage(manualMsg, 'info');
      }
    });

    setTimeout(() => {
      installButton.disabled = false;
      console.log('Install button enabled for manual trigger');
    }, 2000);
  } else {
    console.error('Install button not found in DOM');
  }
});

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt fired - prompt available');
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.disabled = false;
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  showMessage('Beskytter™ installed and ready!', 'success');
});

function checkOnlineStatus() {
  if (!navigator.onLine) {
    showMessage('You are offline. Please upload a JSON file to view or edit data.', 'info');
  }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);