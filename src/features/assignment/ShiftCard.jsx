import React, { memo } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const ShiftCard = memo(({ shift, ward, nurse, onAssign }) => {
  const isAssigned = shift.status === 'assigned';

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col relative overflow-hidden">
      {!isAssigned && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-4 -right-8 bg-orange-500 text-white text-[10px] font-bold px-8 py-1 rotate-45 uppercase tracking-widest">
            Open
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold tracking-wider mb-2 border border-gray-200">
            {shift.type}
          </span>
          <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mt-1">
            <Calendar className="w-4 h-4" />
            {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          <Clock className="w-4 h-4" />
          {shift.startTime} - {shift.endTime}
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-4 border border-gray-100">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-white border border-gray-200 text-gray-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Ward</p>
          <p className="text-base text-gray-800 font-semibold">{ward?.name}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isAssigned && nurse ? (
            <>
              <div className="w-10 h-10 rounded-full border border-gray-200 bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                {nurse.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{nurse.name}</p>
                <p className="text-xs text-gray-500 font-medium">{nurse.type}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-orange-600">
              <div className="w-10 h-10 rounded-full border border-orange-200 flex items-center justify-center bg-orange-50">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Needs Assignment</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onAssign(shift)}
          className={cn(
            "px-4 py-2 rounded text-sm font-bold transition-colors border",
            isAssigned 
              ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-300" 
              : "bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm"
          )}
        >
          {isAssigned ? 'Reassign' : 'Assign'}
        </button>
      </div>
    </div>
  );
});

ShiftCard.displayName = 'ShiftCard';
export default ShiftCard;
