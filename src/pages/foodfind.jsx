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

  // 간단한 EXIF orientation 감지
  const getOrientation = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target.result);
        
        // JPEG 파일인지 확인
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(1);
          return;
        }
        
        let offset = 2;
        let marker;
        
        while (offset < view.byteLength) {
          marker = view.getUint16(offset, false);
          offset += 2;
          
          if (marker === 0xFFE1) {
            // EXIF 데이터 시작
            offset += 2; // 길이 건너뛰기
            
            // "Exif" 문자열 확인
            if (view.getUint32(offset, false) !== 0x45786966) {
              resolve(1);
              return;
            }
            
            offset += 6; // "Exif\0\0" 건너뛰기
            
            // 바이트 순서 확인
            const little = view.getUint16(offset, false) === 0x4949;
            offset += 2;
            
            // "42" 확인
            if (view.getUint16(offset, little) !== 0x002A) {
              resolve(1);
              return;
            }
            
            offset += 2;
            
            // IFD 오프셋
            const ifdOffset = view.getUint32(offset, little);
            offset += ifdOffset - 8;
            
            // 태그 개수
            const tags = view.getUint16(offset, little);
            offset += 2;
            
            // Orientation 태그 찾기
            for (let i = 0; i < tags; i++) {
              const tag = view.getUint16(offset + (i * 12), little);
              if (tag === 0x0112) { // Orientation 태그
                const orientation = view.getUint16(offset + (i * 12) + 8, little);
                console.log("📐 EXIF Orientation:", orientation);
                resolve(orientation);
                return;
              }
            }
          }
          
          // 다음 마커로 이동
          if ((marker & 0xFF00) !== 0xFF00) {
            break;
          }
          
          const segmentLength = view.getUint16(offset, false);
          offset += segmentLength;
        }
        
        resolve(1);
      };
      
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file);
    });
  };

  const resizeImage = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    getOrientation(file).then((orientation) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          const scale = Math.min(maxWidth / width, maxHeight / height, 1);
          width *= scale;
          height *= scale;

          // ✅ orientation 감지는 하지만, 회전은 하지 않음
          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // ✅ 회전 없이 이미지 그대로 그리기
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                reject(new Error("Canvas blob is empty"));
              }
            },
            'image/jpeg',
            0.9
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Image load failed"));
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  });
};


  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Reset states
    setError(null);
    setImagePreview(null);
    setFile(null);
    setFoodName('');
    setConfidence(null);
    setFoodDetails(null);

    try {
      // 파일 타입 검증
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error("Please select a valid image file.");
      }

      // 파일 크기 검증 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error("Image file is too large. Please select an image smaller than 10MB.");
      }

      console.log("📁 Original file:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      // 이미지 처리
      const resizedBlob = await resizeImage(selectedFile, 800, 800);

      // 최종 파일 생성
      const fileName = selectedFile.name ? 
        selectedFile.name.replace(/\.[^/.]+$/, '') + '.jpg' : 
        'upload.jpg';
      
      const finalFile = new File([resizedBlob], fileName, { type: 'image/jpeg' });

      console.log("✅ Processed file:", {
        name: finalFile.name,
        type: finalFile.type,
        size: finalFile.size
      });

      setFile(finalFile);

      // 프리뷰 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setError("Failed to create image preview.");
      };
      reader.readAsDataURL(finalFile);
      
    } catch (err) {
      console.error("❌ File processing error:", err);
      setError(`Image processing failed: ${err.message}`);
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

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log("🚀 Submitting file:", {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Prediction request failed: ${response.status} - ${errorText}`);
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
      console.error("❌ Prediction error:", error);
      setError(`Prediction failed: ${error.message}`);
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
      console.error("❌ Allergy check error:", error);
      setError(`Failed to check allergies: ${error.message}`);
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

            <label htmlFor="file-input" className="mb-4 w-full text-orange-500 cursor-pointer block">
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                {file ? (
                  <span className="text-orange-600">Selected: {file.name}</span>
                ) : (
                  <span>Click to select an image file</span>
                )}
              </div>
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
                {loading ? 'Analyzing Image...' : 'Predict Food'}
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
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">Error:</p>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default foodfind;