import React, { useMemo } from 'react';
import ShiftBadge from '../ShiftBadge';

const DailyView = ({ shifts, nurses, wards, currentDate }) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const dayShifts = useMemo(() => shifts.filter(s => s.date === dateString), [shifts, dateString]);

  const timeSlots = ['Morning', 'Afternoon', 'Night'];

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {timeSlots.map(slot => {
          const slotShifts = dayShifts.filter(s => s.type === slot);
          return (
            <div key={slot} className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{slot}</h3>
                <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded text-gray-600">
                  {slotShifts.length} Shifts
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3 min-h-[300px]">
                {slotShifts.length > 0 ? (
                  slotShifts.map(shift => {
                    const ward = wards.find(w => w.id === shift.wardId);
                    const nurse = nurses.find(n => n.id === shift.nurseId);
                    return (
                      <ShiftBadge 
                        key={shift.id} 
                        shift={shift} 
                        ward={ward}
                        nurse={nurse}
                      />
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <p>No shifts scheduled</p>
                  </div>
                )}
                
                <button className="mt-auto w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-500 transition-colors font-medium">
                  + Add Shift
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyView;
