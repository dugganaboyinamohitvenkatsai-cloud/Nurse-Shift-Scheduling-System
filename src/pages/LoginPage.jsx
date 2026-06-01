import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Course Alignment: CO5 (Forms, Validation, React Router)
 * 
 * Purpose:
 * Renders the login form. Uses controlled components (state tied to inputs) to handle
 * user credentials. Validates the input and uses the AuthContext to log the user in.
 * After successful login, React Router's useNavigate hook redirects the user.
 */

const LoginPage = () => {
  // Local state for the form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Access the login function from our global context
  const { login } = useContext(AuthContext);
  
  // Hook for programmatic navigation
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Basic Validation (CO5)
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const success = login(username, password);
    
    if (success) {
      // Navigate to the correct dashboard based on role
      if (username === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/nurse-dashboard');
      }
    } else {
      setError("Invalid credentials. Try 'admin' or 'nurse'.");
    }
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
              placeholder="Enter 'admin' or 'nurse'"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-colors"
              placeholder="Any password works"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          <p>Academic Project - Fall Semester</p>
          <p>D. Mohit Venkat Sai (2520030106)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
