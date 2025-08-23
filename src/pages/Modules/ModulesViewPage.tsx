import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetModuleByIdQuery } from '../../features/modules/modulesApi';
import { Module } from '../../types/module';
import { Permission } from '../../types/permission';
import { ChevronDown, ChevronRight, Shield, Key, Check } from 'lucide-react';

const ModulesViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const { data: moduleResponse, isLoading: isLoadingModule } = useGetModuleByIdQuery(id || '');
  console.log(moduleResponse);

  const module = moduleResponse;
  const permissions = module?.permissions || [];

  useEffect(() => {
    // Permissions are loaded with the module
  }, []);

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const filteredPermissions = permissions.filter((permission: Permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingModule) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Module Not Found</h2>
          <p className="text-gray-500">The requested module could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{module.name}</h1>
          <p className="text-sm text-gray-500">{module.code}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {module.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Module Description */}
      {module.description && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600">{module.description}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Permissions</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search permissions..."
            className="block w-full rounded-lg py-2 px-3 border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Permissions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Permissions ({filteredPermissions.length})</h2>
        </div>

        <div className="p-6">
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No permissions found for this module.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPermissions.map((permission: Permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permission.isActive || selectedPermissions.has(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="font-medium text-gray-900">{permission.name}</div>
                        {permission.description && (
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    permission.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {permission.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Permissions Summary */}
      {selectedPermissions.size > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Selected Permissions ({selectedPermissions.size})
          </h3>
          <div className="text-sm text-gray-600">
            {Array.from(selectedPermissions).map(permissionId => {
              const permission = permissions.find((p: Permission) => p.id === permissionId);
              return permission ? (
                <div key={permissionId} className="flex items-center space-x-2 py-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{permission.name}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesViewPage;
