import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Clock, CalendarCheck, LayoutDashboard, User, LogOut, History, Bell, CheckCircle } from 'lucide-react';
import { cn } from '../common/SkeletonLoader';
import { AuthContext } from '../../context/AuthContext';
import { fetchNotifications, markNotificationRead } from '../../services/api';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifs = async () => {
      if (user) {
        try {
          const data = await fetchNotifications();
          setNotifications(data);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      }
    };
    loadNotifs();
    // Poll every 15 seconds
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => n.read === 0).length;

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
    { path: '/swaps', label: 'Swap Board', icon: Users },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNavItems : nurseNavItems;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50">
        
        {/* Top bar for notifications */}
        <div className="h-16 flex items-center justify-end px-6 border-b border-gray-200 bg-white shrink-0 relative">
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
            
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {notifications.map(n => (
                        <li key={n.id} className={cn("p-4 hover:bg-gray-50 transition-colors flex gap-3", n.read === 0 ? "bg-blue-50/30" : "")}>
                          <div className="mt-0.5">
                            <div className={cn("w-2 h-2 rounded-full", n.read === 0 ? "bg-blue-500" : "bg-transparent")}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">{n.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                          {n.read === 0 && (
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className="text-blue-600 hover:text-blue-800 shrink-0 self-start"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
