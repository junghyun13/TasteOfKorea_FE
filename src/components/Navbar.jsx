// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-orange-50 shadow-md py-2 px-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* 로고 클릭 시 홈으로 이동 */}
        <Link to="/">
          <img src="/taste.jpg" alt="Taste Logo" className="w-12 h-12 rounded-full" />
        </Link>
        {/* 앱 이름 - 갈색, 약간 더 작게 */}
        <h1 className="text-lg font-semibold text-amber-900">Taste Of Korea</h1>
      </div>
      <div className="space-x-3 text-sm">
        <Link to="/foodfind" className="text-gray-700 hover:text-blue-500">Food Finder</Link>
        <Link to="/recommend" className="text-gray-700 hover:text-blue-500">Recommend</Link>
      </div>
    </nav>
  );
};

export default Navbar;
