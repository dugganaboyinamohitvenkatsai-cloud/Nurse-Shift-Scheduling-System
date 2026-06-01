export const initialNurses = [
  { id: 'n1', name: 'Alice Smith', type: 'RN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=alice' },
  { id: 'n2', name: 'Bob Jones', type: 'LPN', availableHours: 36, avatar: 'https://i.pravatar.cc/150?u=bob' },
  { id: 'n3', name: 'Carol White', type: 'CNA', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=carol' },
  { id: 'n4', name: 'David Brown', type: 'RN', availableHours: 20, avatar: 'https://i.pravatar.cc/150?u=david' },
  { id: 'n5', name: 'Eve Davis', type: 'RN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=eve' },
  { id: 'n6', name: 'Frank Miller', type: 'LPN', availableHours: 40, avatar: 'https://i.pravatar.cc/150?u=frank' },
];

export const initialWards = [
  { id: 'w1', name: 'Emergency', capacity: 20, color: 'bg-red-500/20 text-red-400 border-red-500/50', requiredSkill: 'RN' },
  { id: 'w2', name: 'ICU', capacity: 10, color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', requiredSkill: 'RN' },
  { id: 'w3', name: 'Pediatrics', capacity: 15, color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', requiredSkill: 'RN' },
  { id: 'w4', name: 'General', capacity: 30, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50', requiredSkill: 'LPN' },
];

// Helper to generate dates relative to today
const today = new Date();
const getRelativeDate = (daysOffset) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const initialShifts = [
  { id: 's1', wardId: 'w1', nurseId: 'n1', date: getRelativeDate(0), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
  { id: 's2', wardId: 'w2', nurseId: null, date: getRelativeDate(0), type: 'Night', startTime: '23:00', endTime: '07:00', status: 'unassigned' },
  { id: 's3', wardId: 'w3', nurseId: 'n3', date: getRelativeDate(1), type: 'Afternoon', startTime: '15:00', endTime: '23:00', status: 'assigned' },
  { id: 's4', wardId: 'w1', nurseId: 'n2', date: getRelativeDate(1), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
  { id: 's5', wardId: 'w4', nurseId: null, date: getRelativeDate(0), type: 'Afternoon', startTime: '15:00', endTime: '23:00', status: 'unassigned' },
  { id: 's6', wardId: 'w2', nurseId: 'n4', date: getRelativeDate(2), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
  { id: 's7', wardId: 'w1', nurseId: null, date: getRelativeDate(2), type: 'Night', startTime: '23:00', endTime: '07:00', status: 'unassigned' },
  { id: 's8', wardId: 'w3', nurseId: 'n5', date: getRelativeDate(-1), type: 'Morning', startTime: '07:00', endTime: '15:00', status: 'assigned' },
];

export const initialLeaveRequests = [
  { id: 'lr1', nurseId: 'n1', startDate: getRelativeDate(5), endDate: getRelativeDate(7), reason: 'Personal time off', status: 'pending' },
  { id: 'lr2', nurseId: 'n3', startDate: getRelativeDate(10), endDate: getRelativeDate(10), reason: 'Medical appointment', status: 'approved' },
  { id: 'lr3', nurseId: 'n5', startDate: getRelativeDate(2), endDate: getRelativeDate(4), reason: 'Family emergency', status: 'rejected' },
];
