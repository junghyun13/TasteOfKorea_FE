import { useState } from 'react'
//import InstallButton from './components/InstallButton'; // 추가
import './index.css';  // 이 줄을 추가해야 Tailwind가 적용됩니다.
import './App.css'
import './pages/Maintep';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // import 수정
import FoodFind from './pages/foodfind';
import Maintep from './pages/Maintep';
import Recommend from './pages/recommend';
import Navbar from './components/Navbar'; // 추가
import FoodDetail from './pages/FoodDetails';
import NaverMapPage from './components/NaverMap';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';

function App() {
  return (
    <div className="w-full h-screen bg-white text-black flex flex-col">
    
      <Router>
        <Navbar />
        <div className="flex-grow"> {/* 내부 페이지가 전체 높이에서 확장될 수 있도록 */}
          <Routes>
            <Route path="/foodfind" element={<FoodFind />} />
            <Route path="/" element={<Maintep />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/fooddetail/:id" element={<FoodDetail />} />
            <Route path="/map/:recipeId" element={<NaverMapPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}


export default App;