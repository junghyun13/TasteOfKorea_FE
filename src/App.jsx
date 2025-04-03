import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css';  // 이 줄을 추가해야 Tailwind가 적용됩니다.
import './App.css'
import './pages/Maintep';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // import 수정
import FoodFind from './pages/foodfind';
import Maintep from './pages/Maintep';
import Recommend from './pages/recommend';


const App = () => {
  return (
    <Router>  {/* Router로 전체 애플리케이션을 감싸줍니다 */}
      <Routes>  {/* Routes로 경로들을 설정 */}
        <Route path="/foodfind" element={<FoodFind />} />  {/* '/' 경로에서 FoodFind 컴포넌트를 표시 */}
        <Route path="/" element={<Maintep />} />  {/* '/' 경로에서 FoodFind 컴포넌트를 표시 */}
        <Route path="/recommend" element={<Recommend />} /> 
      </Routes>
    </Router>
  );
};

export default App;