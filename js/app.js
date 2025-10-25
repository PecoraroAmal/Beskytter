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
  console.log('beforeinstallprompt fired');
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.createElement('button');
  installButton.id = 'install-button';
  installButton.className = 'btn btn-primary';
  installButton.innerHTML = '<i class="fas fa-download"></i> Install Beskytter™';
  installButton.style.margin = '20px auto';
  installButton.style.display = 'block';
  const container = document.querySelector('.main-content .container') || document.body;
  container.appendChild(installButton);
  console.log('Install button added to:', container === document.body ? 'body' : '.main-content .container');

  installButton.addEventListener('click', () => {
    console.log('Install button clicked');
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      installButton.remove();
    });
  });
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
  const installButton = document.getElementById('install-button');
  if (installButton) installButton.remove();
});

function checkOnlineStatus() {
  if (!navigator.onLine) {
    showMessage('You are offline. Please upload a JSON file to view or edit data.', 'info');
  }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);