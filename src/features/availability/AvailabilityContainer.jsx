import React, { useContext, useState, useCallback, useMemo } from 'react';
import { ScheduleContext } from '../../context/ScheduleContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import AvailabilityCalendar from './AvailabilityCalendar';

const AvailabilityContainer = () => {
  const { nurses, updateNurseAvailability, loading, error } = useContext(ScheduleContext);
  const [selectedNurseId, setSelectedNurseId] = useState(null);

  // Default to first nurse if none selected
  const activeNurseId = selectedNurseId || (nurses.length > 0 ? nurses[0].id : null);
  
  const activeNurse = useMemo(() => 
    nurses.find(n => n.id === activeNurseId), 
  [nurses, activeNurseId]);

  const handleUpdateAvailability = useCallback(async (date, status) => {
    if (!activeNurseId) return;
    try {
      await updateNurseAvailability(activeNurseId, date, status);
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Failed to update availability. Please try again.");
    }
  }, [activeNurseId, updateNurseAvailability]);

  if (loading) {
    return (
      <div className="p-8 h-full flex gap-6">
        <SkeletonLoader className="w-80 h-full rounded-xl bg-gray-200" />
        <SkeletonLoader className="flex-1 h-full rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="h-full flex flex-col md:flex-row p-6 gap-6 overflow-hidden bg-gray-50">
      
      {/* Sidebar: Staff List */}
      <div className="w-full md:w-80 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm shrink-0 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Staff Members</h2>
          <p className="text-sm text-gray-500">Select to view availability</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {nurses.map(nurse => (
            <button
              key={nurse.id}
              onClick={() => setSelectedNurseId(nurse.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                activeNurseId === nurse.id 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="w-10 h-10 rounded-full border border-gray-200 bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                {nurse.name.charAt(0)}
              </div>
              <div>
                <p className={`font-semibold text-sm ${activeNurseId === nurse.id ? 'text-blue-700' : 'text-gray-900'}`}>
                  {nurse.name}
                </p>
                <p className="text-xs text-gray-500 font-medium">{nurse.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Calendar */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNurse ? (
          <AvailabilityCalendar 
            nurse={activeNurse} 
            onUpdateAvailability={handleUpdateAvailability} 
          />
        ) : (
          <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 shadow-sm">
            Select a staff member to manage availability
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityContainer;
