import { useEffect, useState } from "react";
import Maptest from "../pages/Maptest";
import { useParams } from "react-router-dom"; // URL에서 recipeId를 받기 위해

const NaverMap = () => {
  const { recipeId } = useParams();
  const [currentMyLocation, setCurrentMyLocation] = useState({ lat: 0, lng: 0 });
  const [restaurantData, setRestaurantData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 위치 정보 가져오기
  useEffect(() => {
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("위치 가져오기 실패", err);
        }
      );
    };

    fetchLocation(); // 위치 가져오기 호출
  }, []); // 빈 배열이므로, 컴포넌트 마운트 시 한 번만 호출됨

  // 식당 정보 가져오기
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/restaurants/by-recipe?recipeId=${recipeId}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setRestaurantData(data);
          console.log("restaurantData", data);  // API에서 받아온 데이터 확인
        }
      } catch (error) {
        console.error("식당 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);  // 로딩 상태 종료
      }
    };

    if (recipeId !== undefined) {
      fetchRestaurants();
    }
  }, [recipeId]); // recipeId가 변경될 때마다 호출됨

  // 로딩 중에 화면을 표시하거나, 로딩 완료 후 처리
  if (loading) {
    return <div>Loading...</div>; // 로딩 중 화면
  }

  return (
    <Maptest
      currentMyLocation={currentMyLocation}
      restaurantData={restaurantData}
    />
  );
};

export default NaverMap;
