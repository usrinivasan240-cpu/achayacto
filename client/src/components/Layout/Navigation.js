import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  PlusIcon, 
  MapPinIcon, 
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon }
    ];

    switch (user.role) {
      case 'donor':
        return [
          ...baseItems,
          { name: 'Donate Food', href: '/donate', icon: PlusIcon },
          { name: 'My Donations', href: '/my-donations', icon: MapPinIcon }
        ];
      case 'ngo':
        return [
          ...baseItems,
          { name: 'Available Donations', href: '/available-donations', icon: MapPinIcon },
          { name: 'My Claims', href: '/my-claims', icon: ChartBarIcon }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
          { name: 'All Donations', href: '/all-donations', icon: MapPinIcon },
          { name: 'Settings', href: '/settings', icon: CogIcon }
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <div className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                🍃 Achayapathra
              </div>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;