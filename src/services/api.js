import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nurse-shift-scheduling-system.onrender.com/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Resources
export const fetchNurses = async () => {
  const response = await api.get('/nurses');
  return response.data;
};

export const fetchWards = async () => {
  const response = await api.get('/wards');
  return response.data;
};

export const fetchShifts = async () => {
  const response = await api.get('/shifts');
  return response.data;
};

export const createShift = async (shiftData) => {
  const response = await api.post('/shifts', shiftData);
  return response.data;
};

export const updateShift = async (id, updateData) => {
  const response = await api.put(`/shifts/${id}`, updateData);
  return response.data;
};

export const fetchLeaves = async () => {
  const response = await api.get('/leaves');
  return response.data;
};

export const createLeave = async (leaveData) => {
  const response = await api.post('/leaves', leaveData);
  return response.data;
};

export const updateLeaveStatus = async (id, status) => {
  const response = await api.put(`/leaves/${id}`, { status });
  return response.data;
};

export const fetchOvertimeData = async () => {
  const [nurses, shifts] = await Promise.all([
    fetchNurses(),
    fetchShifts()
  ]);

  return nurses.map(nurse => {
    const nurseShifts = shifts.filter(s => s.nurseId === nurse.id && s.status === 'assigned');
    let workedHours = 0;
    nurseShifts.forEach(s => {
      const start = parseInt(s.startTime.split(':')[0], 10);
      let end = parseInt(s.endTime.split(':')[0], 10);
      if (end < start) end += 24;
      workedHours += (end - start);
    });

    const overtimeHours = Math.max(0, workedHours - nurse.availableHours);
    return {
      ...nurse,
      workedHours,
      overtimeHours
    };
  });
};

// Notifications
export const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Shift Swaps
export const fetchSwaps = async () => {
  const response = await api.get('/swaps');
  return response.data;
};

export const requestSwap = async (swapData) => {
  const response = await api.post('/swaps', swapData);
  return response.data;
};

export const updateSwapStatus = async (id, status) => {
  const response = await api.put(`/swaps/${id}`, { status });
  return response.data;
};

// Availability
export const fetchAvailability = async () => {
  const response = await api.get('/availability');
  return response.data;
};

export const updateAvailability = async (availabilityData) => {
  const response = await api.post('/availability', availabilityData);
  return response.data;
};

export default api;
