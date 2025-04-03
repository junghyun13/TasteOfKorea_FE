// public/service-worker.js
self.addEventListener('install', (event) => {
    console.log('서비스 워커 설치 중...');
    event.waitUntil(self.skipWaiting());
  });
  
  self.addEventListener('activate', (event) => {
    console.log('서비스 워커 활성화됨!');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  