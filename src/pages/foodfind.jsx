import React, { useState } from 'react';
import { Camera } from 'lucide-react';
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

  const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // ✅ 비율 유지하며 리사이즈
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // ✅ toBlob 시도 → 실패 시 toDataURL + fetch fallback
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log("✅ toBlob 성공");
          resolve(blob);
        } else {
          console.warn("⚠️ toBlob 실패, toDataURL로 fallback 시도");
          try {
            const dataURL = canvas.toDataURL(file.type);
            const fetchedBlob = await fetch(dataURL).then(res => res.blob());
            console.log("✅ toDataURL fallback 성공");
            resolve(fetchedBlob);
          } catch (fallbackErr) {
            console.error("❌ toDataURL fallback 실패", fallbackErr);
            reject(new Error("이미지를 처리할 수 없습니다. 다른 이미지를 선택하거나 저장 후 다시 시도해 주세요."));
          }
        }
      }, file.type);
    };

    reader.onerror = (e) => {
      console.error("❌ FileReader 오류", e);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };

    reader.readAsDataURL(file);
  });
};


  const handleFileChange = async (event) => {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  try {
    const resizedBlob = await resizeImage(selectedFile, 800, 800);

    // ✅ 강제 MIME 타입 지정
    const fixedType = 'image/jpeg';

    // ✅ File 대신 Blob 그대로 전송 (MIME 문제 회피)
    const finalFile = new File([resizedBlob], selectedFile.name || 'upload.jpg', { type: fixedType });

    setFile(finalFile);

    // ✅ preview 처리
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(finalFile);
  } catch (err) {
    console.error("이미지 처리 중 오류:", err);
    setError("이미지 처리 중 오류가 발생했습니다. 카카오톡이나 갤러리에서 다시 저장 후 시도해 주세요.");
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
    const text = await response.text();  // 상세 에러 받아보기
    throw new Error(`Failed to get prediction: ${response.status} - ${text}`);
  }

      const result = await response.json();
      setFoodName(result.class);
      setConfidence(result.confidence);

      if (result.class) {
        const foodDetailsResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${result.id}`);
        if (!foodDetailsResponse.ok) {
          throw new Error(`Failed to fetch food details: ${foodDetailsResponse.status}`);
        }

        const foodDetailsData = await foodDetailsResponse.json();
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
    if (foodDetails?.id === undefined) {
      return;
    }

    try {
      const allergyResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${foodDetails.id}/filter`);
      if (!allergyResponse.ok) {
        throw new Error(`Failed to fetch allergy information: ${allergyResponse.status}`);
      }

      const allergyData = await allergyResponse.json();
      const ingredients = allergyData.allergyIngredients ?
        Object.keys(allergyData.allergyIngredients).filter(key => allergyData.allergyIngredients[key] === 1) : [];

      setAllergyIngredients(ingredients);

      if (ingredients.length > 0) {
        setShowAllergyConfirm(true);
      } else {
        goToDetailPage();
      }
    } catch (error) {
      console.error("Allergy check error:", error);
      setError(`An error occurred fetching allergy information: ${error.message}`);
    }
  };

  const handleAllergyResponse = (hasAllergy) => {
    setShowAllergyConfirm(false);
    if (hasAllergy) {
      navigate('/recommend');
    } else {
      goToDetailPage();
    }
  };

  const goToDetailPage = () => {
    const foodId = foodDetails?.id;
    if (foodId !== undefined) {
      navigate(`/fooddetail/${foodId}`);
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
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
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
                <p className="text-lg text-orange-600">Pronunciation: {foodDetails.pronunciation}</p>
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

            {showAllergyConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-4 w-full">
                  <h3 className="text-xl font-bold text-orange-800 mb-4">Allergy Check</h3>
                  <p className="mb-6">
                    Do you have allergy to{" "}
                    {allergyIngredients.length > 0
                      ? allergyIngredients.map((item, index) => (
                          <span key={item} className="font-bold">
                            {index === 0
                              ? ""
                              : index === allergyIngredients.length - 1
                              ? " or "
                              : ", "}
                            '{item}'
                          </span>
                        ))
                      : "any ingredients"}
                    ?
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
