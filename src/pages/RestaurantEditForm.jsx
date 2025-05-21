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
    '가지볶음': 0, '간장게장': 1, '갈비구이': 2, '갈비찜': 3, '갈비탕': 4, '갈치구이': 5, '갈치조림': 6, '감자전': 7, '감자조림': 8, '감자채볶음': 9, '감자탕': 10, '갓김치': 11, '건새우볶음': 12, '경단': 13, '계란국': 14, '계란말이': 15, '계란찜': 16, '계란후라이': 17, '고등어구이': 18, '고등어조림': 19, '고사리나물': 20, '고추장진미채볶음': 21, '고추튀김': 22, '곰탕_설렁탕': 23, '곱창구이': 24, '곱창전골': 25, '과메기': 26, '김밥': 27, '김치볶음밥': 28, '김치전': 29, '김치찌개': 30, '김치찜': 31, '깍두기': 32, '깻잎장아찌': 33, '꼬막찜': 34, '꽁치조림': 35, '꽈리고추무침': 36, '꿀떡': 37, '나박김치': 38, '누룽지': 39, '닭갈비': 40, '닭계장': 41, '닭볶음탕': 42, '더덕구이': 43, '도라지무침': 44, '도토리묵': 45, '동그랑땡': 46, '동태찌개': 47, '된장찌개': 48, '두부김치': 49, '두부조림': 50, '땅콩조림': 51, '떡갈비': 52, '떡국_만두국': 53, '떡꼬치': 54, '떡볶이': 55, '라면': 56, '라볶이': 57, '막국수': 58, '만두': 59, '매운탕': 60, '멍게': 61, '메추리알장조림': 62, '멸치볶음': 63, '무국': 64, '무생채': 65, '물냉면': 66, '물회': 67, '미역국': 68, '미역줄기볶음': 69, '배추김치': 70, '백김치': 71, '보쌈': 72, '부추김치': 73, '북엇국': 74, '불고기': 75, '비빔냉면': 76, '비빔밥': 77, '산낙지': 78, '삼겹살': 79, '삼계탕': 80, '새우볶음밥': 81, '새우튀김': 82, '생선전': 83, '소세지볶음': 84, '송편': 85, '수육': 86, '수정과': 87, '수제비': 88, '숙주나물': 89, '순대': 90, '순두부찌개': 91, '시금치나물': 92, '시래기국': 93, '식혜': 94, '알밥': 95, '애호박볶음': 96, '약과': 97, '약식': 98, '양념게장': 99, '양념치킨': 100, '어묵볶음': 101, '연근조림': 102, '열무국수': 103, '열무김치': 104, '오이소박이': 105, '오징어채볶음': 106, '오징어튀김': 107, '우엉조림': 108, '유부초밥': 109, '육개장': 110, '육회': 111, '잔치국수': 112, '잡곡밥': 113, '잡채': 114, '장어구이': 115, '장조림': 116, '전복죽': 117, '젓갈': 118, '제육볶음': 119, '조개구이': 120, '조기구이': 121, '족발': 122, '주꾸미볶음': 123, '주먹밥': 124, '짜장면': 125, '짬뽕': 126, '쫄면': 127, '찜닭': 128, '총각김치': 129, '추어탕': 130, '칼국수': 131, '코다리조림': 132, '콩국수': 133, '콩나물국': 134, '콩나물무침': 135, '콩자반': 136, '파김치': 137, '파전': 138, '편육': 139, '피자': 140, '한과': 141, '해물찜': 142, '호박전': 143, '호박죽': 144, '홍어무침': 145, '황태구이': 146, '회무침': 147, '후라이드치킨': 148, '훈제오리': 149
}


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
                  영어 이름
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

