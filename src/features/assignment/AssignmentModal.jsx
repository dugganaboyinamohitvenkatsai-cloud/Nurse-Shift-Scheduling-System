import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Search, ShieldCheck } from 'lucide-react';
import { cn } from '../../components/common/SkeletonLoader';

const AssignmentModal = ({ shift, ward, nurses, onClose, onSave }) => {
  const [selectedNurseId, setSelectedNurseId] = useState(shift?.nurseId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!shift) return null;

  const filteredNurses = nurses.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNurse = nurses.find(n => n.id === selectedNurseId);
  const isSkillMismatch = selectedNurse && ward?.requiredSkill && selectedNurse.type !== ward.requiredSkill && selectedNurse.type !== 'RN'; // Assume RN can do anything

  const handleSave = async () => {
    if (!selectedNurseId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(shift.id, selectedNurseId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign shift.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white border border-gray-200 w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Assign Nurse</h2>
            <p className="text-sm text-gray-500">
              {ward?.name} • {shift.type} ({shift.startTime} - {shift.endTime})
            </p>
            {ward?.requiredSkill && (
              <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 inline-block px-2 py-1 rounded border border-blue-200">
                Required Skill: {ward.requiredSkill}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isSkillMismatch && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3 text-orange-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-orange-600" />
            <p>Skill Mismatch: This ward requires {ward.requiredSkill}, but you selected a {selectedNurse.type}.</p>
          </div>
        )}

        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-2 custom-scrollbar">
          {filteredNurses.map(nurse => {
            const isSelected = selectedNurseId === nurse.id;
            const isMatch = ward?.requiredSkill === nurse.type || nurse.type === 'RN';
            
            return (
              <div 
                key={nurse.id}
                onClick={() => !isSubmitting && setSelectedNurseId(nurse.id)}
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors",
                  isSelected 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-gray-200 bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    {nurse.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{nurse.name}</p>
                      {isMatch && <ShieldCheck className="w-4 h-4 text-green-500" title="Skill Match" />}
                    </div>
                    <p className="text-xs text-gray-500">{nurse.type} • {nurse.availableHours}h avail.</p>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
            );
          })}
          {filteredNurses.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No nurses found.</p>
          )}
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
            disabled={!selectedNurseId || isSubmitting || selectedNurseId === shift.nurseId}
            className={cn(
              "px-5 py-2.5 text-sm font-bold text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
              isSkillMismatch ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting ? 'Assigning...' : (isSkillMismatch ? 'Assign Anyway' : 'Confirm Assignment')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
