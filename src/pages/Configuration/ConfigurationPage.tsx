import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder,
  Users,
  Key,
  Shield,
  User,
  Layers,
  ArrowRight,
  Settings
} from 'lucide-react';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';

const ConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const { userCompleteInformation } = useUserCompleteInformation();
  const userPermissions = userCompleteInformation?.commonPermissions || [];



  const configurationCards = [
    {
      title: 'Modules',
      description: 'Configure system modules and their functionalities',
      icon: Layers,
      href: '/modules',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      permission: 'VIEW_MODULE_MANAGEMENT'
    },
    {
      title: 'Permissions',
      description: 'Set up system permissions and access control rules',
      icon: Key,
      href: '/permissions',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      permission: 'VIEW_PERMISSION_MANAGEMENT'
    },
    {
      title: 'Roles',
      description: 'Define user roles and their associated permissions',
      icon: Shield,
      href: '/roles',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      permission: 'VIEW_ROLE_MANAGEMENT'
    },
    {
      title: 'Projects',
      description: 'Manage project configurations, settings, and assignments',
      icon: Folder,
      href: '/projects',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      permission: 'VIEW_PROJECT_MANAGEMENT'
    },
    {
      title: 'Teams',
      description: 'Configure team structures, members, and project assignments',
      icon: Users,
      href: '/teams',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      permission: 'VIEW_TEAM_MANAGEMENT'
    },
    {
      title: 'Users',
      description: 'Manage user accounts, profiles, and assignments',
      icon: User,
      href: '/users',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      permission: 'VIEW_USER_MANAGEMENT'
    },
  ];
  const filteredConfigurationCards = configurationCards.filter(card => {
    return userPermissions.includes(card.permission || '');
  });

  const handleCardClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Settings className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
            <p className="text-gray-600 mt-1">
              Manage system settings, projects, teams, and user configurations
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConfigurationCards.map((card) => (
          <div
            key={card.title}
            onClick={() => handleCardClick(card.href)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${card.color} ${card.hoverColor} transition-colors duration-200`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors transform group-hover:translate-x-1" />
            </div>

            {/* Hover effect overlay */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                  Click to configure
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ConfigurationPage;
