import React, { useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ 라우터 훅 추가

const foodfind = () => {
  const [file, setFile] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const navigate = useNavigate(); // ✅ 라우터 함수

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const result = await response.json();
      setFoodName(result.class);
      setConfidence(result.confidence);

      if (result.class) {
        const foodDetailsResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${result.id}`);
        if (!foodDetailsResponse.ok) {
          throw new Error('Failed to fetch food details');
        }

        const foodDetailsData = await foodDetailsResponse.json();
        setFoodDetails({ ...foodDetailsData, id: result.id }); // ✅ id 포함 저장
      }
    } catch (error) {
      setError('An error occurred during prediction');
    } finally {
      setLoading(false);
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
          {/* Removed the circular shadow div that was here */}
          
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
                <p className="text-lg text-orange-600">Confidence: {(confidence * 100).toFixed(2)}%</p>
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
                  onClick={goToDetailPage} // ✅ 이미지 클릭 시 이동
                  className="mt-4 max-w-full h-48 object-cover rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                />

                <button
                  onClick={goToDetailPage} // ✅ 버튼 클릭 시 이동
                  className="mt-4 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Food Details
                </button>
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