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

const App = () => {
  return (
    <>
      <InstallButton /> {/* 여기에 설치 버튼 삽입 */}
      <Router>  {/* Router로 전체 애플리케이션을 감싸줍니다 */}
        <Navbar />  {/* 모든 페이지에 공통으로 보이는 Navbar */}
        <Routes>  {/* Routes로 경로들을 설정 */}
          <Route path="/foodfind" element={<FoodFind />} />
          <Route path="/" element={<Maintep />} />
          <Route path="/recommend" element={<Recommend />} />
        </Routes>
      </Router>
    </>
  );
};


export default App;