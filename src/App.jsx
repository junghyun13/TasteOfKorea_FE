import { useState } from 'react'
import InstallButton from './components/InstallButton'; // 추가
import './index.css';  // 이 줄을 추가해야 Tailwind가 적용됩니다.
import './App.css'
import './pages/Maintep';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // import 수정
import FoodFind from './pages/foodfind';
import Maintep from './pages/Maintep';
import Recommend from './pages/recommend';
import Navbar from './components/Navbar'; // 추가
import FoodDetail from './pages/FoodDetails';

function App() {
  return (
    <div className="w-full h-screen bg-white text-black flex flex-col">
      <InstallButton />
      <Router>
        <Navbar />
        <div className="flex-grow"> {/* 내부 페이지가 전체 높이에서 확장될 수 있도록 */}
          <Routes>
            <Route path="/foodfind" element={<FoodFind />} />
            <Route path="/" element={<Maintep />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/fooddetail/:id" element={<FoodDetail />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}


export default App;