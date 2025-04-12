self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/taste.jpg',      // public 폴더에 있는 파일 경로
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
  console.log("[Service Worker] actived", e);
});
  
