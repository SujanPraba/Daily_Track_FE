import React from 'react';
import { LucideIcon } from 'lucide-react';
import { classNames } from '../../utils/classNames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    label,
    error,
    helperText,
    className,
    id,
    icon: Icon,
    iconPosition = 'left',
    ...rest
  } = props;

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || rest.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className={classNames(
            'block w-full rounded-lg border shadow-sm py-2.5',
            Icon && iconPosition === 'left' ? 'pl-10 pr-3' : 'px-3',
            Icon && iconPosition === 'right' ? 'pr-10 pl-3' : 'px-3',
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500',
            className
          )}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;