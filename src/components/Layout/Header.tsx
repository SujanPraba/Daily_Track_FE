import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAppSelector } from '../../app/store';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-1">
          <button
            type="button"
            className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Store selector */}
          <div className="ml-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">S</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Sakura-Sales45</h3>
                <p className="text-xs text-gray-500">KPOP STORE</p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="ml-8 flex-1 max-w-2xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-gray-400">⌘F</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Date Range */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-700">
            <span>June 01 - June 31</span>
          </div>

          {/* User avatars */}
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center ring-2 ring-white">
              <span className="text-sm font-medium text-orange-600">JD</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white">
              <span className="text-sm font-medium text-blue-600">KM</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-white">
              <span className="text-sm font-medium text-green-600">AL</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ring-2 ring-white">
              <span className="text-sm font-medium text-purple-600">+2</span>
            </div>
          </div>

          {/* Share button */}
          <button
            type="button"
            className="rounded-lg bg-orange-50 p-2 text-orange-600 hover:bg-orange-100 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;