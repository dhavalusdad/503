import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import type { IconNameType } from '@/stories/Common/Icon';

export interface SidebarMenuItem {
  icon: IconNameType;
  label: string;
  path: string;
  roles: string[];
  childRoute?: SidebarMenuItem[];
  requiredPermissions?: string[];
}

export const sidebarMenuItems: SidebarMenuItem[] = [
  // Dashboard - Available for all roles
  // {
  //   icon: 'dashboard',
  //   label: 'Dashboard',
  //   path: ROUTES.DASHBOARD.path,
  //   roles: [UserRole.CLIENT, UserRole.THERAPIST, UserRole.ADMIN],
  // },

  {
    icon: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.CLIENT_DASHBOARD.path,
    roles: [UserRole.CLIENT],
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
  },

  // admin transaction - Only for admin
  {
    icon: 'transaction',
    label: 'Transactions',
    path: ROUTES.TRANSACTION.path,
    roles: [UserRole.ADMIN],
  },
  {
    icon: 'transaction',
    label: 'Transactions',
    path: ROUTES.TRANSACTION.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.TRANSACTIONS_VIEW],
  },

  // User Management - Only for admin
  {
    icon: 'client',
    label: 'Client Management',
    path: ROUTES.CLIENT_MANAGEMENT.path,
    roles: [UserRole.ADMIN],
  },

  // Therapist Management - Only for admin
  {
    icon: 'therapist',
    label: 'Therapist Management',
    path: ROUTES.THERAPIST_MANAGEMENT.path,
    roles: [UserRole.ADMIN],
  },

  {
    icon: 'list',
    label: 'Appointment List',
    path: ROUTES.APPOINTMENT.path,
    roles: [UserRole.ADMIN],
  },

  {
    icon: 'queue',
    label: 'Queue',
    path: ROUTES.ADMIN_BACKOFFICE_QUEUE.path,
    roles: [UserRole.ADMIN],
  },

  {
    icon: 'client',
    label: 'Client Management',
    path: ROUTES.CLIENT_MANAGEMENT.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.PATIENT_VIEW],
  },
  {
    icon: 'therapist',
    label: 'Therapist Management',
    path: ROUTES.THERAPIST_MANAGEMENT.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.THERAPIST_VIEW],
  },

  {
    icon: 'list',
    label: 'Appointment List',
    path: ROUTES.APPOINTMENT.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.APPOINTMENT_VIEW],
  },

  //backoffice route
  {
    icon: 'dashboard',
    label: 'Queue',
    path: ROUTES.ADMIN_BACKOFFICE_QUEUE.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.BACKOFFICE_QUEUE_VIEW],
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
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'widget',
        label: 'Widgets',
        path: ROUTES.REMINDER_WIDGETS.path,
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'alertTag',
        label: 'Alert Tags',
        path: ROUTES.TAG.path,
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'sessionTag',
        label: 'Session Tags',
        path: ROUTES.SESSION_TAG.path,
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'clinicaddress',
        label: 'Clinic Addresses',
        path: ROUTES.CLINIC_ADDRESSES.path,
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'agreement',
        label: 'Agreement',
        path: ROUTES.AGREEMENT.path,
        roles: [UserRole.ADMIN],
      },
      // Backoffice queue routes

      {
        icon: 'brain',
        label: 'Area of Focus',
        path: ROUTES.AREA_OF_FOCUS.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.AREA_OF_FOCUS_VIEW],
      },
      {
        icon: 'widget',
        label: 'Widgets',
        path: ROUTES.REMINDER_WIDGETS.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.WIDGETS_VIEW],
      },
      {
        icon: 'alertTag',
        label: 'Alert Tags',
        path: ROUTES.TAG.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.ALERT_TAGS_VIEW],
      },
      {
        icon: 'sessionTag',
        label: 'Session Tags',
        path: ROUTES.SESSION_TAG.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.SESSION_TAGS_VIEW],
      },
      {
        icon: 'clinicaddress',
        label: 'Clinic Addresses',
        path: ROUTES.CLINIC_ADDRESSES.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.CLINIC_ADDRESSES_VIEW],
      },
      {
        icon: 'agreement',
        label: 'Agreement',
        path: ROUTES.AGREEMENT.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.AGREEMENTS_VIEW],
      },
    ],
  },

  {
    icon: 'note',
    label: 'Assessment Forms',
    path: ROUTES.ASSESSMENT_FORM.path,
    roles: [UserRole.ADMIN],
  },

  {
    icon: 'note',
    label: 'Assessment Forms',
    path: ROUTES.ASSESSMENT_FORM.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.ASSESSMENT_FORM_VIEW],
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
        roles: [UserRole.ADMIN],
      },
      {
        icon: 'staffmanagement',
        label: 'Appointments Types',
        path: ROUTES.AMD_APPOINTMENTS_TYPES.path,
        roles: [UserRole.BACKOFFICE],
        requiredPermissions: [PermissionType.APPOINTMENT_TYPES_VIEW],
      },
      // {
      //   icon: 'securityUser',
      //   label: 'Logs',
      //   path: ROUTES.AMD_LOGS.path,
      //   roles: [UserRole.ADMIN],
      // },
    ],
  },

  {
    icon: 'thirdPartyLog',
    label: 'Third Party Logs',
    path: ROUTES.THIRD_PARTY_API_LOGS.path,
    roles: [UserRole.ADMIN],
  },

  // backoffice routes
  {
    icon: 'thirdPartyLog',
    label: 'Third Party Logs',
    path: ROUTES.THIRD_PARTY_API_LOGS.path,
    roles: [UserRole.BACKOFFICE],
    requiredPermissions: [PermissionType.THIRD_PARTY_LOGS_VIEW],
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
    childRoute: [
      {
        icon: 'generalsetting',
        label: 'General Setting',
        path: ROUTES.GENERAL_SETTING.path,
        roles: [UserRole.CLIENT],
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
      },
      {
        icon: 'sessionducuments',
        label: 'Session Documents',
        path: ROUTES.SESSION_DOCUMENTS.path,
        roles: [UserRole.CLIENT],
      },
    ],
  },
];

export const getMenuItemsByRole = (
  userRole: string,
  userPermissions?: string[]
): SidebarMenuItem[] => {
  const hasPermissions = (required?: string[]) =>
    !required || (userPermissions && required.every(p => userPermissions.includes(p)));

  const filterMenuItems = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
    return items
      .map(item => {
        let filteredChildren: SidebarMenuItem[] | undefined = undefined;
        if (item.childRoute) {
          filteredChildren = filterMenuItems(item.childRoute);
        }
        const includeItem =
          item.roles.includes(userRole) &&
          hasPermissions(item.requiredPermissions) &&
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
