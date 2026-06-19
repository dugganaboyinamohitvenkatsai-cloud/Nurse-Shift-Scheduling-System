import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('RN');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const success = await login(username, password);
      if (success) {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        navigate(savedUser?.role === 'ADMIN' ? '/dashboard' : '/nurse-dashboard');
      } else {
        setError("Invalid credentials.");
      }
    } else {
      const result = await register({ username, password, name, type });
      if (result.success) {
        navigate('/nurse-dashboard');
      } else {
        setError(result.error || "Registration failed.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">NexusSchedule</h1>
          <p className="text-gray-500 mt-2 text-sm">Nurse Shift Scheduling System</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nurse Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
                >
                  <option value="RN">Registered Nurse (RN)</option>
                  <option value="LPN">Licensed Practical Nurse (LPN)</option>
                  <option value="CNA">Certified Nursing Assistant (CNA)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
              placeholder={isLogin ? "Enter 'admin' or 'alice'" : "Choose a username"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
              placeholder={isLogin ? "Enter password" : "Create a password"}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-blue-600 hover:underline font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          <p>Academic Project - Fall Semester</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
