import { useEffect, useState } from 'react';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // 자동 설치 배너 막기
      setDeferredPrompt(e); // 저장해두고 나중에 사용
      setShowInstall(true); // 버튼 표시
      console.log('beforeinstallprompt 이벤트 발생'); // 이벤트 발생 여부 확인
    };
  
    window.addEventListener('beforeinstallprompt', handler);
  
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);
  

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // 설치 요청
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('✅ 설치 완료!');
        } else {
          console.log('❌ 설치 취소');
        }
        setDeferredPrompt(null);
        setShowInstall(false);
      });
    }
  };

  return showInstall ? (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 px-2 py-1 text-sm bg-blue-600 text-white rounded shadow"
    >
      앱 설치
    </button>
  ) : null;
  
};

export default InstallButton;
