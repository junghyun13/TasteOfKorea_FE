import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [introduce, setIntroduce] = useState('');
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    setUserInfo(res.data);
    setIntroduce(res.data.introduce || '');
  } catch (err) {
    // ✅ 토큰 만료 시: 401 이면 재발급 시도
    if (err.response && err.response.status === 401) {
      try {
        const reissueRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/user/reissue`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = reissueRes.data.accessToken;
        localStorage.setItem('authToken', newAccessToken);

        // 🔁 새 토큰으로 재요청
        const retryRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`,
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
            withCredentials: true,
          }
        );

        setUserInfo(retryRes.data);
        setIntroduce(retryRes.data.introduce || '');
      } catch (retryErr) {
        console.error('토큰 재발급 실패:', retryErr);
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } else {
      console.error('유저 정보 조회 실패:', err);
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  } finally {
    setLoading(false);
  }
};


    fetchUserInfo();
  }, [accessToken, navigate]);

  const handleUpdate = async () => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/user-info`,
        { introduce },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      alert('정보 수정 완료');
      setUserInfo(res.data);
    } catch (err) {
      console.error('정보 수정 실패:', err);
      if (err.response) {
        console.error('Response error:', err.response);
      }
      alert('정보 수정 실패');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      localStorage.removeItem('authToken');
      alert('로그아웃 되었습니다.');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('로그아웃 실패:', err);
      alert('로그아웃 실패');
    }
  };

  const handleWithdrawal = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까?')) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/user/withdrawal`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      localStorage.removeItem('authToken');
      alert('회원 탈퇴 완료');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      alert('회원 탈퇴 실패');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <p className="text-xl text-orange-800">로딩 중...</p>
    </div>
  );

  if (!userInfo) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <p className="text-xl text-orange-800">사용자 정보를 불러오지 못했습니다.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-orange-800 mb-6 text-center">My Profile</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-orange-800 font-medium mb-2">Nickname (닉네임)</label>
            <p className="bg-orange-50 p-3 rounded-lg">{userInfo.username}</p>
          </div>
          
          <div>
            <label className="block text-orange-800 font-medium mb-2">Introduction (소개)</label>
            <textarea
              value={introduce}
              onChange={(e) => setIntroduce(e.target.value)}
              className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-orange-50"
              rows="4"
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleUpdate} 
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Update Info (정보 수정)
            </button>
            
            <button 
              onClick={handleLogout} 
              className="px-6 py-3 bg-orange-400 text-white font-semibold rounded-lg hover:bg-orange-500 transition-colors"
            >
              Logout (로그아웃)
            </button>
            
            <button 
              onClick={handleWithdrawal} 
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Withdraw (회원 탈퇴)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;