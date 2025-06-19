import React, { useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const foodfind = () => {
  const [file, setFile] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const [showAllergyConfirm, setShowAllergyConfirm] = useState(false);
  const [allergyIngredients, setAllergyIngredients] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setFoodName('');
    setConfidence(null);
    setFoodDetails(null);
    setShowAllergyConfirm(false);
    setAllergyIngredients([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log("Sending prediction request");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.status}`);
      }

      const result = await response.json();
      console.log("Prediction result:", result);
      setFoodName(result.class);
      setConfidence(result.confidence);

      if (result.class) {
        console.log(`Fetching details for food ID: ${result.id}`);
        const foodDetailsResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${result.id}`);
        if (!foodDetailsResponse.ok) {
          throw new Error(`Failed to fetch food details: ${foodDetailsResponse.status}`);
        }

        const foodDetailsData = await foodDetailsResponse.json();
        console.log("Food details:", foodDetailsData);
        setFoodDetails({ ...foodDetailsData, id: result.id });
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setError(`An error occurred during prediction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAllergies = async () => {
    // 이 부분을 수정: foodDetails?.id가 undefined 또는 0일 때도 처리
    if (foodDetails?.id === undefined) {
      console.log("ID가 없습니다.");
      return;
    }
    
    try {
      console.log(`Fetching allergen info for food ID: ${foodDetails.id}`);
      const allergyResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${foodDetails.id}/filter`);
      if (!allergyResponse.ok) {
        throw new Error(`Failed to fetch allergy information: ${allergyResponse.status}`);
      }
      
      const allergyData = await allergyResponse.json();
      console.log("Allergy data received:", allergyData);
      
      const ingredients = allergyData.allergyIngredients ? 
        Object.keys(allergyData.allergyIngredients).filter(key => allergyData.allergyIngredients[key] === 1) : 
        [];
      
      setAllergyIngredients(ingredients);
      
      if (ingredients.length > 0) {
        setShowAllergyConfirm(true);
      } else {
        goToDetailPage();
      }
    } catch (error) {
      console.error("Allergy check error:", error);
      setError(`An error occurred fetching allergy information: ${error.message}`);
      // 오류 발생 시에도 디테일 페이지로 이동하지 않고 오류 메시지만 표시
    }
  };

  const handleAllergyResponse = (hasAllergy) => {
    setShowAllergyConfirm(false);
    if (hasAllergy) {
      // User has allergy, navigate to recommendations
      navigate('/recommend');
    } else {
      // User doesn't have allergy, continue to food detail page
      goToDetailPage();
    }
  };

  const goToDetailPage = () => {
    const foodId = foodDetails?.id;

    // foodId가 0일 때도 정상적으로 처리되도록 수정
    if (foodId !== undefined) {
      console.log(`Navigating to: /fooddetail/${foodId}`);
      navigate(`/fooddetail/${foodId}`);
    } else {
      console.log("ID가 없습니다.");
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen p-4 sm:p-6 relative">
      <main className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 relative">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-orange-800 mb-4 text-center flex items-center justify-center">
              <Camera className="w-6 h-6 mr-2 text-orange-500" />
              Food Image Prediction
            </h1>

            <label htmlFor="file-input" className="mb-4 w-full text-orange-500 cursor-pointer">
              {file ? "Selected File: " + file.name : "Select a file"}
              <input 
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-xl shadow-md"
                />
              </div>
            )}

            {file && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full px-6 py-3 
                  bg-orange-500 text-white 
                  rounded-full 
                  hover:bg-orange-600 
                  transition-colors 
                  disabled:opacity-50 
                  flex items-center 
                  justify-center"
              >
                {loading ? 'Predicting...' : 'Predict Food'}
              </button>
            )}

            {foodName && confidence !== null && (
              <div className="mt-6 p-4 bg-orange-50 rounded-xl text-center">
                <h2 className="text-xl font-semibold text-orange-800">Predicted Food: {foodName}</h2>
                <p className="text-lg text-orange-600">Confidence: {confidence.toFixed(2)}%</p>
              </div>
            )}

            {foodDetails && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-lg text-center">
                <h3 className="text-xl font-semibold text-orange-800">Food Details</h3>
                <p className="text-lg text-orange-600">Korean Name: {foodDetails.koreanName}</p>
                <p className="text-lg text-orange-600">English Name: {foodDetails.englishName}</p>
                <p className="text-lg text-orange-600">
                  Pronunciation: {foodDetails.pronunciation}</p>
                  
                <img 
                  src={foodDetails.imageLink} 
                  alt={foodDetails.englishName} 
                  onClick={checkAllergies}
                  className="mt-4 max-w-full h-48 object-cover rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                />

                <button
                  onClick={checkAllergies}
                  className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Food Details
                </button>
              </div>
            )}

            {/* Allergy Confirmation Dialog */}
            {showAllergyConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-4 w-full">
                  <h3 className="text-xl font-bold text-orange-800 mb-4">Allergy Check</h3>
                  <p className="mb-6">
                    Do you have allergy to {allergyIngredients.length > 0 ? allergyIngredients.map((item, index) => (
                      <span key={item} className="font-bold">
                        {index === 0 ? '' : index === allergyIngredients.length - 1 ? ' or ' : ', '}
                        '{item}'
                      </span>
                    )) : "any ingredients"}?
                  </p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => handleAllergyResponse(true)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleAllergyResponse(false)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 mt-4 bg-red-50 p-2 rounded-lg text-center">
                {error}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default foodfind;