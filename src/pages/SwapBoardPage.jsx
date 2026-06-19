import React, { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { ScheduleContext } from '../context/ScheduleContext';
import { fetchSwaps, requestSwap, updateSwapStatus } from '../services/api';
import { ArrowRightLeft, Check, X, Clock } from 'lucide-react';
import SkeletonLoader from '../components/common/SkeletonLoader';

const SwapBoardPage = () => {
  const { user } = useContext(AuthContext);
  const { shifts, nurses, loading: scheduleLoading } = useContext(ScheduleContext);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: swaps = [], isLoading: swapsLoading } = useQuery({
    queryKey: ['swaps'],
    queryFn: fetchSwaps
  });

  const requestSwapMutation = useMutation({
    mutationFn: requestSwap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      setMessage("Swap request submitted successfully!");
      setTimeout(() => setMessage(''), 3000);
    }
  });

  const updateSwapMutation = useMutation({
    mutationFn: ({ id, status }) => updateSwapStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] }); // since shifts changed
      setMessage("Swap request updated!");
      setTimeout(() => setMessage(''), 3000);
    }
  });

  if (scheduleLoading || swapsLoading) {
    return <div className="p-8"><SkeletonLoader className="h-64 w-full rounded-xl bg-gray-200" /></div>;
  }

  const myNurseId = user?.nurseId;

  // Swaps requested BY me
  const myRequests = swaps.filter(s => s.requestingNurseId === myNurseId);
  
  // Available Swaps (requested by others, pending, and I am not the requester)
  const availableSwaps = swaps.filter(s => s.status === 'pending' && s.requestingNurseId !== myNurseId);

  // My future shifts that I could swap
  const myFutureShifts = shifts.filter(s => s.nurseId === myNurseId && new Date(s.date) >= new Date() && s.status === 'assigned');

  const handleRequestSwap = (shiftId) => {
    requestSwapMutation.mutate({ shiftId });
  };

  const handleClaimSwap = (swapId) => {
    updateSwapMutation.mutate({ id: swapId, status: 'approved' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-blue-600" /> Swap Board
        </h1>
        <p className="text-gray-500 text-lg">Trade shifts with your colleagues or pick up extra shifts.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Available Swaps on the board */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            Open Swap Requests
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {availableSwaps.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No open swap requests right now.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableSwaps.map(swap => {
                  const shift = shifts.find(s => s.id === swap.shiftId);
                  const requester = nurses.find(n => n.id === swap.requestingNurseId);
                  if (!shift || !requester) return null;

                  return (
                    <li key={swap.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(shift.date).toLocaleDateString()} • {shift.type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {shift.startTime} - {shift.endTime}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">Requested by: <span className="font-semibold">{requester.name}</span></p>
                        </div>
                        <button 
                          onClick={() => handleClaimSwap(swap.id)}
                          className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Claim Shift
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: My Swaps and My Shifts */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Swap Requests</h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {myRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">You haven't requested any swaps.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {myRequests.map(swap => {
                    const shift = shifts.find(s => s.id === swap.shiftId);
                    if (!shift) return null;
                    return (
                      <li key={swap.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{new Date(shift.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{shift.type} Shift</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                          swap.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          swap.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {swap.status.toUpperCase()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Post a Shift for Swap</h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {myFutureShifts.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No upcoming assigned shifts available to swap.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {myFutureShifts.map(shift => {
                    // Check if already requested
                    const alreadyRequested = swaps.some(s => s.shiftId === shift.id && s.status === 'pending');
                    return (
                      <li key={shift.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{new Date(shift.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{shift.type} Shift</p>
                        </div>
                        <button 
                          onClick={() => handleRequestSwap(shift.id)}
                          disabled={alreadyRequested || requestSwapMutation.isPending}
                          className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                        >
                          {alreadyRequested ? 'Swap Pending' : 'Request Swap'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapBoardPage;
