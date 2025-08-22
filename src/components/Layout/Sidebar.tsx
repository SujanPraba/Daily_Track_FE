import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Shield,
  Key,
  Folder,
  Calendar,
  LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Folder,
      roles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
    },
    {
      name: 'Teams',
      href: '/teams',
      icon: Users,
      roles: ['SUPER_ADMIN', 'PROJECT_MANAGER']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'Permissions',
      href: '/permissions',
      icon: Key,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'Role Mapping',
      href: '/roles',
      icon: Shield,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'Daily Updates',
      href: '/daily-updates',
      icon: Calendar,
      roles: ['SUPER_ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/auth/login';
  };

  const hasPermission = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  const filteredMenuItems = menuItems.filter(item => !hasPermission(item.roles));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Daily Tracker</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors',
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => {
                      onClose();
                    }}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;