import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import axios from 'axios';
import qs from 'qs'; // ✅ 추가

const Recommend = () => {
  const navigate = useNavigate();

  const [allergies, setAllergies] = useState({
    egg: 0, milk: 0, buckwheat: 0, peanut: 0, soybean: 0,
    wheat: 0, fish: 0, crab: 0, shrimp: 0, pork: 0,
    peach: 0, tomato: 0, sulfites: 0, walnut: 0, chicken: 0,
    beef: 0, squid: 0, bivalvesAndAbalone: 0, pineNut: 0
  });

  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const allergyOptions = [
    { name: 'egg', label: 'Egg' }, { name: 'milk', label: 'Milk' },
    { name: 'buckwheat', label: 'Buckwheat' }, { name: 'peanut', label: 'Peanut' },
    { name: 'soybean', label: 'Soybean' }, { name: 'wheat', label: 'Wheat' },
    { name: 'fish', label: 'Fish' }, { name: 'crab', label: 'Crab' },
    { name: 'shrimp', label: 'Shrimp' }, { name: 'pork', label: 'Pork' },
    { name: 'peach', label: 'Peach' }, { name: 'tomato', label: 'Tomato' },
    { name: 'sulfites', label: 'Sulfites' }, { name: 'walnut', label: 'Walnut' },
    { name: 'chicken', label: 'Chicken' }, { name: 'beef', label: 'Beef' },
    { name: 'squid', label: 'Squid' }, { name: 'bivalvesAndAbalone', label: 'Bivalves & Abalone' },
    { name: 'pineNut', label: 'Pine Nut' }
  ];

  const handleAllergyChange = (allergyName) => {
    if (loading) return;
    setAllergies({
      ...allergies,
      [allergyName]: allergies[allergyName] === 0 ? 1 : 0
    });
  };

  const fetchFilteredFoods = async (page) => {
    setLoading(true);

    const filters = Object.entries(allergies)
      .filter(([_, value]) => value === 1)
      .map(([key]) => {
        const map = {
          egg: 1, milk: 2, buckwheat: 3, peanut: 4, soybean: 5,
          wheat: 6, fish: 7, crab: 8, shrimp: 9, pork: 10,
          peach: 11, tomato: 12, sulfites: 13, walnut: 14, chicken: 15,
          beef: 16, squid: 17, bivalvesAndAbalone: 18, pineNut: 19
        };
        return map[key] || null;
      }).filter(Boolean);

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/filter`, {
        params: {
          filter: filters,
          page: page,
          size: 10,
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }) // ✅ 수정 핵심
      });

      setFilteredFoods(response.data.recipeDtoList);
    } catch (error) {
      console.error('Error fetching filtered foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchFilteredFoods(1);
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchFilteredFoods(nextPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchFilteredFoods(prevPage);
    }
  };

  const goToDetailPage = (foodId) => {
    if (foodId !== undefined && foodId !== null) {
      navigate(`/fooddetail/${foodId}`);
    }
  };

  const FoodCard = ({ food }) => (
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
        <h1 className="text-4xl font-bold text-orange-800 mb-8">Filter Korean Food by Allergies</h1>

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
                <label htmlFor={allergy.name} className={`text-orange-800 ${loading ? 'opacity-50' : ''}`}>
                  {allergy.label}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 text-white font-semibold rounded-lg transition-colors w-full ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
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
              <div className="flex justify-between mt-6 gap-x-4">
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1 || loading}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex-1"
  >
    Previous
  </button>
  <button
    onClick={handleNextPage}
    disabled={loading}
    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex-1"
  >
    Next
  </button>
</div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommend;
