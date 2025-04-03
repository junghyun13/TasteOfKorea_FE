import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Droplet, Settings, Pizza, Leaf } from 'lucide-react';  // 관련 아이콘들 임포트
import axios from 'axios';

const Recommend = () => {
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    spicy: 4,
    sour: 2,
    salty: 2,
    oily: 1,
    bigun: 1, // 비건 여부
  });

  const [recommendedFoods, setRecommendedFoods] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: parseInt(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 동적 URL로 API 요청
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/recommend`, preferences);
      console.log('Recommended foods:', response.data);
      setRecommendedFoods(response.data);  // 추천된 음식 데이터 저장
    } catch (error) {
      console.error('Error fetching recommended foods:', error);
    }
  };

  const FoodCard = ({ food }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
        <img src={food.imgLink} alt={food.koreanName} className="w-full h-48 object-cover rounded-md" />
        <h3 className="text-xl font-semibold text-orange-800">{food.romanizedName}</h3>
        <p className="text-gray-600">{food.englishName}</p>
        <p className="text-sm text-gray-500">Calories: {food.calories}</p>
        <p className="text-sm text-gray-500">Made with: {food.madeWith}</p> {/* madeWith 항목 추가 */}
        {food.recipeLink && (
          <a href={food.recipeLink} target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">
            Recipe
          </a>
        )}
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-800 mb-8">
          Recommend Korean Food
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold text-orange-800 mb-4">Select Your Preferences</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Flame size={24} className="text-red-600" />
              <label htmlFor="spicy" className="text-lg text-orange-800">Spicy</label>
              <input
                type="range"
                id="spicy"
                name="spicy"
                min="1"
                max="5"
                value={preferences.spicy}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{preferences.spicy}</span>
            </div>

            <div className="flex justify-between items-center">
              <Droplet size={24} className="text-blue-600" />
              <label htmlFor="sour" className="text-lg text-orange-800">Sour</label>
              <input
                type="range"
                id="sour"
                name="sour"
                min="1"
                max="5"
                value={preferences.sour}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{preferences.sour}</span>
            </div>

            <div className="flex justify-between items-center">
              <Droplet size={24} className="text-gray-600" />
              <label htmlFor="salty" className="text-lg text-orange-800">Salty</label>
              <input
                type="range"
                id="salty"
                name="salty"
                min="1"
                max="5"
                value={preferences.salty}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{preferences.salty}</span>
            </div>

            <div className="flex justify-between items-center">
              <Pizza size={24} className="text-yellow-600" />
              <label htmlFor="oily" className="text-lg text-orange-800">Oily</label>
              <input
                type="range"
                id="oily"
                name="oily"
                min="1"
                max="5"
                value={preferences.oily}
                onChange={handleInputChange}
                className="w-full"
              />
              <span>{preferences.oily}</span>
            </div>

            <div className="flex justify-between items-center">
              <Leaf size={24} className="text-green-600" />
              <label htmlFor="bigun" className="text-lg text-orange-800">Vegan</label>
              <input
                type="checkbox"
                id="bigun"
                name="bigun"
                checked={preferences.bigun === 1}
                onChange={() => setPreferences({ ...preferences, bigun: preferences.bigun === 1 ? 0 : 1 })}
                className="w-6 h-6"
              />
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
            >
              Get Recommendations
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {recommendedFoods.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          )}
        </div>

        {/* 뒤로 가는 버튼 */}
        <div className="flex items-center justify-center space-x-2 mt-6 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <Flame size={48} className="text-orange-600" />
        </div>
      </div>
    </div>
  );
};

export default Recommend;
