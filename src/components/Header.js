import React from 'react';
import { Car, Users, BarChart3, Bell } from 'lucide-react';

const Header = ({ 
  currentView, 
  setCurrentView, 
  unreadCount, 
  showNotifications, 
  setShowNotifications 
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Smart Parking</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'driver' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setCurrentView('driver')}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Driver
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'admin' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setCurrentView('admin')}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Admin
            </button>
            
            <button
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;