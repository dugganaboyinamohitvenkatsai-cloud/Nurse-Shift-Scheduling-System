import React, { memo } from 'react';
import { cn } from '../../components/common/SkeletonLoader';

const ShiftBadge = memo(({ shift, nurse, ward, onClick, isCompact = false }) => {
  if (!shift) return null;

  const isAssigned = shift.status === 'assigned';
  
  return (
    <div 
      onClick={() => onClick && onClick(shift)}
      className={cn(
        "text-xs p-2 rounded border cursor-pointer transition-colors",
        "bg-white hover:bg-gray-50",
        isAssigned ? "border-gray-200 shadow-sm" : "border-gray-300 border-dashed bg-gray-50",
        !isCompact && "flex flex-col gap-1"
      )}
    >
      <div className="flex justify-between items-center font-semibold text-gray-700">
        <span>{shift.startTime} - {shift.endTime}</span>
        {isAssigned ? (
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
        )}
      </div>
      {!isCompact && (
        <>
          <div className="truncate text-gray-600">{ward?.name || 'Unknown Ward'}</div>
          <div className="truncate text-[11px] font-medium text-gray-500 mt-1">
            {nurse ? nurse.name : 'Unassigned'}
          </div>
        </>
      )}
    </div>
  );
});

ShiftBadge.displayName = 'ShiftBadge';
export default ShiftBadge;
