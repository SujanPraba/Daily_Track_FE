import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  const breadcrumbNames: { [key: string]: string } = {
    'users': 'Users',
    'roles': 'Roles',
    'permissions': 'Permissions',
    'projects': 'Projects',
    'teams': 'Teams',
    'daily-updates': 'Daily Updates',
    'reports': 'Reports',
    'settings': 'Settings',
    'create': 'Create',
    'edit': 'Edit',
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = breadcrumbNames[pathname] || pathname;

          return (
            <li key={pathname} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-300 mx-2" />
              {isLast ? (
                <span className="text-sm font-medium text-gray-500">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;