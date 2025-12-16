import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { PERMISSION_OPERATOR, PermissionType } from '@/enums';
import type { IconNameType } from '@/stories/Common/Icon';

export type PermissionOperator = PERMISSION_OPERATOR.AND | PERMISSION_OPERATOR.OR;

export interface SidebarMenuItem {
  icon: IconNameType;
  label: string;
  path: string;
  roles: string[];
  childRoute?: SidebarMenuItem[];
  elementId?: string;
  requiredPermissions?:
    | {
        [role: string]: {
          permissions: string[];
          operator?: PermissionOperator;
        };
      }
    | string[];
  defaultPermissions?: string[];
  permissionOperator?: PermissionOperator;
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  {
    icon: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.CLIENT_DASHBOARD.path,
    roles: [UserRole.CLIENT],
    elementId: 'tour-sidebar-dashboard',
  },
  {
    icon: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.THERAPIST_DASHBOARD.path,
    roles: [UserRole.THERAPIST],
  },
  {
    icon: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.ADMIN_DASHBOARD.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    // requiredPermissions: {
    //   [UserRole.BACKOFFICE]: {
    //     permissions: [
    //       PermissionType.PATIENT_VIEW,
    //       PermissionType.THERAPIST_VIEW,
    //       PermissionType.APPOINTMENT_VIEW,
    //       PermissionType.ASSESSMENT_FORM_VIEW,
    //     ],
    //     operator: PERMISSION_OPERATOR.OR,
    //   },
    // },
  },

  {
    icon: 'transaction',
    label: 'Transactions',
    path: ROUTES.TRANSACTION.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.TRANSACTIONS_VIEW],
      },
    },
  },

  {
    icon: 'client',
    label: 'Client Management',
    path: ROUTES.CLIENT_MANAGEMENT.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.PATIENT_VIEW],
      },
    },
  },

  {
    icon: 'therapist',
    label: 'Therapist Management',
    path: ROUTES.THERAPIST_MANAGEMENT.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.THERAPIST_VIEW],
      },
    },
  },

  {
    icon: 'list',
    label: 'Appointment List',
    path: ROUTES.APPOINTMENT.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.APPOINTMENT_VIEW],
      },
    },
  },

  {
    icon: 'queue',
    label: 'Queue',
    path: ROUTES.ADMIN_BACKOFFICE_QUEUE.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.BACKOFFICE_QUEUE_VIEW],
      },
    },
  },

  // Admin Staff  - Only for admin
  {
    icon: 'adminStaff',
    label: 'Admin Staff',
    path: ROUTES.ROLE_PERMISSION.path,
    roles: [UserRole.ADMIN],
    childRoute: [
      {
        icon: 'securityUser',
        label: 'Role & Permission',
        path: ROUTES.ROLE_PERMISSION.path,
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'staffmanagement',
        label: 'Staff Management',
        path: ROUTES.STAFF_MANAGEMENT.path,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    icon: 'appointment',
    label: 'All Appointments',
    path: ROUTES.APPOINTMENT.path,
    roles: [UserRole.THERAPIST],
  },
  {
    icon: 'appointment',
    label: 'My Appointments',
    path: ROUTES.APPOINTMENT.path,
    roles: [UserRole.CLIENT],
    elementId: 'tour-sidebar-myappointment',
  },

  // manage - Only for admin
  // {
  //   icon: 'appointment',
  //   label: 'Management',
  //   path: ROUTES.MANAGEMENT.path,
  //   roles: [UserRole.ADMIN],
  // },

  {
    icon: 'appointment',
    label: 'Management',
    path: ROUTES.AREA_OF_FOCUS.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    childRoute: [
      {
        icon: 'brain',
        label: 'Area of Focus',
        path: ROUTES.AREA_OF_FOCUS.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.AREA_OF_FOCUS_VIEW],
          },
        },
      },
      {
        icon: 'widget',
        label: 'Widgets',
        path: ROUTES.REMINDER_WIDGETS.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.WIDGETS_VIEW],
          },
        },
      },
      {
        icon: 'alertTag',
        label: 'Alert Tags',
        path: ROUTES.TAG.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.ALERT_TAGS_VIEW],
          },
        },
      },
      {
        icon: 'sessionTag',
        label: 'Session Tags',
        path: ROUTES.SESSION_TAG.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.SESSION_TAGS_VIEW],
          },
        },
      },
      {
        icon: 'clinicaddress',
        label: 'Clinic Addresses',
        path: ROUTES.CLINIC_ADDRESSES.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.CLINIC_ADDRESSES_VIEW],
          },
        },
      },
      {
        icon: 'agreement',
        label: 'Agreement',
        path: ROUTES.AGREEMENT.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.AGREEMENTS_VIEW],
          },
        },
      },
    ],
  },

  {
    icon: 'note',
    label: 'Assessment Forms',
    path: ROUTES.ASSESSMENT_FORM.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.ASSESSMENT_FORM_VIEW],
      },
    },
  },

  {
    icon: 'amd',
    label: 'AMD',
    path: ROUTES.AMD_APPOINTMENTS_TYPES.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    childRoute: [
      {
        icon: 'staffmanagement',
        label: 'Appointments Types',
        path: ROUTES.AMD_APPOINTMENTS_TYPES.path,
        roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
        defaultPermissions: [UserRole.ADMIN],
        requiredPermissions: {
          [UserRole.BACKOFFICE]: {
            permissions: [PermissionType.APPOINTMENT_TYPES_VIEW],
          },
        },
      },
    ],
  },

  {
    icon: 'thirdPartyLog',
    label: 'Third Party Logs',
    path: ROUTES.THIRD_PARTY_API_LOGS.path,
    roles: [UserRole.ADMIN, UserRole.BACKOFFICE],
    defaultPermissions: [UserRole.ADMIN],
    requiredPermissions: {
      [UserRole.BACKOFFICE]: {
        permissions: [PermissionType.THIRD_PARTY_LOGS_VIEW],
      },
    },
  },

  // My Client - Only for therapist
  {
    icon: 'client',
    label: 'My Clients',
    path: ROUTES.MY_CLIENT.path,
    roles: [UserRole.THERAPIST],
  },

  // Calendar - Available for all roles
  {
    icon: 'calendar',
    label: 'Calendar',
    path: ROUTES.CALENDAR.path,
    roles: [UserRole.THERAPIST],
  },

  // Transaction - Only for client and admin
  {
    icon: 'transaction',
    label: 'Transactions',
    path: ROUTES.TRANSACTION.path,
    roles: [UserRole.CLIENT],
    elementId: 'tour-sidebar-transaction',
  },

  // Chat - Available for all roles
  {
    icon: 'chat',
    label: 'Chat',
    path: ROUTES.CHAT.path,
    roles: [UserRole.CLIENT, UserRole.THERAPIST],
  },

  // // Settings - Available for all roles
  // {
  //   icon: 'settings',
  //   label: 'Settings',
  //   path: ROUTES.SETTINGS.path,
  //   roles: [UserRole.THERAPIST, UserRole.ADMIN],
  // },

  {
    icon: 'settings',
    label: 'Preferences',
    path: ROUTES.GENERAL_SETTING.path,
    roles: [UserRole.CLIENT],
    elementId: 'tour-sidebar-preferences',
    childRoute: [
      {
        icon: 'generalsetting',
        label: 'General Setting',
        path: ROUTES.GENERAL_SETTING.path,
        roles: [UserRole.CLIENT],
        elementId: 'tour-sidebar-generalsetting',
      },
      {
        icon: 'paymentmethod',
        label: 'Payment Method',
        path: ROUTES.PAYMENT_METHOD.path,
        roles: [UserRole.CLIENT],
      },
      {
        icon: 'myagreement',
        label: 'My Agreements',
        path: ROUTES.MY_AGREEMENTS.path,
        roles: [UserRole.CLIENT],
        elementId: 'tour-sidebar-myagreement',
      },
      {
        icon: 'sessionducuments',
        label: 'Session Documents',
        path: ROUTES.SESSION_DOCUMENTS.path,
        roles: [UserRole.CLIENT],
        elementId: 'tour-sidebar-sessionducuments',
      },
    ],
  },
];

export const getMenuItemsByRole = (
  userRole: string,
  userPermissions?: string[]
): SidebarMenuItem[] => {
  const checkPermissions = (item: SidebarMenuItem): boolean => {
    // Check if user has default permissions
    if (item.defaultPermissions?.includes(userRole)) {
      return true;
    }

    // Check required permissions
    if (!item.requiredPermissions) {
      return true;
    }

    // Handle array format (legacy)
    if (Array.isArray(item.requiredPermissions)) {
      const operator = item.permissionOperator || PERMISSION_OPERATOR.AND;
      return operator === PERMISSION_OPERATOR.AND
        ? item.requiredPermissions.every(p => userPermissions?.includes(p))
        : item.requiredPermissions.some(p => userPermissions?.includes(p));
    }

    // Handle object format with role-specific permissions
    const rolePermissions = item.requiredPermissions[userRole];
    if (!rolePermissions) {
      return true;
    }

    const { permissions, operator = PERMISSION_OPERATOR.AND } = rolePermissions;
    return operator === PERMISSION_OPERATOR.AND
      ? permissions.every(p => userPermissions?.includes(p))
      : permissions.some(p => userPermissions?.includes(p));
  };

  const filterMenuItems = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
    return items
      .map(item => {
        let filteredChildren: SidebarMenuItem[] | undefined = undefined;
        if (item.childRoute) {
          filteredChildren = filterMenuItems(item.childRoute);
        }

        const includeItem =
          item.roles.includes(userRole) &&
          checkPermissions(item) &&
          (!item.childRoute || (filteredChildren && filteredChildren.length > 0));

        if (!includeItem) {
          return null;
        }
        return {
          ...item,
          childRoute: filteredChildren,
        };
      })
      .filter(Boolean) as SidebarMenuItem[];
  };

  return filterMenuItems(sidebarMenuItems);
};
