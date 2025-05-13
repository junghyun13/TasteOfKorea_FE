import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    introduce: '',
    role: 'OWNER',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/user/signup`, // ✅ 백틱 사용
      form
    );
    setMessage('회원가입 성공! 이제 로그인 해주세요. Login please');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  } catch (err) {
    console.error(err);
    setMessage('회원가입 실패. 다시 시도해주세요. fail to signup ');
  } finally {
    setLoading(false);
  }
};


 return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-orange-800 mb-8">
          Signup (회원가입)
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            name="username"
            placeholder="Username (아이디)"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password (비밀번호)"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            name="name"
            placeholder="Name (이름)"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (이메일)"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            name="introduce"
            placeholder="Introduce Yourself (자기소개)"
            value={form.introduce}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="USER">User (일반 사용자)</option>
            <option value="OWNER">Owner (사장님)</option>
            <option value="ADMIN">Admin (관리자)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
          >
            {loading ? 'Processing... (처리 중...)' : 'Sign Up (회원가입)'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 ${message.includes('성공') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <p className="mt-4">
          Already have an account? (이미 계정이 있으신가요?){' '}
          <Link to="/login" className="text-orange-500 hover:underline">Login (로그인)</Link>
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-orange-700 hover:underline"
        >
          Back to Home (홈으로 돌아가기)
        </button>
      </div>
    </div>
  );
};

export default SignupPage;