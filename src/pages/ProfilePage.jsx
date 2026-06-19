import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchProfile, updateProfile } from '../services/api';
import { User, Save, Upload } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState({
    name: '',
    type: 'RN',
    availableHours: 40,
    avatar: '',
  });
  
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.role !== 'NURSE') {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchProfile();
        setProfile({
          name: data.name || '',
          type: data.type || 'RN',
          availableHours: data.availableHours || 40,
          avatar: data.avatar || '',
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const payload = { ...profile };
      if (password) payload.password = password;
      
      await updateProfile(payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword(''); // Clear password field after save
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'NURSE') {
    return <div className="p-8 text-gray-500">Only nurses have access to this profile page.</div>;
  }

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" /> My Profile
        </h1>
        <p className="text-gray-500 text-lg">Manage your personal settings and account details.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div className="w-full">
                <label className="block text-xs font-medium text-gray-500 mb-1 text-center">Avatar URL</label>
                <input 
                  type="text" 
                  name="avatar"
                  value={profile.avatar}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nurse Type</label>
                <select 
                  name="type"
                  value={profile.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="RN">Registered Nurse (RN)</option>
                  <option value="LPN">Licensed Practical Nurse (LPN)</option>
                  <option value="CNA">Certified Nursing Assistant (CNA)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Available Hours</label>
                <input 
                  type="number" 
                  name="availableHours"
                  min="0"
                  max="168"
                  required
                  value={profile.availableHours}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Security</h3>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
