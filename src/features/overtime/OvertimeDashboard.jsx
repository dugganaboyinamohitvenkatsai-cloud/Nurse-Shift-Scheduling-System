import React, { useMemo } from 'react';
import { Clock, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const OvertimeDashboard = ({ data }) => {
  const aggregates = useMemo(() => {
    const totalWorked = data.reduce((sum, n) => sum + n.workedHours, 0);
    const totalOvertime = data.reduce((sum, n) => sum + n.overtimeHours, 0);
    const nursesInOvertime = data.filter(n => n.overtimeHours > 0).length;
    
    return { totalWorked, totalOvertime, nursesInOvertime };
  }, [data]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.overtimeHours - a.overtimeHours);
  }, [data]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-gray-50">
      <div className="mb-8 shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overtime Tracker</h1>
        <p className="text-gray-500 mt-1">Monitor working hours to ensure fair distribution and avoid burnout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <p className="text-gray-500 font-medium mb-1">Total Hours Worked</p>
          <div className="flex justify-between items-end mt-auto">
            <h2 className="text-4xl font-bold text-gray-900">{aggregates.totalWorked}<span className="text-lg text-gray-400 ml-1">hrs</span></h2>
            <Clock className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <p className="text-gray-500 font-medium mb-1">Total Overtime</p>
          <div className="flex justify-between items-end mt-auto">
            <h2 className="text-4xl font-bold text-orange-600">{aggregates.totalOvertime}<span className="text-lg text-orange-400 ml-1">hrs</span></h2>
            <TrendingUp className="w-8 h-8 text-orange-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <p className="text-gray-500 font-medium mb-1">Nurses in Overtime</p>
          <div className="flex justify-between items-end mt-auto">
            <h2 className="text-4xl font-bold text-purple-600">{aggregates.nursesInOvertime}<span className="text-lg text-purple-400 ml-1">staff</span></h2>
            <Users className="w-8 h-8 text-purple-500 opacity-80" />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Staff Breakdown</h3>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <div className="space-y-4">
            {sortedData.map((nurse) => {
              const overtimeRatio = nurse.overtimeHours / (nurse.availableHours || 40);
              const isHigh = overtimeRatio > 0.2; 

              return (
                <div key={nurse.id} className="flex items-center gap-6 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="w-12 h-12 rounded-full border border-gray-200 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {nurse.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-gray-900 truncate">{nurse.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{nurse.type}</span>
                      {isHigh && (
                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 ml-2 border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> High Risk
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-blue-500 rounded-l-full" 
                          style={{ width: `${Math.min(100, (nurse.workedHours - nurse.overtimeHours) / (nurse.availableHours || 40) * 100)}%` }}
                        />
                        {nurse.overtimeHours > 0 && (
                          <div 
                            className={cn("h-full", isHigh ? "bg-red-500" : "bg-orange-500")} 
                            style={{ width: `${Math.min(100, (nurse.overtimeHours / (nurse.availableHours || 40)) * 100)}%` }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-24 text-right">
                        {nurse.workedHours} / {nurse.availableHours} hrs
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="text-xs text-gray-500 font-medium mb-1">Overtime</p>
                    <p className={cn(
                      "text-xl font-bold",
                      nurse.overtimeHours > 0 ? (isHigh ? "text-red-600" : "text-orange-600") : "text-gray-400"
                    )}>
                      +{nurse.overtimeHours}h
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvertimeDashboard;
