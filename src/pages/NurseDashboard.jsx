import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ScheduleContext } from '../context/ScheduleContext';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

const NurseDashboard = () => {
  const { user } = useContext(AuthContext);
  const { shifts, leaveRequests, handleSubmitLeave } = useContext(ScheduleContext);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Find nurse ID based on username (mock logic since login is simple)
  // Assuming 'nurse' logs in as 'Alice Smith' (n1) for demo purposes
  const myNurseId = 'n1'; 
  
  const myShifts = shifts.filter(s => s.nurseId === myNurseId).sort((a, b) => new Date(a.date) - new Date(b.date));
  const myLeaves = leaveRequests.filter(lr => lr.nurseId === myNurseId);

  const onSubmitLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;
    
    setIsSubmitting(true);
    setMessage('');
    try {
      await handleSubmitLeave({ nurseId: myNurseId, startDate, endDate, reason });
      setMessage('Leave request submitted successfully.');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      setMessage('Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
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
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nurse Portal</h1>
        <p className="text-gray-500 text-lg">Welcome back, {user?.username}. Here is your schedule and leave portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Upcoming Shifts */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> My Upcoming Shifts
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {myShifts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No upcoming shifts.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {myShifts.map(shift => (
                  <li key={shift.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">
                        {new Date(shift.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                        {shift.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {shift.startTime} - {shift.endTime}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: Leave Requests */}
        <div className="space-y-8">
          
          {/* Submit Leave Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" /> Request Leave
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              {message && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded border border-blue-200 text-sm font-medium">
                  {message}
                </div>
              )}
              <form onSubmit={onSubmitLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                      type="date" 
                      required
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea 
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Provide a reason for your leave..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm w-full disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Leave History */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leave History</h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {myLeaves.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No leave requests found.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {myLeaves.map(lr => (
                    <li key={lr.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{new Date(lr.startDate).toLocaleDateString()} - {new Date(lr.endDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{lr.reason}</p>
                        </div>
                        {getStatusBadge(lr.status)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
