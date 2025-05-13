// src/pages/MyPage.jsx
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem('authToken'); // 토큰 삭제
  alert('로그아웃 되었습니다.');
  navigate('/');
  window.location.reload(); // 👈 강제로 새로고침해서 Navbar 리렌더링 유도
};


  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">마이페이지입니다.</h2>
      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    </div>
  );
};

export default MyPage;
