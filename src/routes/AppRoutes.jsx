import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import NurseDashboard from '../pages/NurseDashboard';
import RosterBuilderContainer from '../features/roster/RosterBuilderContainer';
import ShiftAssignmentContainer from '../features/assignment/ShiftAssignmentContainer';
import OvertimeTrackerContainer from '../features/overtime/OvertimeTrackerContainer';
import AvailabilityContainer from '../features/availability/AvailabilityContainer';
import LeaveRequestsContainer from '../features/leave/LeaveRequestsContainer';
import ScheduleHistoryContainer from '../features/history/ScheduleHistoryContainer';
import ProfilePage from '../pages/ProfilePage';
import SwapBoardPage from '../pages/SwapBoardPage';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Loading Application...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/nurse-dashboard'} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route 
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/roster" element={<RosterBuilderContainer />} />
        <Route path="/shifts" element={<ShiftAssignmentContainer />} />
        <Route path="/availability" element={<AvailabilityContainer />} />
        <Route path="/overtime" element={<OvertimeTrackerContainer />} />
        <Route path="/leaves" element={<LeaveRequestsContainer />} />
        <Route path="/history" element={<ScheduleHistoryContainer />} />
        <Route path="/profile" element={<div className="p-8 text-gray-900"><h1 className="text-3xl font-bold">Admin Profile</h1><p className="text-gray-500 mt-2">Manage your account settings here.</p></div>} />
      </Route>

      <Route 
        element={
          <ProtectedRoute allowedRole="NURSE">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/swaps" element={<SwapBoardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
