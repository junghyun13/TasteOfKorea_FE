// src/serviceWorkerRegistration.js

// 서비스 워커 등록 함수
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 서비스 워커 파일 경로
      const swUrl = '/service-worker.js'; // public 폴더에 있는 service-worker.js는 루트 경로에서 접근

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('서비스 워커 등록 성공:', registration);
        })
        .catch((error) => {
          console.log('서비스 워커 등록 실패:', error);
        });
    });
  }
}

// 서비스 워커 등록 해제 함수
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
