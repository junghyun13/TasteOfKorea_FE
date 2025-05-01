import React from 'react';

const NaverMapDirectionsEmbed = ({ food }) => {
  const destination = encodeURIComponent(`${food.koreanName} 한식당`);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-orange-800 mb-4">
        Find Directions to {food.pronunciation}
      </h2>

      <div className="w-full overflow-hidden rounded-xl" style={{ height: '600px' }}>
        <iframe
          title="Naver Directions"
          src={`https://map.naver.com/v5/directions/-/14128591.55887554,4518285.1591957123,%EC%84%9C%EC%9A%B8,%EA%B5%AD%EB%82%B4%EC%97%AC%ED%96%89,0?c=14128591.55887554,4518285.1591957123,15,0,0,0,dh&lang=en`}
          className="w-full h-full border-0 rounded-xl"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default NaverMapDirectionsEmbed;
