import React from 'react';
import { useNavigate } from 'react-router-dom';

const Maintep = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-800 mb-8">
          Korean Food Image Prediction System
        </h1>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <button
            onClick={() => navigate('/foodfind')}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
          >
            Select Food Image
          </button>
          <button
            onClick={() => navigate('/recommend')}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
          >
            Recommend Korean Food
          </button>
        </div>
      </div>
    </div>
  );
};

export default Maintep;