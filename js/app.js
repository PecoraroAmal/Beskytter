let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Beskytter/sw.js', { scope: '/Beskytter/' })
      .then(registration => {
        console.log('Service Worker registrato:', registration);
        registration.update();
      })
      .catch(error => {
        console.error('Registrazione Service Worker fallita:', error);
      });
    fetch('/Beskytter/manifest.json')
      .then(response => {
        if (!response.ok) throw new Error('Impossibile caricare manifest.json');
        console.log('Manifest caricato con successo');
      })
      .catch(error => console.error('Errore caricamento manifest:', error));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const installButtons = ['install-pc', 'install-android'].map(id => document.getElementById(id));
  installButtons.forEach(button => {
    if (button) {
      button.disabled = true;
      button.addEventListener('click', () => {
        console.log('Pulsante di installazione cliccato, userAgent:', navigator.userAgent);
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream) {
          showMessage('Per installare Beskytter™, tocca il pulsante Condividi e seleziona "Aggiungi alla schermata Home".', 'info');
        } else if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            console.log('Esito prompt:', choiceResult.outcome);
            deferredPrompt = null;
          });
        } else {
          console.warn('Prompt di installazione non disponibile');
          showMessage('L\'installazione non è disponibile al momento.', 'info');
        }
      });
    } else {
      console.error('Pulsante di installazione non trovato nel DOM');
    }
  });
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButtons = ['install-pc', 'install-android'].map(id => document.getElementById(id));
  installButtons.forEach(button => {
    if (button) {
      button.disabled = false;
      console.log('beforeinstallprompt attivato');
    } else {
      console.error('Pulsante di installazione non trovato durante beforeinstallprompt');
    }
  });
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installata');
});

function checkOnlineStatus() {
  if (!navigator.onLine) {
    showMessage('Offline!', 'info');
  }
}

window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);