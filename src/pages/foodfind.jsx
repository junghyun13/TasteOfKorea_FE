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

  // Fix EXIF orientation issues
  const getOrientation = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(-2);
        }
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          if (view.getUint16(offset + 2, false) <= 8) resolve(-1);
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              resolve(-1);
            }
            const little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                resolve(view.getUint16(offset + (i * 12) + 8, little));
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(-1);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const resetTransform = (ctx, width, height, orientation) => {
    switch (orientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        break;
    }
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
            let { width, height } = img;

            // Handle orientation for canvas size
            if (orientation > 4 && orientation < 9) {
              [width, height] = [height, width];
            }

            // Calculate resize dimensions
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
            
            // Apply orientation transformation
            if (orientation > 1) {
              resetTransform(ctx, width, height, orientation);
            }
            
            ctx.drawImage(img, 0, 0, width, height);

            // Method 1: Try toBlob with JPEG
            canvas.toBlob((blob) => {
              if (blob && blob.size > 0) {
                console.log("✅ toBlob with JPEG successful");
                resolve(blob);
              } else {
                // Method 2: Try toBlob with PNG
                canvas.toBlob((blob) => {
                  if (blob && blob.size > 0) {
                    console.log("✅ toBlob with PNG successful");
                    resolve(blob);
                  } else {
                    // Method 3: DataURL fallback
                    console.warn("⚠️ toBlob failed, trying dataURL fallback");
                    try {
                      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                      if (!dataURL || dataURL === 'data:,') {
                        throw new Error("DataURL generation failed");
                      }
                      fetch(dataURL)
                        .then(res => res.blob())
                        .then(blob => {
                          if (blob.size === 0) {
                            throw new Error("DataURL fallback produced empty blob");
                          }
                          console.log("✅ DataURL fallback successful");
                          resolve(blob);
                        })
                        .catch(() => {
                          // Method 4: Manual blob creation
                          console.warn("⚠️ DataURL failed, trying manual blob creation");
                          const imageData = ctx.getImageData(0, 0, width, height);
                          const tempCanvas = document.createElement("canvas");
                          tempCanvas.width = width;
                          tempCanvas.height = height;
                          const tempCtx = tempCanvas.getContext("2d");
                          tempCtx.putImageData(imageData, 0, 0);
                          
                          tempCanvas.toBlob((blob) => {
                            if (blob && blob.size > 0) {
                              console.log("✅ Manual blob creation successful");
                              resolve(blob);
                            } else {
                              reject(new Error("All image processing methods failed"));
                            }
                          }, 'image/jpeg', 0.8);
                        });
                    } catch (dataURLError) {
                      reject(new Error("Failed to process image. Please try saving the image to your device first and then upload it again."));
                    }
                  }
                }, 'image/png');
              }
            }, 'image/jpeg', 0.9);
            
          } catch (canvasError) {
            console.error("❌ Canvas processing error:", canvasError);
            reject(new Error("Failed to process image. Please try saving the image to your device first and then upload it again."));
          }
        };

        img.onerror = (imgError) => {
          console.error("❌ Image load error:", imgError);
          reject(new Error("Failed to load image. Please check if the image file is valid."));
        };

        reader.onerror = (readerError) => {
          console.error("❌ FileReader error:", readerError);
          reject(new Error("Failed to read image file. Please try selecting the image again."));
        };

        reader.readAsDataURL(file);
      }).catch(error => {
        console.error("❌ Orientation detection error:", error);
        reject(new Error("Image processing failed. Please try with a different image."));
      });
    });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Reset previous states
    setError(null);
    setImagePreview(null);
    setFile(null);

    try {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        throw new Error("Please select a valid image file.");
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error("Image file is too large. Please select an image smaller than 10MB.");
      }

      console.log("📁 Original file:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      const resizedBlob = await resizeImage(selectedFile, 800, 800);

      // Determine MIME type - force JPEG for better compatibility
      const mimeType = 'image/jpeg';
      
      // Create final file with consistent naming
      const fileName = selectedFile.name ? 
        selectedFile.name.replace(/\.[^/.]+$/, '') + '.jpg' : 
        'upload.jpg';
      
      const finalFile = new File([resizedBlob], fileName, { type: mimeType });

      console.log("✅ Processed file:", {
        name: finalFile.name,
        type: finalFile.type,
        size: finalFile.size
      });

      setFile(finalFile);

      // Create preview
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