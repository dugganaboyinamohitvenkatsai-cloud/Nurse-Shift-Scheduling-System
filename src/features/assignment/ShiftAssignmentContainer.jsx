import React, { useContext, useState, useMemo, useCallback } from 'react';
import { ScheduleContext } from '../../context/ScheduleContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ShiftCard from './ShiftCard';
import AssignmentModal from './AssignmentModal';
import { Filter, CheckCircle2 } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const ShiftAssignmentContainer = () => {
  const { shifts, nurses, wards, loading, error, handleAssignShift } = useContext(ScheduleContext);
  const [filter, setFilter] = useState('all'); 
  const [activeShiftId, setActiveShiftId] = useState(null);

  const filteredShifts = useMemo(() => {
    let result = shifts;
    if (filter === 'unassigned') {
      result = shifts.filter(s => s.status !== 'assigned');
    }
    return result.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'assigned' ? 1 : -1;
      return new Date(a.date) - new Date(b.date);
    });
  }, [shifts, filter]);

  const activeShift = useMemo(() => 
    shifts.find(s => s.id === activeShiftId), 
  [shifts, activeShiftId]);

  const openModal = useCallback((shift) => setActiveShiftId(shift.id), []);
  const closeModal = useCallback(() => setActiveShiftId(null), []);

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col gap-6">
        <SkeletonLoader className="h-10 w-64 bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-64 rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-600">Error loading data: {error}</div>;

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shift Assignment</h1>
          <p className="text-gray-500 mt-1">Manage and assign nurses to open shifts.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-300 shadow-sm">
          <div className="pl-3 pr-2 text-gray-400">
            <Filter className="w-4 h-4" />
          </div>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              filter === 'all' ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            All Shifts
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
              filter === 'unassigned' ? "bg-gray-100 text-gray-900 shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Unassigned
            <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full">
              {shifts.filter(s => s.status !== 'assigned').length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
        {filteredShifts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">All shifts are assigned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShifts.map(shift => (
              <ShiftCard 
                key={shift.id} 
                shift={shift} 
                ward={wards.find(w => w.id === shift.wardId)}
                nurse={nurses.find(n => n.id === shift.nurseId)}
                onAssign={openModal}
              />
            ))}
          </div>
        )}
      </div>

      {activeShift && (
        <AssignmentModal 
          shift={activeShift}
          ward={wards.find(w => w.id === activeShift.wardId)}
          nurses={nurses}
          onClose={closeModal}
          onSave={handleAssignShift}
        />
      )}
    </div>
  );
};

export default ShiftAssignmentContainer;
