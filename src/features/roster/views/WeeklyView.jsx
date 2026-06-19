import React, { useMemo } from 'react';
import ShiftBadge from '../ShiftBadge';

const WeeklyView = ({ shifts, nurses, wards, currentDate, onAddShift }) => {
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    const startOfWeek = new Date(d.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentDate]);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 custom-scrollbar">
      <div className="min-w-[900px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-4 font-bold text-gray-500 border-r border-gray-200 flex items-center justify-center uppercase text-xs">
            Ward
          </div>
          {weekDays.map((date, i) => {
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={i} className={`p-3 border-r border-gray-200 text-center ${isToday ? 'bg-blue-50' : ''}`}>
                <div className={`text-xs uppercase font-semibold ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold mt-1 ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Body Rows (Wards) */}
        <div className="flex flex-col pb-8">
          {wards.map(ward => (
            <div key={ward.id} className="grid grid-cols-8 border-b border-gray-200 group hover:bg-gray-50 transition-colors bg-white">
              <div className="p-4 font-semibold text-gray-700 border-r border-gray-200 flex items-center bg-gray-50">
                {ward.name}
              </div>
              {weekDays.map((date, i) => {
                const dateString = date.toISOString().split('T')[0];
                const dayShifts = shifts.filter(s => s.wardId === ward.id && s.date === dateString);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                  <div key={i} className={`p-2 border-r border-gray-200 min-h-[140px] flex flex-col gap-2 ${isToday ? 'bg-blue-50/30' : ''}`}>
                    {dayShifts.map(shift => (
                      <ShiftBadge 
                        key={shift.id} 
                        shift={shift} 
                        ward={ward}
                        nurse={nurses.find(n => n.id === shift.nurseId)}
                      />
                    ))}
                    {dayShifts.length === 0 && (
                      <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onAddShift(ward, dateString)}
                          className="text-xs font-medium text-gray-500 hover:text-blue-600 border border-transparent hover:border-blue-200 px-3 py-1.5 rounded-md transition-colors"
                        >
                          + Add Shift
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
