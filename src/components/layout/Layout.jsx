import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Clock, CalendarCheck, LayoutDashboard, User, LogOut, History } from 'lucide-react';
import { cn } from '../common/SkeletonLoader';
import { AuthContext } from '../../context/AuthContext';

/**
 * Course Alignment: CO1 (Reusable UI design)
 * 
 * Purpose:
 * The Layout component provides the common sidebar navigation for all protected pages.
 * It uses the AuthContext to conditionally render links (Admin vs Nurse) and provides
 * a logout mechanism.
 */

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define navigation items based on user role
  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/roster', label: 'Roster Builder', icon: CalendarDays },
    { path: '/shifts', label: 'Shift Assignment', icon: Users },
    { path: '/availability', label: 'Availability', icon: CalendarCheck },
    { path: '/overtime', label: 'Overtime Tracker', icon: Clock },
    { path: '/leaves', label: 'Leave Requests', icon: CalendarCheck },
    { path: '/history', label: 'Schedule History', icon: History },
  ];

  const nurseNavItems = [
    { path: '/nurse-dashboard', label: 'My Schedule', icon: LayoutDashboard },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNavItems : nurseNavItems;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Simple White Panel */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 text-blue-600">
            <CalendarCheck className="w-6 h-6" />
            <h1 className="text-lg font-bold tracking-tight">NexusSchedule</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150",
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate capitalize">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Plain background */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
