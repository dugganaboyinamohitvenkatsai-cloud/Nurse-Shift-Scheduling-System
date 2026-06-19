import React, { createContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: nurses = [], isLoading: loadingNurses, error: errorNurses } = useQuery({ queryKey: ['nurses'], queryFn: api.fetchNurses });
  const { data: wards = [], isLoading: loadingWards, error: errorWards } = useQuery({ queryKey: ['wards'], queryFn: api.fetchWards });
  const { data: shifts = [], isLoading: loadingShifts, error: errorShifts } = useQuery({ queryKey: ['shifts'], queryFn: api.fetchShifts });
  const { data: leaveRequests = [], isLoading: loadingLeaves, error: errorLeaves } = useQuery({ queryKey: ['leaves'], queryFn: api.fetchLeaves });

  const loading = loadingNurses || loadingWards || loadingShifts || loadingLeaves;
  const error = errorNurses || errorWards || errorShifts || errorLeaves ? 'Error loading data' : null;

  const loadData = () => {
    queryClient.invalidateQueries();
  };

  const updateShiftMutation = useMutation({
    mutationFn: (data) => api.updateShift(data.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const createShiftMutation = useMutation({
    mutationFn: api.createShift,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const createLeaveMutation = useMutation({
    mutationFn: api.createLeave,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const updateLeaveStatusMutation = useMutation({
    mutationFn: (data) => api.updateLeaveStatus(data.id, data.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const handleAssignShift = async (shiftId, nurseId) => {
    return updateShiftMutation.mutateAsync({ id: shiftId, nurseId, status: 'assigned' });
  };

  const handleUpdateShift = async (updatedShift) => {
    return updateShiftMutation.mutateAsync(updatedShift);
  };

  const handleCreateShift = async (newShift) => {
    return createShiftMutation.mutateAsync(newShift);
  };

  const handleUpdateAvailability = async (nurseId, date, status) => {
    // Currently not fully supported by backend
    console.warn('Availability update not fully implemented in API');
  };

  const handleSubmitLeave = async (requestData) => {
    return createLeaveMutation.mutateAsync(requestData);
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    return updateLeaveStatusMutation.mutateAsync({ id, status });
  };

  return (
    <ScheduleContext.Provider value={{ 
        shifts, nurses, wards, leaveRequests, loading, error,
        loadData, handleAssignShift, handleUpdateShift,
        handleCreateShift, handleUpdateAvailability,
        handleSubmitLeave, handleUpdateLeaveStatus
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
