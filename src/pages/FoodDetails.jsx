import React, { useState, useEffect } from 'react';
import { ChevronLeft, Utensils, FileText, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ useNavigate 추가

const FoodDetails = ({ match }) => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ navigate 훅 추가

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    console.log('Food ID:', id); // 로그로 확인
    const fetchFoodDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch food details');
        }

        const data = await response.json();
        setFood(data);
      } catch (err) {
        setError('Failed to load food details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFoodDetails();
    }
  }, [id]);

  const renderRating = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-yellow-500 text-xl ${i < rating ? '' : 'opacity-50'}`}
        >
          {i < rating ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };



  if (loading) {
    return (
      <div className="bg-orange-50 min-h-screen flex justify-center items-center">
        <div className="text-orange-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="bg-orange-50 min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-xl">
          {error || 'Food details not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 min-h-screen p-4 sm:p-6">
      

      <main className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Image Banner */}
          <div className="w-full h-64 relative">
            <img
              src={food.imageLink}
              alt={food.englishName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h1 className="text-2xl font-bold text-white">
                {food.pronunciation}
              </h1>
              <p className="text-white text-sm">
                {food.koreanName} / {food.englishName}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-orange-200">
            {['description', 'howToEat', 'recipe', 'map'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center font-medium ${activeTab === tab
                  ? 'text-orange-600 border-b-2 border-orange-500'
                  : 'text-gray-500'
                  }`}
              >
                {tab === 'description' && 'Description'}
                {tab === 'howToEat' && <><Utensils className="w-4 h-4 inline mr-1" />How to Eat</>}
                {tab === 'recipe' && <><FileText className="w-4 h-4 inline mr-1" />Recipe</>}
                {tab === 'map' && <><MapPin className="w-4 h-4 inline mr-1" />Map</>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h2 className="text-xl font-semibold text-orange-800 mb-4">About this dish</h2>
                <p className="text-gray-700 mb-4">{food.information || 'No information available.'}</p>

                <div className="bg-orange-50 p-4 rounded-xl mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-orange-700">Korean Name:</span>
                    <span className="font-medium">{food.koreanName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-orange-700">English Name:</span>
                    <span className="font-medium">{food.englishName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-orange-700">Pronunciation:</span>
                    <span className="font-medium">{food.pronunciation}</span>
                  </div>
              

                  {food.category === 'meat' && (
                    <div className="bg-red-50 p-2 rounded-lg text-red-600 text-center mt-2">
                      ⚠️ Not suitable for vegans
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Flavor Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['spicy', 'sour', 'salty', 'oily'].map((flavor) => (
                      <div className="flex items-center" key={flavor}>
                        <span className="text-orange-700 mr-2 capitalize">{flavor}:</span>
                        <div>{renderRating(food[flavor])}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'howToEat' && (
              <div>
                <h2 className="text-xl font-semibold text-orange-800 mb-4">How to Eat {food.pronunciation}</h2>
                {food.eatLink ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={food.eatLink}
                      title={`How to eat ${food.englishName}`}
                      className="w-full h-64 rounded-xl"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-orange-50 rounded-xl">
                    <p className="text-orange-600">No eating guide video available for this dish.</p>
                  </div>
                )}
                <div className="mt-4 text-gray-700">
                  <p>{food.howToEatText || 'No specific eating instructions are available for this dish.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'recipe' && (
              <div>
                <h2 className="text-xl font-semibold text-orange-800 mb-4">Recipe for {food.pronunciation}</h2>
                {food.recipeLink ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={food.recipeLink}
                      title={`Recipe for ${food.englishName}`}
                      className="w-full h-64 rounded-xl"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-orange-50 rounded-xl">
                    <p className="text-orange-600">No recipe video available for this dish.</p>
                  </div>
                )}
                <div className="mt-4 text-gray-700">
                  <p>{food.recipeText || 'No recipe instructions are available for this dish.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div>
                <h2 className="text-xl font-semibold text-orange-800 mb-4">Find {food.pronunciation} Restaurants</h2>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(food.englishName + ' restaurants')}`}
                    title={`${food.englishName} restaurants map`}
                    className="w-full h-64 rounded-xl"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(food.englishName + ' restaurants')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};


export default FoodDetails;