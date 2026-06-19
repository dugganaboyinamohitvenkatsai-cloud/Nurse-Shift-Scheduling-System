import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, HelpCircle, Palmtree } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const AvailabilityCalendar = ({ nurse, availabilityData = [], leaveRequestsData = [], onUpdateAvailability }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatus = (date) => {
    if (!date) return null;
    
    // Check if the date is within an approved leave request
    const isLeave = leaveRequestsData.some(lr => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const testDate = new Date(date);
      testDate.setHours(12, 0, 0, 0); // safe check
      return testDate >= start && testDate <= end;
    });
    
    if (isLeave) return 'on_leave';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const record = availabilityData.find(a => a.date === dateString);
    if (record) {
      return record.isAvailable === 0 ? 'unavailable' : 'available';
    }
    return 'available';
  };

  const cycleStatus = (date) => {
    const current = getStatus(date);
    if (current === 'on_leave') return; // Cannot toggle if on approved leave
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    let next = 'available';
    if (current === 'available') next = 'unavailable';

    onUpdateAvailability(dateString, next);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'available': return "bg-white text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50";
      case 'unavailable': return "bg-red-50 text-red-700 border-red-200 font-bold";
      case 'on_leave': return "bg-purple-50 text-purple-700 border-purple-200 font-bold";
      case 'preference': return "bg-green-50 text-green-700 border-green-200 font-bold";
      default: return "bg-white border-gray-200 text-gray-900";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unavailable': return <XCircle className="w-4 h-4 text-red-500 mt-1" />;
      case 'on_leave': return <Palmtree className="w-4 h-4 text-purple-500 mt-1" title="On Leave" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden relative">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{nurse.name}'s Availability</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-1.5 text-sm font-medium hover:bg-gray-100 text-gray-700 rounded-md transition-colors mx-1"
          >
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex gap-6 text-sm shrink-0">
        <div className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded-full bg-white border border-gray-300"></span> Available</div>
        <div className="flex items-center gap-2 text-red-700"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span> Unavailable</div>
        <div className="flex items-center gap-2 text-purple-700"><span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></span> On Leave</div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-0">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {daysInMonth.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="bg-gray-50 border-r border-b border-gray-200" />;

            const status = getStatus(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div
                key={i}
                onClick={() => cycleStatus(date)}
                className={cn(
                  "p-3 border-r border-b cursor-pointer transition-colors flex flex-col items-center justify-center relative group",
                  getStatusStyles(status),
                  isToday && status === 'available' ? 'bg-blue-50/50' : ''
                )}
              >
                {isToday && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-500"></div>}

                <span className={cn(
                  "text-lg",
                  isToday ? "font-bold text-blue-700" : ""
                )}>
                  {date.getDate()}
                </span>
                {getStatusIcon(status)}

                {/* Tooltip hint on hover */}
                <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                    Click to change
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
