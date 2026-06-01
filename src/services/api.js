import { initialNurses, initialWards, initialShifts, initialLeaveRequests } from './mockData';

// Mock API delay for realism
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let shifts = [...initialShifts];
let nurses = [...initialNurses];
let wards = [...initialWards];

export const fetchScheduleData = async () => {
  await delay(800);
  return { shifts, nurses, wards };
};

export const assignShift = async (shiftId, nurseId) => {
  await delay(600);
  const shiftIndex = shifts.findIndex(s => s.id === shiftId);
  if (shiftIndex === -1) throw new Error("Shift not found");
  
  // Random failure simulation for robust async testing (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Race condition: Shift already modified by another user");
  }
  
  shifts[shiftIndex] = { ...shifts[shiftIndex], nurseId, status: 'assigned' };
  return shifts[shiftIndex];
};

export const updateShift = async (shiftId, updates) => {
  await delay(600);
  const shiftIndex = shifts.findIndex(s => s.id === shiftId);
  if (shiftIndex === -1) throw new Error("Shift not found");
  
  shifts[shiftIndex] = { ...shifts[shiftIndex], ...updates };
  return shifts[shiftIndex];
};

export const createShift = async (newShift) => {
  await delay(600);
  const shift = { ...newShift, id: `s${Date.now()}` };
  shifts.push(shift);
  return shift;
};

export const updateAvailability = async (nurseId, date, status) => {
  await delay(600);
  const index = nurses.findIndex(n => n.id === nurseId);
  if (index === -1) throw new Error("Nurse not found");
  
  const updatedNurse = {
    ...nurses[index],
    availability: {
      ...(nurses[index].availability || {}),
      [date]: status
    }
  };
  nurses[index] = updatedNurse;
  return updatedNurse;
};

export const fetchOvertimeData = async () => {
  await delay(800);
  // Mock overtime calculation based on nurses and shifts
  return nurses.map(n => {
    const worked = Math.floor(Math.random() * 30) + 20; // 20-50 hours
    const overtime = Math.max(0, worked - 40);
    return {
      ...n,
      workedHours: worked,
      overtimeHours: overtime
    };
  });
};

let leaveRequests = [...initialLeaveRequests];

export const fetchLeaveRequests = async () => {
  await delay(800);
  return leaveRequests;
};

export const submitLeaveRequest = async (requestData) => {
  await delay(600);
  const newRequest = {
    ...requestData,
    id: `lr${Date.now()}`,
    status: 'pending'
  };
  leaveRequests = [newRequest, ...leaveRequests];
  return newRequest;
};

export const updateLeaveRequestStatus = async (id, status) => {
  await delay(600);
  const index = leaveRequests.findIndex(lr => lr.id === id);
  if (index === -1) throw new Error("Leave request not found");
  
  leaveRequests[index] = { ...leaveRequests[index], status };
  return leaveRequests[index];
};
