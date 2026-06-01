import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ScheduleProvider } from './context/ScheduleContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './index.css';

/**
 * Course Alignment: CO1 (Component-based architecture), CO4 (Context API)
 * 
 * Purpose:
 * The root component of the application. It wraps the entire app with necessary
 * Context Providers (Auth and Schedule) and the BrowserRouter to enable navigation.
 * ErrorBoundary catches unexpected React crashes to prevent white screens.
 */

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ScheduleProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ScheduleProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;