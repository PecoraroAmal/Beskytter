const CACHE_NAME = 'beskytter-cache-v1';
const urlsToCache = [
  '/Beskytter/',
  '/Beskytter/index.html',
  '/Beskytter/edit.html',
  '/Beskytter/privacy-policy.html',
  '/Beskytter/cookie-policy.html',
  '/Beskytter/info.html',
  '/Beskytter/informazioni.html',
  '/Beskytter/css/style.css',
  '/Beskytter/css/policy.css',
  '/Beskytter/js/crypto.js',
  '/Beskytter/js/edit.js',
  '/Beskytter/js/home.js',
  '/Beskytter/js/info.js',
  '/Beskytter/js/app.js',
  '/Beskytter/js/utils.js',
  '/Beskytter/assets/apple-touch-icon.png',
  '/Beskytter/assets/beskytter-logo.png',
  '/Beskytter/assets/favicon-96x96.png',
  '/Beskytter/assets/favicon.ico',
  '/Beskytter/assets/favicon.svg',
  '/Beskytter/assets/site.webmanifest',
  '/Beskytter/assets/web-app-manifest-192x192.png',
  '/Beskytter/assets/web-app-manifest-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(error => console.error('Cache failed:', error))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/Beskytter/index.html'))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});