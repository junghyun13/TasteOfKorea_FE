import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, User, DollarSign, Upload, Check, Camera, MapPin } from 'lucide-react';

const RestaurantEditForm = () => {
  const [englishName, setEnglishName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const classIndices = {
'가지볶음': 0,

'간장게장': 1,

'갈비탕': 2,

'갈치구이': 3,

'감자조림': 4,

'감자채볶음': 5,

'감자탕': 6,

'갓김치': 7,

'건새우볶음': 8,

'경단': 9,

'계란국': 10,

'계란말이': 11,

'계란찜': 12,

'고등어구이': 13,

'고사리나물': 14,

'고추튀김': 15,

'곰탕_설렁탕': 16,

'곱창구이': 17,

'과메기': 18,

'김밥': 19,

'김치볶음밥': 20,

'김치전': 21,

'김치찌개': 22,

'깍두기': 23,

'깻잎장아찌': 24,

'꼬막찜': 25,

'꽈리고추무침': 26,

'꿀떡': 27,

'나박김치': 28,

'누룽지': 29,

'닭갈비': 30,

'도토리묵': 31,

'동그랑땡': 32,

'된장찌개': 33,

'두부김치': 34,

'두부조림': 35,

'땅콩조림': 36,

'떡갈비': 37,

'떡국_만두국': 38,

'떡꼬치': 39,

'떡볶이': 40,

'라면': 41,

'라볶이': 42,

'막국수': 43,

'만두': 44,

'멍게': 45,

'메추리알장조림': 46,

'멸치볶음': 47,

'무국': 48,

'무생채': 49,

'물냉면': 50,

'물회': 51,

'미역국': 52,

'미역줄기볶음': 53,

'배추김치': 54,

'백김치': 55,

'보쌈': 56,

'부추김치': 57,

'불고기': 58,

'비빔냉면': 59,

'비빔밥': 60,

'산낙지': 61,

'삼겹살': 62,

'삼계탕': 63,

'새우볶음밥': 64,

'새우튀김': 65,

'생선조림': 66,

'소세지볶음': 67,

'송편': 68,

'수정과': 69,

'숙주나물': 70,

'순대': 71,

'순두부찌개': 72,

'시금치나물': 73,

'시래기국': 74,

'식혜': 75,

'애호박볶음': 76,

'약과': 77,

'약식': 78,

'양념게장': 79,

'양념치킨': 80,

'어묵볶음': 81,

'연근조림': 82,

'열무국수': 83,

'열무김치': 84,

'오이소박이': 85,

'오징어채볶음': 86,

'우엉조림': 87,

'유부초밥': 88,

'육개장': 89,

'육회': 90,

'잔치국수': 91,

'잡곡밥': 92,

'잡채': 93,

'장어구이': 94,

'장조림': 95,

'전복죽': 96,

'제육볶음': 97,

'조개구이': 98,

'조기구이': 99,

'족발': 100,

'주꾸미볶음': 101,

'짜장면': 102,

'짬뽕': 103,

'쫄면': 104,

'찜닭': 105,

'총각김치': 106,

'추어탕': 107,

'칼국수': 108,

'콩국수': 109,

'콩나물국': 110,

'콩나물무침': 111,

'콩자반': 112,

'파김치': 113,

'파전': 114,

'피자': 115,

'한과': 116,

'해물찜': 117,

'호박전': 118,

'호박죽': 119,

'황태구이': 120,

'후라이드치킨': 121,

'훈제오리': 122}


// ✅ 네이버 맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.async = true;
    script.onload = () => setIsMapScriptLoaded(true); // ✅ 스크립트 로드 완료 시점 확인
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // ✅ 위도/경도 설정 후 지도 렌더링
  useEffect(() => {
    if (isMapScriptLoaded && latitude !== null && longitude !== null) {
      initMap();
    }
  }, [isMapScriptLoaded, latitude, longitude]);

  // ✅ 기존 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const token = await getValidAccessToken();
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        console.log('서버에서 받은 위치:', data.latitude, data.longitude); // ✅ 디버깅 로그
        setEnglishName(data.englishName);
        setOwnerName(data.ownerName);
        setPrice(data.price);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setImageUrl(data.file);
        setSelectedLabel(Object.keys(classIndices).find((key) => classIndices[key] === data.recipeId));
      } catch (err) {
        alert('식당 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchData();
  }, [id]);

  // ✅ 지도 초기화 함수
  const initMap = () => {
    if (!window.naver || latitude === null || longitude === null) return;

    console.log('지도 초기화 실행:', latitude, longitude); // ✅ 디버깅용

    const map = new window.naver.maps.Map('map', {
      center: new window.naver.maps.LatLng(latitude, longitude),
      zoom: 15,
    });

    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(latitude, longitude),
      map,
      draggable: true,
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

 

  const getValidAccessToken = async () => {
    let token = localStorage.getItem('authToken');

    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/user/reissue`,
            {},
            { withCredentials: true }
          );
          token = res.data.accessToken;
          localStorage.setItem('authToken', token);
        } catch {
          localStorage.removeItem('authToken');
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          throw new Error('토큰 재발급 실패');
        }
      } else {
        throw err;
      }
    }

    return token;
  };

  const handleLocationSelect = () => {
    if (markerRef.current) {
      const position = markerRef.current.getPosition();
      setLatitude(position.lat());
      setLongitude(position.lng());
      alert(`위치가 설정되었습니다: (${position.lat()}, ${position.lng()})`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeId = classIndices[selectedLabel];
    if (recipeId === undefined) {
      alert('대표 음식을 선택해주세요.');
      return;
    }

    const metadata = {
      id: parseInt(id),
      englishName,
      latitude,
      longitude,
      ownerName,
      file: imageUrl,
      recipeId,
      price: parseInt(price),
    };

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    if (file) formData.append('newFile', file);

    try {
      setLoading(true);
      const token = await getValidAccessToken();

      await axios.put(
        `${import.meta.env.VITE_BACKEND_API_URL}/restaurants/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('식당 수정 성공!');
      navigate('/restaurants/my');
    } catch (err) {
      console.error(err);
      alert('식당 수정 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center flex items-center justify-center">
            <Utensils className="w-6 h-6 mr-2 text-orange-500" />
            식당 수정
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* 입력 필드들 동일 */}
              <div>
                <label className="text-orange-800 font-medium mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  식당 이름
                </label>
                <input value={englishName} onChange={(e) => setEnglishName(e.target.value)} required className="w-full p-3 border rounded-lg" />
              </div>

              <div>
  <label className="text-orange-800 font-medium mb-2 flex items-center">
    <User className="w-5 h-5 mr-2 text-orange-500" />
    사장 이름
  </label>
  <input
    value={ownerName}
    readOnly // ✅ 수정 불가능하게 설정
    required
    className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
  />
</div>


              {/* 가격 입력 필드 */}
<div className="relative">
  <label className="block text-orange-800 font-medium mb-2 flex items-center">
    <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
    가격
  </label>
  <div className="flex items-center rounded-lg border border-orange-200 overflow-hidden">
    <span className="bg-orange-100 text-orange-700 px-3 py-3">₩</span>
    <input
      type="text"
      value={price}
      onChange={(e) => {
        const value = e.target.value.replace(/[^\d]/g, ''); // 숫자만 허용
        setPrice(value);
      }}
      className="w-full p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
      placeholder="가격을 입력하세요"
      required
    />
  </div>
</div>


              <div>
                <label className="text-orange-800 font-medium mb-2 flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-orange-500" />
                  대표 음식
                </label>
                <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)} required className="w-full p-3 border rounded-lg bg-white">
                  <option value="">-- 선택하세요 --</option>
                  {Object.keys(classIndices).map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="text-orange-800 font-medium mb-2 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-orange-500" />
                  식당 이미지 (수정)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full p-3 border rounded-lg flex items-center justify-center bg-orange-50">
                      <Upload className="w-5 h-5 mr-2 text-orange-500" />
                      <span>{file ? file.name : '이미지 선택'}</span>
                    </div>
                                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>

              {/* 기존 이미지 미리보기 */}
              {imageUrl && (
                <div className="mt-4 flex justify-center">
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="식당 이미지 미리보기" 
                      className="h-48 object-cover rounded-xl shadow-md" 
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* 지도 위치 선택 */}
              <div className="relative">
                <label className="block text-orange-800 font-medium mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                  식당 위치
                </label>
                <div className="border border-orange-200 rounded-lg overflow-hidden">
                  <div id="map" className="w-full h-64"></div>
                </div>
                <div className="mt-3 flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleLocationSelect}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
                  >
                    위치 등록
                  </button>
                </div>
                {latitude && longitude && (
                  <p className="mt-2 text-center text-orange-600">
                    선택된 위치: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            {/* 등록 버튼 */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors w-full disabled:bg-orange-300"
              >
                {loading ? '처리 중...' : '식당 수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantEditForm;

