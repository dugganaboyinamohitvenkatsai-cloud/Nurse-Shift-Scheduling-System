import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ScheduleContext } from '../context/ScheduleContext';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Clock, CalendarCheck, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { shifts, nurses } = useContext(ScheduleContext);

  const modules = [
    { name: 'Roster Builder', path: '/roster', icon: CalendarDays, desc: 'Interactive calendar to manage daily, weekly, and monthly shifts.', color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Shift Assignment', path: '/shifts', icon: Users, desc: 'Assign nurses to specific wards and open shifts.', color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Availability', path: '/availability', icon: CalendarCheck, desc: 'Manage constraints and availability for all staff.', color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Overtime Tracker', path: '/overtime', icon: Clock, desc: 'Monitor hours worked and distribute workload fairly.', color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // Calculate Conflicts
  const conflicts = useMemo(() => {
    const alerts = [];
    if (!shifts || !Array.isArray(shifts) || !nurses || !Array.isArray(nurses)) return alerts;
    
    // Check for double bookings (same nurse, same date, multiple assigned shifts)
    const nurseShiftMap = {};
    shifts.forEach(shift => {
      if (shift.status === 'assigned' && shift.nurseId) {
        const key = `${shift.nurseId}-${shift.date}`;
        if (nurseShiftMap[key]) {
          const nurse = nurses.find(n => n.id === shift.nurseId);
          alerts.push({ id: `cb-${key}`, message: `Double Booking: ${nurse?.name || 'Unknown Nurse'} is assigned to multiple shifts on ${shift.date}.`, type: 'error' });
        } else {
          nurseShiftMap[key] = true;
        }
      }
    });

    // Check for unassigned shifts in the past or today
    const unassigned = shifts.filter(s => s.status !== 'assigned');
    if (unassigned.length > 0) {
      alerts.push({ id: 'ua', message: `Staffing Alert: There are ${unassigned.length} unassigned open shifts.`, type: 'warning' });
    }

    return alerts;
  }, [shifts, nurses]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.username}!</h1>
        <p className="text-gray-500 text-lg">Hospital Administration Dashboard</p>
      </div>

      {conflicts.length > 0 && (
        <div className="mb-8 bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-red-200 bg-red-50 flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-lg">Conflict Alerts ({conflicts.length})</h2>
          </div>
          <div className="p-4 space-y-3">
            {conflicts.map(conflict => (
              <div key={conflict.id} className={`p-3 rounded-lg text-sm font-medium border ${conflict.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                {conflict.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => (
          <Link 
            key={mod.name} 
            to={mod.path}
            className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-xl p-6 transition-all flex items-start gap-4"
          >
            <div className={`p-4 rounded-lg ${mod.bg} ${mod.color}`}>
              <mod.icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{mod.name}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{mod.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
