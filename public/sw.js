/**
 * Teman Siap — Service Worker (Offline-First App Shell Caching)
 * 
 * TODO: Push notifications for daily check-in reminders (out of scope for v1 — do not request Notification.permission).
 */

const CACHE_NAME = 'temansiap-shell-v1';

const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/content.js',
  '/support.js',
  '/css/tokens.css',
  '/css/base.css',
  '/css/components.css',
  '/css/screens.css',
  '/js/main.js',
  '/js/copy.js',
  '/js/store.js',
  '/js/rewards.js',
  '/js/session.js',
  '/js/screens/home.js',
  '/js/screens/emosi.js',
  '/js/screens/uang.js',
  '/js/screens/kita.js',
  '/js/screens/saya.js',
  '/js/screens/onboarding.js',
  '/js/flows/checkinFlow.js',
  '/js/flows/breathingFlow.js',
  '/js/flows/groundingFlow.js',
  '/js/flows/expenseFlow.js',
  '/js/flows/urgeFlow.js',
  '/js/flows/goalFlow.js',
  '/js/flows/planFlow.js',
  '/js/flows/coupleFlow.js',
  '/js/flows/loveMapsFlow.js',
  '/js/flows/path.js',
  '/js/flows/lessons.js',
  '/js/flows/lessonPlayer.js',
  '/js/ui/choiceTiles.js',
  '/js/ui/bodyMap.js',
  '/js/ui/breather.js',
  '/js/ui/wave.js',
  '/js/ui/keypad.js',
  '/js/ui/bottomSheet.js',
  '/js/ui/bubble.js',
  '/js/ui/utils.js',
  '/js/ui/mascot.js',
  '/js/ui/answerSheet.js',
  '/js/ui/progressBar.js',
  '/js/ui/confetti.js',
  '/js/ui/feedback.js',
  '/js/ui/toast.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_FILES);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // If requesting same origin
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Stale-while-revalidate in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        }).catch(() => {
          // If offline and navigating to a page, serve index.html app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
    );
  }
});
