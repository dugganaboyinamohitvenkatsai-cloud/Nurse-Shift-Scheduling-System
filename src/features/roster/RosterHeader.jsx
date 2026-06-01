import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const RosterHeader = ({ view, setView, currentDate, setCurrentDate }) => {
  const views = ['Daily', 'Weekly', 'Monthly'];

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'Daily') newDate.setDate(newDate.getDate() - 1);
    if (view === 'Weekly') newDate.setDate(newDate.getDate() - 7);
    if (view === 'Monthly') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Daily') newDate.setDate(newDate.getDate() + 1);
    if (view === 'Weekly') newDate.setDate(newDate.getDate() + 7);
    if (view === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const getFormatOptions = () => {
    if (view === 'Daily') return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (view === 'Monthly') return { year: 'numeric', month: 'long' };
    return { month: 'short', year: 'numeric' }; 
  };

  const handleExportCSV = () => {
    // Simple CSV export for academic demonstration
    const headers = ['Shift ID', 'Date', 'Type', 'Start Time', 'End Time', 'Status', 'Nurse ID', 'Ward ID'];
    const mockShiftsForExport = [
      // Usually you would pass `shifts` as a prop to RosterHeader, but for simplicity we will just alert here or simulate it
    ];
    alert('Export Schedule to CSV triggered! (Academic Demo)');
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Roster Builder</h1>
        <button 
          onClick={handleExportCSV}
          className="px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors border border-green-200"
        >
          Export CSV
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Date Navigation */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 min-w-[200px] justify-center">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">
              {currentDate.toLocaleDateString(undefined, getFormatOptions())}
            </span>
          </div>
          <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={handleToday}
            className="ml-2 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors border border-blue-100"
          >
            Today
          </button>
        </div>

        {/* View Selection */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                view === v 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RosterHeader;
