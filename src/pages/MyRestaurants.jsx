import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyRestaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUserInfo(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const reissueRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/user/reissue`,
            {},
            { withCredentials: true }
          );
          const newToken = reissueRes.data.accessToken;
          localStorage.setItem('authToken', newToken);
          const retryRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
              withCredentials: true,
            }
          );
          setUserInfo(retryRes.data);
        } catch (retryErr) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } else {
        alert('로그인이 필요합니다.');
        navigate('/login');
      }
    }
  };

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/restaurants/my`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setRestaurants(res.data);
    } catch (err) {
      alert('식당 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 식당을 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert('식당이 삭제되었습니다.');
      setRestaurants(restaurants.filter((r) => r.id !== id));
    } catch (err) {
      alert('식당 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserInfo();
      await fetchRestaurants();
    };
    init();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-xl text-orange-700">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-3xl font-bold text-center text-orange-800 mb-8">내 식당 목록</h1>

      {restaurants.length === 0 ? (
        <p className="text-center text-gray-500">등록한 식당이 없습니다.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
  <div
    key={restaurant.id}
    className="bg-orange-100 p-4 rounded-lg shadow-md border border-orange-300"
  >
    <h2 className="text-xl font-bold text-orange-800 mb-2">{restaurant.englishName}</h2>

    {restaurant.file ? (
      <img
        src={restaurant.file}
        alt={restaurant.englishName}
        onClick={() => setPreviewImage(restaurant.file)}
        className="w-full h-40 object-cover rounded mb-2 cursor-pointer hover:opacity-80 transition"
      />
    ) : (
      <div className="w-full h-40 bg-orange-200 flex items-center justify-center text-orange-600 rounded mb-2">
        No Image
      </div>
    )}

    <div className="text-sm text-orange-700 space-y-1 mb-4">
      <p><strong>ID:</strong> {restaurant.id}</p>
      <p><strong>Owner:</strong> {restaurant.ownerName}</p>
      <p><strong>Latitude:</strong> {restaurant.latitude}</p>
      <p><strong>Longitude:</strong> {restaurant.longitude}</p>
      <p><strong>Recipe ID:</strong> {restaurant.recipeId ?? '없음'}</p>
      <p><strong>Price:</strong> {restaurant.price}원</p>
    </div>

    <div className="flex justify-between space-x-2">
      <button
        onClick={() => navigate(`/RestaurantEditForm/${restaurant.id}`)}
        className="flex-1 bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
      >
        수정하기
      </button>
      <button
        onClick={() => handleDelete(restaurant.id)}
        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        삭제하기
      </button>
    </div>
  </div>
))}

        </div>
      )}

      {/* 이미지 미리보기 모달 */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white p-4 rounded shadow-lg max-w-xl w-full">
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded" />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRestaurants;
