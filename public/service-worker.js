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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

  
  self.addEventListener('activate', (event) => {
    console.log('서비스 워커 활성화됨!');
  });
  
