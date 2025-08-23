import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAppSelector } from '../../app/store';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-end px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* User Info */}
          <div className="ml-4 flex items-center justify-end space-x-4">
            <div className="flex items-center justify-end space-x-3">
              {/* User Avatar */}
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-md font-semibold text-orange-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>

              {/* User Name */}
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-[12px] text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </header>
  );
};

export default Header;