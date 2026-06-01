import React, { useState, useContext, useMemo } from 'react';
import { ScheduleContext } from '../../context/ScheduleContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import RosterHeader from './RosterHeader';
import DailyView from './views/DailyView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';

const RosterBuilderContainer = () => {
  const { shifts, nurses, wards, loading, error } = useContext(ScheduleContext);
  const [view, setView] = useState('Weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const viewData = useMemo(() => {
    return { shifts, nurses, wards };
  }, [shifts, nurses, wards, currentDate, view]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 h-full flex flex-col">
        <SkeletonLoader className="h-16 w-full max-w-2xl bg-gray-200" />
        <SkeletonLoader className="flex-1 w-full bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <p>Error loading schedule: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <RosterHeader 
        view={view} 
        setView={setView} 
        currentDate={currentDate} 
        setCurrentDate={setCurrentDate} 
      />
      
      <div className="flex-1 mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        {view === 'Daily' && <DailyView {...viewData} currentDate={currentDate} />}
        {view === 'Weekly' && <WeeklyView {...viewData} currentDate={currentDate} />}
        {view === 'Monthly' && <MonthlyView {...viewData} currentDate={currentDate} />}
      </div>
    </div>
  );
};

export default RosterBuilderContainer;
