import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader } from 'lucide-react';  // Added Loader icon
import axios from 'axios';

const Recommend = () => {
  const navigate = useNavigate();

  const [allergies, setAllergies] = useState({
    egg: 0,
    milk: 0,
    buckwheat: 0,
    peanut: 0,
    soybean: 0,
    wheat: 0,
    fish: 0,
    crab: 0,
    shrimp: 0,
    pork: 0,
    peach: 0,
    tomato: 0,
    sulfites: 0,
    walnut: 0,
    chicken: 0,
    beef: 0,
    squid: 0,
    bivalvesAndAbalone: 0,
    pineNut: 0
  });

  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAllergyChange = (allergyName) => {
    if (loading) return; // Prevent changes while loading
    
    setAllergies({
      ...allergies,
      [allergyName]: allergies[allergyName] === 0 ? 1 : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/filter`, allergies);
      console.log('Filtered foods:', response.data);
      setFilteredFoods(response.data);
    } catch (error) {
      console.error('Error fetching filtered foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToDetailPage = (foodId) => {
    if (foodId !== undefined && foodId !== null) {
      console.log(`Navigating to: /fooddetail/${foodId}`);
      navigate(`/fooddetail/${foodId}`);
    } else {
      console.log("ID가 없습니다.");
    }
  };
  
  const FoodCard = ({ food }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
        <img
          src={food.imageLink}
          alt={food.koreanName}
          className="w-full h-48 object-cover rounded-md cursor-pointer"
          onClick={() => goToDetailPage(food.id)}
        />
        <h3 className="text-xl font-semibold text-orange-800">{food.koreanName}</h3>
        <p className="text-gray-600">{food.englishName}</p>
        <p className="text-sm text-gray-500">Pronunciation: {food.pronunciation}</p>
        <button
          onClick={() => goToDetailPage(food.id)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          View Details
        </button>
      </div>
    );
  };

  const allergyOptions = [
    { name: 'egg', label: 'Egg' },
    { name: 'milk', label: 'Milk' },
    { name: 'buckwheat', label: 'Buckwheat' },
    { name: 'peanut', label: 'Peanut' },
    { name: 'soybean', label: 'Soybean' },
    { name: 'wheat', label: 'Wheat' },
    { name: 'fish', label: 'Fish' },
    { name: 'crab', label: 'Crab' },
    { name: 'shrimp', label: 'Shrimp' },
    { name: 'pork', label: 'Pork' },
    { name: 'peach', label: 'Peach' },
    { name: 'tomato', label: 'Tomato' },
    { name: 'sulfites', label: 'Sulfites' },
    { name: 'walnut', label: 'Walnut' },
    { name: 'chicken', label: 'Chicken' },
    { name: 'beef', label: 'Beef' },
    { name: 'squid', label: 'Squid' },
    { name: 'bivalvesAndAbalone', label: 'Bivalves & Abalone' },
    { name: 'pineNut', label: 'Pine Nut' }
  ];

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-orange-50 p-8 rounded-lg shadow-xl flex flex-col items-center">
            <Loader className="h-12 w-12 text-orange-600 animate-spin mb-4" />
            <p className="text-3xl font-bold text-orange-600">Loading...</p>
            <p className="text-lg text-orange-600 mt-2">Please wait while we find your food recommendations</p>
          </div>
        </div>
      )}
      
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-800 mb-8">
          Filter Korean Food by Allergies
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-orange-100 bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
              <p className="text-3xl font-bold text-orange-600">Loading...</p>
            </div>
          )}
          
          <h2 className="text-2xl font-semibold text-orange-800 mb-4">Select Your Allergies</h2>
          <p className="text-gray-600 mb-4">Please check any ingredients you're allergic to:</p>

          <div className="grid grid-cols-2 gap-3">
            {allergyOptions.map((allergy) => (
              <div key={allergy.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={allergy.name}
                  checked={allergies[allergy.name] === 1}
                  onChange={() => handleAllergyChange(allergy.name)}
                  className="w-5 h-5"
                  disabled={loading}
                />
                <label 
                  htmlFor={allergy.name} 
                  className={`text-orange-800 ${loading ? 'opacity-50' : ''}`}
                >
                  {allergy.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors w-full ${
                loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {loading ? 'Searching...' : 'Find Korean Food Results'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {filteredFoods.length > 0 && !loading && (
            <>
              <h2 className="text-2xl font-semibold text-orange-800 mb-4">Recommended Korean Foods</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredFoods.map((food, index) => (
                  <FoodCard key={index} food={food} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommend;