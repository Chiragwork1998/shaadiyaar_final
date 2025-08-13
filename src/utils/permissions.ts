import { AccessLevel, PermissionMatrix } from '../types';

// Permission matrix for each access level
export const getPermissionMatrix = (accessCode: AccessLevel): PermissionMatrix => {
  switch (accessCode) {
    case '00-01': // Full Admin
      return {
        canViewDashboard: true,
        canViewFinancialData: true,
        canAddBookings: true,
        canEditBookings: true,
        canAddPartPayments: true,
        canEditPartPayments: true,
        canViewPayments: true,
        canViewCalendar: true,
        canManageAdmins: true,
        canApproveActions: true,
        canAccessInventory: true,
        canExportData: true,
      };

    case '02-03': // Senior Employee
      return {
        canViewDashboard: true,
        canViewFinancialData: false,
        canAddBookings: true,
        canEditBookings: false,
        canAddPartPayments: true,
        canEditPartPayments: false,
        canViewPayments: false, // Cannot view payments page
        canViewCalendar: true,
        canManageAdmins: false,
        canApproveActions: false,
        canAccessInventory: true,
        canExportData: false,
      };

    case '03-04': // Junior Employee
      return {
        canViewDashboard: true,
        canViewFinancialData: false,
        canAddBookings: true,
        canEditBookings: false,
        canAddPartPayments: true,
        canEditPartPayments: false,
        canViewPayments: false, // Cannot view payments page
        canViewCalendar: true,
        canManageAdmins: false,
        canApproveActions: false,
        canAccessInventory: false,
        canExportData: false,
      };

    case '05': // Inventory App
      return {
        canViewDashboard: false,
        canViewFinancialData: false,
        canAddBookings: false,
        canEditBookings: false,
        canAddPartPayments: false,
        canEditPartPayments: false,
        canViewPayments: false,
        canViewCalendar: false,
        canManageAdmins: false,
        canApproveActions: false,
        canAccessInventory: true,
        canExportData: false,
      };

    default:
      return {
        canViewDashboard: false,
        canViewFinancialData: false,
        canAddBookings: false,
        canEditBookings: false,
        canAddPartPayments: false,
        canEditPartPayments: false,
        canViewPayments: false,
        canViewCalendar: false,
        canManageAdmins: false,
        canApproveActions: false,
        canAccessInventory: false,
        canExportData: false,
      };
  }
};

// Check if access code is valid
export const isValidAccessCode = (accessCode: string): accessCode is AccessLevel => {
  return ['00-01', '02-03', '03-04', '05'].includes(accessCode);
};

// Get display name for access level
export const getAccessLevelDisplayName = (accessCode: AccessLevel): string => {
  switch (accessCode) {
    case '00-01': return 'System Administrator';
    case '02-03': return 'Senior Employee';
    case '03-04': return 'Junior Employee';
    case '05': return 'Inventory Manager';
    default: return 'Unknown';
  }
};

// Check if user needs approval for actions
export const requiresApproval = (accessCode: AccessLevel): boolean => {
  return ['02-03', '03-04'].includes(accessCode);
}; 