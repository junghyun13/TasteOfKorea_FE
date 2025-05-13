// src/components/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 경로 감지

  // location 변경 시마다 로그인 상태 재확인
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, [location]); // 🔥 location을 의존성으로 넣어서 URL 변경 시 상태 갱신

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-orange-50 py-2 px-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Link to="/">
          <img src="/taste.jpg" alt="Taste Logo" className="w-12 h-12 rounded-full" />
        </Link>
        <h1 className="text-lg font-semibold text-amber-900">Taste Of Korea</h1>
      </div>
      <div className="space-x-3 text-sm flex items-center">
        
        {isLoggedIn ? (
          <>
            <Link to="/mypage" className="text-gray-700 hover:text-blue-500">My Page</Link>
           
          </>
        ) : (
          <Link to="/login" className="text-gray-700 hover:text-blue-500">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
