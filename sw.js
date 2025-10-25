// sw.js
const CACHE_NAME = 'beskytter-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/edit.html',
  '/privacy-policy.html',
  '/cookie-policy.html',
  '/info.html',
  '/informazioni.html',
  '/css/style.css',
  '/css/policy.css',
  '/js/crypto.js',
  '/js/edit.js',
  '/js/home.js',
  '/js/info.js',
  '/js/app.js',
  '/js/utils.js',
  '/assets/apple-touch-icon.png',
  '/assets/beskytter-logo.png',
  '/assets/favicon-96x96.png',
  '/assets/favicon.ico',
  '/assets/favicon.svg',
  '/assets/web-app-manifest-192x192.png',
  '/assets/web-app-manifest-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/index.html');
      })
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