/* Healthbridge Rx – Service Worker v3
   Caches the full app for offline use on Android.
   Update CACHE_VERSION when pushing a new release. */

var CACHE_VERSION = 'hb-rx-v3';
var BASE = '/healthbridge-scripts';
var ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-72x72.png',
  BASE + '/icons/icon-96x96.png',
  BASE + '/icons/icon-128x128.png',
  BASE + '/icons/icon-144x144.png',
  BASE + '/icons/icon-152x152.png',
  BASE + '/icons/icon-192x192.png',
  BASE + '/icons/icon-384x384.png',
  BASE + '/icons/icon-512x512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k)   { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (response) {
        if (e.request.method === 'GET' && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(BASE + '/index.html');
      });
    })
  );
});
