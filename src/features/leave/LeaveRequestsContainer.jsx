import React, { useContext, useState } from 'react';
import { ScheduleContext } from '../../context/ScheduleContext';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

const LeaveRequestsContainer = () => {
  const { leaveRequests, nurses, handleUpdateLeaveStatus, loading } = useContext(ScheduleContext);
  const [processingId, setProcessingId] = useState(null);

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col gap-4">
        <SkeletonLoader className="h-10 w-64 bg-gray-200" />
        <SkeletonLoader className="h-32 w-full rounded-xl bg-gray-200" />
        <SkeletonLoader className="h-32 w-full rounded-xl bg-gray-200" />
      </div>
    );
  }

  const handleStatusChange = async (id, status) => {
    setProcessingId(id);
    try {
      await handleUpdateLeaveStatus(id, status);
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold border border-green-200">Approved</span>;
      case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold border border-red-200">Rejected</span>;
      default: return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold border border-orange-200">Pending</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-gray-50">
      <div className="mb-6 shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage staff time-off requests.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-4 max-w-4xl">
          {leaveRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">No leave requests found.</div>
          ) : (
            leaveRequests.map(lr => {
              const nurse = nurses.find(n => n.id === lr.nurseId);
              const isPending = lr.status === 'pending';
              
              return (
                <div key={lr.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 rounded-full border border-gray-200 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                      {nurse ? nurse.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">{nurse ? nurse.name : 'Unknown Nurse'}</p>
                      <p className="text-xs font-medium text-gray-500">{nurse ? nurse.type : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Reason: <span className="italic">{lr.reason}</span></p>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {getStatusBadge(lr.status)}
                    
                    {isPending && (
                      <div className="flex gap-2">
                        <button 
                          disabled={processingId === lr.id}
                          onClick={() => handleStatusChange(lr.id, 'approved')}
                          className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded text-sm font-medium border border-green-200 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button 
                          disabled={processingId === lr.id}
                          onClick={() => handleStatusChange(lr.id, 'rejected')}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm font-medium border border-red-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsContainer;
