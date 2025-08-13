import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionMatrix } from '../../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof PermissionMatrix;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission, 
  fallback 
}) => {
  const { checkPermission } = useAuth();
  
  if (!checkPermission(requiredPermission)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            You don't have permission to view this content.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard; 