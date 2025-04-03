import React, { useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';

const foodfind = () => {
  const [file, setFile] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null); // State for food details

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
    setFoodDetails(null); // Reset food details on new submission

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

      // Fetch food details based on the predicted food name (e.g., '갈비구이')
      if (result.class) {
        const foodDetailsResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/food/${result.id}`);
        if (!foodDetailsResponse.ok) {
          throw new Error('Failed to fetch food details');
        }

        const foodDetailsData = await foodDetailsResponse.json();
        setFoodDetails(foodDetailsData); // Set the food details state
      }
    } catch (error) {
      setError('An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  // Function to render star rating
const renderRating = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span
        key={i}
        className={`text-yellow-500 text-3xl ${i < rating ? '' : 'opacity-50'}`}
      >
        {i < rating ? '★' : '☆'}
      </span>
    );
  }
  return stars;
};


  return (
    <div className="bg-orange-50 min-h-screen p-4 sm:p-6 relative">
      {/* Header with Back Button and Title */}
      <header className="flex items-center justify-between mb-6">
        <button 
          onClick={() => window.history.back()}
          className="text-orange-600 hover:text-orange-700 flex items-center p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 mr-1" />
          <span className="text-sm">Go Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          {/* Decorative Orange Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50 z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-orange-800 mb-4 text-center flex items-center justify-center">
              <Camera className="w-6 h-6 mr-2 text-orange-500" />
              Food Image Prediction
            </h1>

            {/* File Input with Custom Styling */}
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

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-xl shadow-md"
                />
              </div>
            )}

            {/* Predict Button */}
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

            {/* Prediction Result */}
            {foodName && confidence !== null && (
              <div className="mt-6 p-4 bg-orange-50 rounded-xl text-center">
                <h2 className="text-xl font-semibold text-orange-800">Predicted Food: {foodName}</h2>
                <p className="text-lg text-orange-600">Confidence: {(confidence * 100).toFixed(2)}%</p>
              </div>
            )}

            {/* Food Details */}
            {foodDetails && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-lg text-center">
                <h3 className="text-xl font-semibold text-orange-800">Food Details: {foodDetails.romanizedName}</h3>
                <p className="text-lg text-orange-600">Korean Name: {foodDetails.koreanName}</p>
                <p className="text-lg text-orange-600">English Name: {foodDetails.englishName}</p>
                <p className="text-lg text-orange-600">Category: {foodDetails.category}</p>
                <p className="text-lg text-orange-600">Calories: {foodDetails.calories} kcal</p>
                <p className="text-lg text-orange-600">Made With: {foodDetails.madeWith}</p>


                {/* Vegan Check */}
                {foodDetails.category === 'meat' && (
                  <p className="text-red-500 mt-4">This food is not suitable for vegans.</p>
                )}

                {/* Rating Stars */}
                <div className="mt-4">
                  <p>Spicy: {renderRating(foodDetails.spicy)}</p>
                  <p>Sour: {renderRating(foodDetails.sour)}</p>
                  <p>Salty: {renderRating(foodDetails.salty)}</p>
                  <p>Oily: {renderRating(foodDetails.oily)}</p>
                </div>
                <a href={foodDetails.recipeLink} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">Recipe Video</a>
                <img src={foodDetails.imgLink} alt={foodDetails.englishName} className="mt-4 max-w-full h-48 object-cover rounded-xl shadow-md" />
              </div>
            )}

            {/* Error Message */}
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
