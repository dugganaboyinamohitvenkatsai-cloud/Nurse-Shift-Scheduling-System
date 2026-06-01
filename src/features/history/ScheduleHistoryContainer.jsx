import React, { useContext, useMemo, useState } from 'react';
import { ScheduleContext } from '../../context/ScheduleContext';
import { Calendar, Clock, History, Search } from 'lucide-react';

const ScheduleHistoryContainer = () => {
  const { shifts, nurses, wards } = useContext(ScheduleContext);
  const [searchQuery, setSearchQuery] = useState('');

  // For history, we only want past shifts or completed shifts. 
  // For the academic demo, we'll just show all shifts sorted by date ascending.
  const historyShifts = useMemo(() => {
    return shifts
      .filter(s => {
        if (!searchQuery) return true;
        const nurse = nurses.find(n => n.id === s.nurseId);
        const ward = wards.find(w => w.id === s.wardId);
        const query = searchQuery.toLowerCase();
        return (nurse?.name.toLowerCase().includes(query)) || 
               (ward?.name.toLowerCase().includes(query)) ||
               (s.date.includes(query));
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [shifts, nurses, wards, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6 shrink-0 border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-blue-600" /> Schedule History
          </h1>
          <p className="text-gray-500 mt-1">View past shift assignments and logs.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search date, nurse, ward..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white border border-gray-200 rounded-xl shadow-sm custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-bold">
              <th className="p-4">Date</th>
              <th className="p-4">Shift Type</th>
              <th className="p-4">Ward</th>
              <th className="p-4">Assigned Nurse</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {historyShifts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No records found.</td>
              </tr>
            ) : (
              historyShifts.map(shift => {
                const nurse = nurses.find(n => n.id === shift.nurseId);
                const ward = wards.find(w => w.id === shift.wardId);
                
                return (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                    <td className="p-4 whitespace-nowrap font-medium text-gray-900">
                      {new Date(shift.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {shift.type}
                      </div>
                      <span className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">{ward?.name || 'Unknown'}</td>
                    <td className="p-4">
                      {nurse ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {nurse.name.charAt(0)}
                          </div>
                          <span>{nurse.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${shift.status === 'assigned' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleHistoryContainer;
