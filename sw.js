const CACHE_NAME = 'beskytter-cache-v1';
const urlsToCache = [
  '/Beskytter/',
  '/Beskytter/index.html?v=1',
  '/Beskytter/edit.html?v=1',
  '/Beskytter/privacy-policy.html?v=1',
  '/Beskytter/cookie-policy.html?v=1',
  '/Beskytter/info.html?v=1',
  '/Beskytter/informazioni.html?v=1',
  '/Beskytter/download.html?v=1',
  '/Beskytter/scarica.html?v=1',
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
  '/Beskytter/assets/web-app-manifest-192x192.png',
  '/Beskytter/assets/web-app-manifest-512x512.png',
  '/Beskytter/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Service Worker: Cache failed:', error))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(error => {
        console.error('Fetch failed:', error);
        return caches.match('/Beskytter/index.html');
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});