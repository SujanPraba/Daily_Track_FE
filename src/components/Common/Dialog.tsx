import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullscreen';
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-3xl',
    'full': 'max-w-6xl',
    'fullscreen': 'max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh]'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className={`inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle sm:w-full ${size === 'fullscreen' ? 'sm:my-2' : ''}`} style={{ maxWidth: size === 'fullscreen' ? '98vw' : '95vw' }}>
          <div className={`${sizeClasses[size]} mx-auto w-full ${size === 'fullscreen' ? 'h-full' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className={`px-6 py-4 ${size === 'fullscreen' ? 'h-[calc(98vh-80px)] overflow-y-auto' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;