import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateShiftModal = ({ ward, date, onClose, onSave }) => {
  const [type, setType] = useState('Day');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    setType(selected);
    if (selected === 'Day') {
      setStartTime('07:00');
      setEndTime('19:00');
    } else {
      setStartTime('19:00');
      setEndTime('07:00');
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        wardId: ward.id,
        date,
        type,
        startTime,
        endTime,
        status: 'open'
      });
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white border border-gray-200 w-full max-w-sm rounded-xl shadow-xl flex flex-col">
        
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Shift</h2>
            <p className="text-sm text-gray-500">
              {ward?.name} • {new Date(date).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
            <select 
              value={type} 
              onChange={handleTypeChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Shift'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShiftModal;
