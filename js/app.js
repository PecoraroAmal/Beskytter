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

document.addEventListener('DOMContentLoaded', () => {
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.disabled = true;
    installButton.addEventListener('click', () => {
      console.log('Install button clicked, userAgent:', navigator.userAgent);
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
        showMessage('To install Beskytter™, tap the Share button and select "Add to Home Screen".', 'info');
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log('Prompt outcome:', choiceResult.outcome);
          deferredPrompt = null;
        });
      } else {
        console.warn('Install prompt not available');
        showMessage('Installation is not available at this moment.', 'info');
      }
    });
  } else {
    console.error('Install button not found in DOM');
  }
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.disabled = false;
    console.log('beforeinstallprompt fired');
  } else {
    console.error('Install button not found during beforeinstallprompt');
  }
});

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