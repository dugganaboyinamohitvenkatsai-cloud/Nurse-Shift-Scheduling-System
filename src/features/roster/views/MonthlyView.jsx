import React, { useMemo } from 'react';
import ShiftBadge from '../ShiftBadge';

const MonthlyView = ({ shifts, nurses, wards, currentDate }) => {
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  return (
    <div className="flex-1 overflow-auto bg-white flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,auto)]">
        {daysInMonth.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="bg-gray-50 border-r border-b border-gray-200" />;
          }

          const dateString = date.toISOString().split('T')[0];
          const dayShifts = shifts.filter(s => s.date === dateString);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={i} className={`p-2 border-r border-b border-gray-200 flex flex-col gap-1 hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50/50' : ''}`}>
              <div className={`text-right text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {date.getDate()}
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                {dayShifts.map(shift => (
                  <ShiftBadge 
                    key={shift.id} 
                    shift={shift} 
                    ward={wards.find(w => w.id === shift.wardId)}
                    isCompact={true}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;
