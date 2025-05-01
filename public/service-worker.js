self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/android-chrome-192x192.png',      // public 폴더에 있는 파일 경로
        '/android-chrome-512x512.png',
        '/manifest.webmanifest'
      ]).catch((error) => {
        console.error('캐시 추가 실패:', error);
      });
    })
  );
});

// fetch event
self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] fetched resource " + e.request.url);
});

  
// activate event
self.addEventListener("activate", (e) => {
  console.log("[Service Worker] activated", e);
  
  const cacheWhitelist = ['my-cache']; // 새로운 캐시 이름

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // 오래된 캐시 삭제
          }
        })
      );
    })
  );
});
  
