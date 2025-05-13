import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/login`,
        form,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        alert('Login successful! (로그인 성공!)');
        localStorage.setItem('authToken', res.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Check your username or password. (로그인 실패. 아이디 또는 비밀번호를 확인해주세요.)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-orange-800 mb-8">
          Login (로그인)
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
          >
            {loading ? 'Logging in... (로그인 중...)' : 'Login (로그인)'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <p className="mt-4">
          Don't have an account? (회원이 아니신가요?){' '}
          <Link to="/signup" className="text-orange-500 hover:underline">Sign up (회원가입)</Link>
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

export default LoginPage;
