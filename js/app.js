let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(registration => {
        console.log('Service Worker registered:', registration);
        registration.update();
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.disabled = false;
    installButton.addEventListener('click', () => {
      console.log('Install button clicked');
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        showMessage('To install Beskytter™, tap the Share button and select "Add to Home Screen".', 'info');
      } else {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        });
      }
    });
  } else {
    console.warn('Install button not found');
  }
});

const installButton = document.getElementById('install-button');
if (installButton) {
  installButton.disabled = true;
}

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
});

function checkOnlineStatus() {
  if (!navigator.onLine) {
    showMessage('You are offline. Please upload a JSON file to view or edit data.', 'info');
  }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);