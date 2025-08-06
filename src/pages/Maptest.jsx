import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import polyline from '@mapbox/polyline'; // 맨 위에 추가 필요
import { useNavigate } from 'react-router-dom';


const Maptest = ({ currentMyLocation, restaurantData }) => {
  const [isNaverLoaded, setIsNaverLoaded] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [transportMode, setTransportMode] = useState('driving-car'); // 교통 수단을 driving-car로 초기화
  const mapRef = useRef(null); // ✅ 지도 객체를 저장할 ref
  const polylineRef = useRef(null); // ✅ 이전 경로 저장
  const navigate = useNavigate();

  

  useEffect(() => {
    // 네이버 지도 API 스크립트 로드 여부 확인
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}&language=en`;

    script.onload = () => {
      setIsNaverLoaded(true); // 스크립트가 로드되면 상태 업데이트
    };
    document.head.appendChild(script);

    // cleanup: 컴포넌트가 unmount될 때 스크립트 제거
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isNaverLoaded || !window.naver || !currentMyLocation.lat) return;

    const map = new window.naver.maps.Map('map', {
      center: new window.naver.maps.LatLng(currentMyLocation.lat, currentMyLocation.lng),
      zoom: 15,
    });

    mapRef.current = map; // ✅ 지도 저장

    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(currentMyLocation.lat, currentMyLocation.lng),
      map,
      title: "현재 위치",
      icon: {
        content: `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: #4285F4; border: 3px solid white; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                    <div style="width: 16px; height: 16px; background-color: white; border-radius: 50%;"></div>
                  </div>`,
        anchor: new window.naver.maps.Point(20, 20)
      }
    });

    const bounds = new window.naver.maps.LatLngBounds();
    bounds.extend(new window.naver.maps.LatLng(currentMyLocation.lat, currentMyLocation.lng));

    restaurantData.forEach((restaurant) => {
      const position = new window.naver.maps.LatLng(restaurant.latitude, restaurant.longitude);
      bounds.extend(position);

      const marker = new window.naver.maps.Marker({
        position,
        map,
        title: restaurant.englishName,
        icon: {
          content: `<div style="position: relative; width: 60px; height: 60px;">
                      <div style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 3px solid #FF6B6B; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                        <img src="${restaurant.file}" alt="${restaurant.englishName}" style="width: 100%; height: 100%; object-fit: cover;"/>
                      </div>
                      <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%);
                        width: 0; height: 0; border-left: 8px solid transparent;
                        border-right: 8px solid transparent; border-top: 10px solid #FF6B6B;">
                      </div>
                    </div>`,
          anchor: new window.naver.maps.Point(25, 55)
        }
      });

      const infoWindowContent = `
  <div style="width: 280px; padding: 0; border-radius: 8px; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);" class="infoWindow">
    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #FF6B6B; color: white; padding: 10px 12px; border-radius: 8px 8px 0 0;">
      <strong style="font-size: 16px; white-space: nowrap;">${restaurant.englishName}</strong>
      <button class="closeButton" style="border: none; background: none; font-size: 16px; cursor: pointer; color: white; font-weight: normal; padding: 0; width: 18px; height: 18px; line-height: 18px; text-align: center; border-radius: 50%; margin-left: 8px; transition: background-color 0.3s;">
        ✕
      </button>
    </div>
    <img src="${restaurant.file}" alt="${restaurant.englishName}" style="width: 100%; height: 140px; object-fit: cover; margin-bottom: 0;"/>
    <div style="line-height: 1.6; padding: 12px;">
      <div style="margin-bottom: 10px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">👤 Owner: ${restaurant.ownerName}</div>
        <div style="display: flex; align-items: center; margin-bottom: 6px;">💰 Price: ₩${restaurant.price.toLocaleString()}</div>
        
      </div>
    </div>
    <button class="howToGoButton" style="width: 100%; padding: 10px; background-color: #FF6B6B; color: white; border: none; font-weight: bold; cursor: pointer;">How to Go</button>
    <button class="foodDetailButton" style="width: 100%; padding: 10px; background-color: green; color: white; border: none; font-weight: bold; cursor: pointer; margin-top: 10px;">Food Explanation</button>
    <button class="orderButton" style="width: 100%; padding: 10px; background-color: orange; color: white; border: none; font-weight: bold; cursor: pointer; margin-top: 10px;">Order</button>
  </div>
`;

      const infoWindow = new window.naver.maps.InfoWindow({
        content: infoWindowContent,
        borderWidth: 0,
        backgroundColor: "transparent",
        anchorSize: new window.naver.maps.Size(0, 0),
        pixelOffset: new window.naver.maps.Point(0, -10)
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
        setTimeout(() => {
          const closeButton = document.querySelector('.closeButton');
          if (closeButton) {
            closeButton.addEventListener('click', (e) => {
              e.stopPropagation();
              infoWindow.close();
            });
          }

          const howToGoButton = document.querySelector('.howToGoButton');
if (howToGoButton) {
  const newHowToGoButton = howToGoButton.cloneNode(true);
  howToGoButton.replaceWith(newHowToGoButton);

  newHowToGoButton.addEventListener('click', () => {
    getRoute(currentMyLocation, restaurant);
  });
}

          const orderButton = document.querySelector('.orderButton');
  if (orderButton) {
    const newOrderButton = orderButton.cloneNode(true);
    orderButton.replaceWith(newOrderButton);

    newOrderButton.addEventListener('click', () => {
      const url = `${import.meta.env.VITE_BACKEND_API_URL}/restaurants/order?restaurantName=${restaurant.englishName}&recipeId=${restaurant.recipeId}`;
      fetch(url, { method: 'POST' })
        .then(() => alert('Success order'))
        .catch(err => alert('order fail: ' + err));
    });
  }
        const foodDetailButton = document.querySelector('.foodDetailButton');
if (foodDetailButton) {
  const newFoodDetailButton = foodDetailButton.cloneNode(true);
  foodDetailButton.replaceWith(newFoodDetailButton);

  newFoodDetailButton.addEventListener('click', () => {
    navigate(`/fooddetail/${restaurant.recipeId}`);
  });
}


        }, 100);
      });
    });

    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [isNaverLoaded, currentMyLocation, restaurantData]);

  const getRoute = async (currentLocation, restaurant) => {
    const start = [currentLocation.lng, currentLocation.lat];
    const end = [restaurant.longitude, restaurant.latitude];

    console.log('Start:', start);
    console.log('End:', end);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTESERVICE_KEY;
      // 교통 수단을 선택할 수 있도록 `transportMode`를 이용
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${transportMode}`,
        {
          coordinates: [start, end],
          units: 'm',
          language: 'en',
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`, // ✅ your actual key
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data); // 응답 데이터 확인

      if (response.data?.routes?.length > 0) {
        const encoded = response.data.routes[0].geometry;
        const decoded = polyline.decode(encoded); // [[lat, lng], [lat, lng], ...]
        const route = decoded.map(([lat, lng]) => [lng, lat]); // Naver 지도용으로 lng, lat 순서로 변환
        setRouteData(route);
        drawRoute(route);
      } else {
        console.error("경로 데이터가 없습니다. API 응답을 확인하세요.");
      }
    } catch (error) {
      console.error("Error fetching route data:", error.response?.data || error.message);
    }
  };

  const drawRoute = (route) => {
    if (!route || !mapRef.current) return;

    // 기존 경로 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const routePath = route.map(coord => new window.naver.maps.LatLng(coord[1], coord[0]));
    const polyline = new window.naver.maps.Polyline({
      path: routePath,
      strokeColor: "#FF6B6B",
      strokeWeight: 4,
      strokeOpacity: 0.8,
      strokeStyle: "solid"
    });
    polyline.setMap(mapRef.current);

    polylineRef.current = polyline;
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />
      <div>
        {/* 교통수단 선택을 위한 드롭다운 */}
        <select onChange={(e) => setTransportMode(e.target.value)} value={transportMode}>
          <option value="driving-car">Car</option>
          <option value="cycling-regular">Bicycle</option>
          <option value="foot-walking">Walking</option>
        </select>
      </div>
    </div>
  );
};

export default Maptest;
