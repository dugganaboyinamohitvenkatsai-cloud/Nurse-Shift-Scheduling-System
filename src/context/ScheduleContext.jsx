import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export const ScheduleContext = createContext();

const initialState = {
  shifts: [],
  nurses: [],
  wards: [],
  leaveRequests: [],
  loading: true,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        shifts: action.payload.shifts,
        nurses: action.payload.nurses,
        wards: action.payload.wards,
        leaveRequests: action.payload.leaveRequests
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.map(s => s.id === action.payload.id ? action.payload : s)
      };
    case 'ADD_SHIFT':
      return {
        ...state,
        shifts: [...state.shifts, action.payload]
      };
    case 'UPDATE_NURSE':
      return {
        ...state,
        nurses: state.nurses.map(n => n.id === action.payload.id ? action.payload : n)
      };
    case 'ADD_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: [action.payload, ...state.leaveRequests]
      };
    case 'UPDATE_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: state.leaveRequests.map(lr => lr.id === action.payload.id ? action.payload : lr)
      };
    default:
      return state;
  }
};

export const ScheduleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await api.fetchScheduleData();
      const leaveRequests = await api.fetchLeaveRequests();
      dispatch({ type: 'FETCH_SUCCESS', payload: { ...data, leaveRequests } });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignShift = async (shiftId, nurseId) => {
    // Optimistic Update
    const originalShift = state.shifts.find(s => s.id === shiftId);
    dispatch({
      type: 'UPDATE_SHIFT',
      payload: { ...originalShift, nurseId, status: 'assigned' }
    });
    
    try {
      const updatedShift = await api.assignShift(shiftId, nurseId);
      dispatch({ type: 'UPDATE_SHIFT', payload: updatedShift });
    } catch (error) {
      dispatch({ type: 'UPDATE_SHIFT', payload: originalShift });
      throw error;
    }
  };

  const handleUpdateShift = useCallback(async (updatedShift) => {
    const result = await api.updateShift(updatedShift);
    dispatch({ type: 'UPDATE_SHIFT', payload: result });
    return result;
  }, []);

  const handleCreateShift = useCallback(async (newShift) => {
    const createdShift = await api.createShift(newShift);
    dispatch({ type: 'ADD_SHIFT', payload: createdShift });
    return createdShift;
  }, []);

  const handleUpdateAvailability = useCallback(async (nurseId, date, status) => {
    const nurse = state.nurses.find(n => n.id === nurseId);
    const updatedNurse = await api.updateAvailability(nurseId, date, status);
    dispatch({ type: 'UPDATE_NURSE', payload: updatedNurse });
  }, [state.nurses]);

  const handleSubmitLeave = useCallback(async (requestData) => {
    const newRequest = await api.submitLeaveRequest(requestData);
    dispatch({ type: 'ADD_LEAVE_REQUEST', payload: newRequest });
    return newRequest;
  }, []);

  const handleUpdateLeaveStatus = useCallback(async (id, status) => {
    const updated = await api.updateLeaveRequestStatus(id, status);
    dispatch({ type: 'UPDATE_LEAVE_REQUEST', payload: updated });
    return updated;
  }, []);

  return (
    <ScheduleContext.Provider value={{ 
        ...state, 
        loadData, 
        handleAssignShift, 
        handleUpdateShift,
        handleCreateShift, 
        handleUpdateAvailability,
        handleSubmitLeave,
        handleUpdateLeaveStatus
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};
