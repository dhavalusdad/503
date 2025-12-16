import React from 'react';

import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import DynamicFormBuilder from '@/features/admin/components/DynamicFormBuilder';
import CancelAppointment from '@/features/appointment/component/ClientAppointmentsBooking/CancelAppointment';
import GeneralAgreement from '@/pages/GeneralAgreement';
import EditFormResponse from '@/pages/Preferences/EditFormResponse';
import PublicForm from '@/pages/PublicForm';

import { DEPENDENT_PERMISSIONS } from './permission.constant';

import type { RouteObject } from 'react-router-dom';

const ClientAgreementDetail = React.lazy(
  () => import('@/features/client/components/ClientAgreement/ClientAgreementDetail')
);
const AddEditCredentialingItem = React.lazy(
  () => import('@/pages/Management/CredentialingItem/AddAndEditCredentialLIstingItems')
);
const ClinicAddresses = React.lazy(() => import('@/pages/Management/ClinicAddresses'));
const AgreementPage = React.lazy(() => import('@/pages/Management/Agreement'));
const Landing = React.lazy(() => import('@/pages/Landing'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard/index'));
const Backoffice = React.lazy(() => import('@/pages/Admin/Backoffice'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const ClientListing = React.lazy(() => import('@/pages/Client'));
const Appointment = React.lazy(() =>
  import('@/pages/Appointment').then(module => ({ default: module.Appointment }))
);
const BookAppointment = React.lazy(() =>
  import('@/pages/Appointment').then(module => ({ default: module.BookAppointment }))
);
const BookSlot = React.lazy(
  () => import('@/features/appointment/component/ClientAppointmentsBooking/BookSlot')
);
const BookAppointmentDetails = React.lazy(
  () => import('@/features/appointment/component/ClientAppointmentsBooking/BookAppointmentDetails')
);
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Login'));
const Forgot = React.lazy(() => import('@/pages/Login'));
const ResetPassword = React.lazy(() => import('@/pages/Login'));
const PasswordChanged = React.lazy(() => import('@/pages/Login'));
const Verification = React.lazy(() => import('@/pages/Login'));
const TherapistLogin = React.lazy(() => import('@/pages/Therapist/Login'));
const TherapistRegister = React.lazy(() => import('@/pages/Therapist/Login'));
const TherapistForgot = React.lazy(() => import('@/pages/Therapist/Login'));
const TherapistResetPassword = React.lazy(() => import('@/pages/Therapist/Login'));
const TherapistPasswordChanged = React.lazy(() => import('@/pages/Therapist/Login'));
const TherapistManagement = React.lazy(() => import('@/pages/Therapist/TherapistManagement'));
const AdminLogin = React.lazy(() => import('@/pages/Admin/Login'));
const AdminForgot = React.lazy(() => import('@/pages/Admin/Login'));
const AdminResetPassword = React.lazy(() => import('@/pages/Admin/Login'));
const AdminPasswordChanged = React.lazy(() => import('@/pages/Admin/Login'));
// const AdminVerification = React.lazy(() => import('@/pages/Admin/Login'));
const GeneralSetting = React.lazy(() => import('@/pages/Preferences/GeneralSetting'));
const MyAgreements = React.lazy(() => import('@/pages/Preferences/MyAgreements'));
const AmdSafetyPlan = React.lazy(() => import('@/pages/Therapist/Myclient/'));
const SessionDocuments = React.lazy(() => import('@/pages/Preferences/SessionDocuments'));
const Transaction = React.lazy(() => import('@/pages/Transaction'));
const ClientManagement = React.lazy(() => import('@/pages/Admin/ClientManagement'));
const ViewTherapistDetails = React.lazy(() => import('@/pages/Admin/TherapistDetailsPage'));
const ProfileAddEditForm = React.lazy(() => import('@/pages/Profile/TherapistProfile.tsx'));
const ClientManagementDetails = React.lazy(
  () => import('@/features/admin/components/clientManagement/components/ClientMangementsDetails')
);
const StaffManagement = React.lazy(() => import('@/pages/Admin/StaffManagement'));
const AddStaffMember = React.lazy(() => import('@/pages/Admin/StaffManagement/AddStaffMember'));
const ViewStaffDetails = React.lazy(() => import('@/pages/Admin/StaffManagement/ViewStaffDetails'));
const RolesPermissions = React.lazy(() => import('@/pages/Admin/RolePermission/RolesPermissions'));
const AppointmentListView = React.lazy(
  () => import('@/pages/Appointment/components/AppointmentView')
);
const AreaOfFocus = React.lazy(() => import('@/pages/Management/AreaOfFocus'));
const ReminderWidgets = React.lazy(() => import('@/pages/Management/ReminderWidgets'));
const ClientDetail = React.lazy(() => import('@/features/client/components/MyClients'));
const WellnessDetails = React.lazy(() => import('@/features/client/components/WellnessDetail'));
const Calendar = React.lazy(() => import('@/pages/Calender'));
const TherapistAppointment = React.lazy(() => import('@/pages/Appointment/TherapistAppointment'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const SetPassword = React.lazy(() => import('@/pages/Login'));
const JoinAppointment = React.lazy(() => import('@/pages/video-call/JoinAppointment'));
const Room = React.lazy(() => import('@/pages/video-call/Room'));
const MeetingLeft = React.lazy(() => import('@/pages/video-call/MeetingLeft'));
const SessionExpired = React.lazy(() => import('@/features/video-call/components/SessionExpired'));
const EndSessionConfirmation = React.lazy(
  () => import('@/features/video-call/components/EndSessionConfirmation')
);
const RequestSlot = React.lazy(() => import('@/pages/Appointment/RequestSlot'));
const Tag = React.lazy(() => import('@/pages/Management/userTags'));
const SessionTag = React.lazy(() => import('@/pages/Management/SessionTag'));

const QueueRequestDetails = React.lazy(
  () => import('@/features/admin/components/backofficeQueue/components/QueueRequestDetails')
);
const AddClientForm = React.lazy(() => import('@/pages/Admin/ClientManagement/AddClientForm'));
const AssessmentFormList = React.lazy(() => import('@/pages/Admin/AssessmentForm'));
const SubmitForm = React.lazy(() => import('@/pages/Preferences/SubmitForm'));
const AmdAppointmentsTypesPage = React.lazy(
  () => import('@/pages/Management/AmdAppointmentsTypes')
);
const IntakeFormPage = React.lazy(() => import('@/pages/IntakeForm'));
const PublicAMDIntakeForm = React.lazy(() => import('@/pages/PublicAMDIntakeForm'));
const ViewFormResponse = React.lazy(() => import('@/pages/Preferences/ViewFormResponse'));

const ThirdPartyApiLogs = React.lazy(() => import('@/features/admin/components/ThirdPartyApiLogs'));
const ThirdPartyApiLogDetail = React.lazy(
  () => import('@/features/admin/components/ThirdPartyApiLogs/components/ThirdPartyApiLogDetail')
);

const TransactionDetails = React.lazy(() => import('@/pages/Admin/Transactions/TransactionView'));
const NotFound = React.lazy(() => import('@/components/common/NotFound/index'));
const NotAuthorized = React.lazy(() => import('@/pages/NotAuthorized'));

export type RouteObjectValueType = {
  path: string;
  headerName?: string;
  routeType: 'public' | 'un-authenticate' | 'authenticate';
  isHeaderVisible?: boolean;
  isFooterVisible?: boolean;
  element: RouteObject['element'];
  errorElement?: RouteObject['errorElement'];
  displayName?: string;
  permissions?: {
    list: string[];
    operator?: 'AND' | 'OR';
  };
  breadcrumb?: {
    label?: string | ((searchParams: URLSearchParams) => string);
    isActive?: boolean;
    path?: string;
    pathIdName?: string;
  }[];
  role?: UserRole[];
};

export const ROUTE_BASE_PATH = {
  DASHBOARD: '/dashboard',
};

export type RoutesType = {
  [key in
    | 'DEFAULT'
    | 'CLIENT_DASHBOARD'
    | 'THERAPIST_DASHBOARD'
    | 'ADMIN_DASHBOARD'
    | 'CLIENT_PROFILE'
    | 'THERAPIST_PROFILE'
    | 'ADMIN_PROFILE'
    | 'APPOINTMENT'
    // | 'CLIENT_APPOINTMENT'
    // | 'THERAPIST_APPOINTMENT'
    // | 'ADMIN_APPOINTMENT'
    | 'BOOK_APPOINTMENT'
    | 'ADMIN_BOOK_APPOINTMENT_DETAIL'
    | 'BOOK_SLOT'
    | 'BOOK_APPOINTMENTS_DETAILS'
    | 'MY_CLIENT'
    | 'MY_CLIENT_DETAIL'
    | 'WELLNESS_DETAIL'
    | 'CALENDAR'
    | 'CHAT'
    | 'CHAT_VIEW'
    | 'SETTINGS'
    | 'TRANSACTION'
    | 'CLIENT_MANAGEMENT'
    | 'LOGIN'
    | 'REGISTER'
    | 'FORGOT'
    | 'RESET_PASSWORD'
    | 'PASSWORD_CHANGED'
    | 'VERIFICATION'
    | 'THERAPIST_LOGIN'
    | 'THERAPIST_REGISTER'
    | 'THERAPIST_FORGOT'
    | 'THERAPIST_RESET_PASSWORD'
    | 'THERAPIST_PASSWORD_CHANGED'
    | 'ADMIN_LOGIN'
    | 'ADMIN_FORGOT'
    | 'ADMIN_RESET_PASSWORD'
    | 'ADMIN_PASSWORD_CHANGED'
    // | 'ADMIN_VERIFICATION'
    | 'ADMIN_BACKOFFICE_QUEUE'
    | 'GENERAL_SETTING'
    | 'PAYMENT_METHOD'
    | 'INSURANCE'
    | 'MY_AGREEMENTS'
    | 'MY_AGREEMENTS_DETAIL'
    | 'SESSION_DOCUMENTS'
    | 'ADMIN_SETTINGS'
    | 'VIEW_THERAPIST_DETAILS'
    | 'THERAPIST_MANAGEMENT'
    // | 'ADD_THERAPIST'
    | 'ADMIN_BOOK_APPOINTMENT'
    | 'EDIT_THERAPIST'
    | 'STAFF_MANAGEMENT'
    | 'STAFF_MANAGEMENT_DETAILS'
    | 'ADD_STAFF_MEMBER'
    | 'EDIT_STAFF_MEMBER'
    | 'CLIENT_MANAGEMENT_DETAILS'
    | 'ROLE_PERMISSION'
    | 'EDIT_CLIENT'
    | 'AREA_OF_FOCUS'
    | 'REMINDER_WIDGETS'
    | 'AGREEMENT'
    | 'TAG'
    | 'SESSION_TAG'
    | 'CLINIC_ADDRESSES'
    | 'APPOINTMENT_VIEW'
    | 'QUEUE_DETAILS_VIEW'
    | 'THERAPIST_APPOINTMENT_LIST'
    | 'JOIN_APPOINTMENT'
    | 'ROOM'
    | 'MEETING_LEFT'
    | 'SESSION_EXPIRED'
    | 'END_SESSION_CONFIRMATION'
    | 'NOT_FOUND'
    | 'SET_PASSWORD'
    | 'REQUEST_SLOT'
    | 'ADD_CLIENT'
    | 'SET_STAFF_PASSWORD'
    | 'ASSESSMENT_FORM'
    | 'EDIT_ASSESSMENT_FORM'
    | 'EDIT_FORM_RESPONSE'
    | 'SUBMIT_FORM_RESPONSE'
    // | 'AMD_LOGS'
    // | 'AMD_LOGS_DETAILS'
    | 'AMD_APPOINTMENTS_TYPES'
    | 'INTAKE_FORM'
    | 'PUBLIC_AMD_FORM'
    | 'PUBLIC_FORM'
    | 'GENERAL_AGREEMENTS'
    | 'CANCEL_APPOINTMENT'
    | 'VIEW_FORM_RESPONSE'
    | 'VIEW_FORM_RESPONSE_ADMIN'
    | 'ADD_CREDENTIALING_ITEM'
    | 'EDIT_CREDENTIALING_ITEM'
    | 'VIEW_FORM_RESPONSE_THERAPIST'
    | 'THIRD_PARTY_API_LOGS'
    | 'THIRD_PARTY_API_LOGS_DETAILS'
    | 'TRANSACTION_DETAILS'
    | 'STAFF_PROFILE'
    | 'AMD_SAFETY_PLAN'
    | 'NOT_AUTHORIZED'
    | 'UNKNOWN']: RouteObjectValueType;
} & {
  [key in
    | 'STAFF_MANAGEMENT_DETAILS'
    | 'CLIENT_MANAGEMENT_DETAILS'
    | 'VIEW_THERAPIST_DETAILS'
    | 'EDIT_STAFF_MEMBER'
    | 'APPOINTMENT_VIEW'
    | 'TRANSACTION_DETAILS'
    | 'ROOM'
    | 'JOIN_APPOINTMENT'
    | 'END_SESSION_CONFIRMATION'
    | 'MEETING_LEFT'
    | 'QUEUE_DETAILS_VIEW'
    | 'EDIT_ASSESSMENT_FORM'
    | 'EDIT_FORM_RESPONSE'
    | 'SUBMIT_FORM_RESPONSE'
    | 'VIEW_FORM_RESPONSE'
    | 'VIEW_FORM_RESPONSE_ADMIN'
    // | 'AMD_LOGS_DETAILS'
    | 'PUBLIC_FORM'
    | 'MY_AGREEMENTS_DETAIL'
    | 'MY_CLIENT_DETAIL'
    | 'GENERAL_AGREEMENTS'
    | 'CANCEL_APPOINTMENT'
    | 'INTAKE_FORM'
    | 'AMD_SAFETY_PLAN'
    | 'PUBLIC_AMD_FORM'
    | 'THIRD_PARTY_API_LOGS_DETAILS']: {
    navigatePath: (id: number | string) => string;
  };
} & {
  [key in 'WELLNESS_DETAIL' | 'VIEW_FORM_RESPONSE_THERAPIST' | 'EDIT_CREDENTIALING_ITEM']: {
    navigatePath: (therapist_id: number | string, id: number | string) => string;
  };
};

export const ROUTES: RoutesType = {
  DEFAULT: {
    path: '/',
    routeType: 'public',
    element: <Landing />,
  },

  //AUTH ROUTES
  LOGIN: {
    path: '/login',
    routeType: 'un-authenticate',
    element: <Login />,
  },

  REGISTER: {
    path: '/register',
    routeType: 'un-authenticate',
    element: <Register />,
  },
  FORGOT: {
    path: '/forgot-password',
    routeType: 'un-authenticate',
    element: <Forgot />,
  },
  RESET_PASSWORD: {
    path: '/reset-password',
    routeType: 'un-authenticate',
    element: <ResetPassword />,
  },
  PASSWORD_CHANGED: {
    path: '/password-changed',
    routeType: 'un-authenticate',
    element: <PasswordChanged />,
  },
  VERIFICATION: {
    path: '/verification',
    routeType: 'un-authenticate',
    element: <Verification />,
  },
  THERAPIST_LOGIN: {
    path: '/therapist/login',
    routeType: 'un-authenticate',
    element: <TherapistLogin />,
  },
  THERAPIST_REGISTER: {
    path: '/therapist/register',
    routeType: 'un-authenticate',
    element: <TherapistRegister />,
  },
  SET_PASSWORD: {
    path: '/set-password',
    routeType: 'un-authenticate',
    element: <SetPassword />,
  },
  SET_STAFF_PASSWORD: {
    path: '/admin/set-password',
    routeType: 'un-authenticate',
    element: <AdminLogin />,
  },
  THERAPIST_FORGOT: {
    path: '/therapist/forgot-password',
    routeType: 'un-authenticate',
    element: <TherapistForgot />,
  },
  THERAPIST_RESET_PASSWORD: {
    path: '/therapist/reset-password',
    routeType: 'un-authenticate',
    element: <TherapistResetPassword />,
  },
  THERAPIST_PASSWORD_CHANGED: {
    path: '/therapist/password-changed',
    routeType: 'un-authenticate',
    element: <TherapistPasswordChanged />,
  },
  ADMIN_LOGIN: {
    path: '/admin/login',
    routeType: 'un-authenticate',
    element: <AdminLogin />,
  },
  ADMIN_FORGOT: {
    path: '/admin/forgot-password',
    routeType: 'un-authenticate',
    element: <AdminForgot />,
  },
  ADMIN_RESET_PASSWORD: {
    path: '/admin/reset-password',
    routeType: 'un-authenticate',
    element: <AdminResetPassword />,
  },
  ADMIN_PASSWORD_CHANGED: {
    path: '/admin/password-changed',
    routeType: 'un-authenticate',
    element: <AdminPasswordChanged />,
  },
  // ADMIN_VERIFICATION: {
  //   path: '/admin/verification',
  //   routeType: 'un-authenticate',
  //   element: <AdminVerification />,
  // },

  //PROFILE ROUTES
  CLIENT_PROFILE: {
    path: '/profile',
    routeType: 'authenticate',
    headerName: 'Profile',
    element: <Profile />,
    breadcrumb: [
      {
        label: 'Profile',
        isActive: true,
      },
    ],
    role: [UserRole.CLIENT],
  },
  THERAPIST_PROFILE: {
    path: '/profile',
    routeType: 'authenticate',
    headerName: 'Profile',
    element: <Profile />,
    breadcrumb: [
      {
        label: 'Profile',
        isActive: true,
      },
    ],
    role: [UserRole.THERAPIST],
  },
  ADMIN_PROFILE: {
    path: '/profile',
    routeType: 'authenticate',
    headerName: 'Profile',
    element: <Profile />,
    breadcrumb: [
      {
        label: 'Profile',
        isActive: true,
      },
    ],
    role: [UserRole.ADMIN, UserRole.BACKOFFICE],
  },

  //DASHBOARD ROUTES

  CLIENT_DASHBOARD: {
    path: ROUTE_BASE_PATH.DASHBOARD,
    routeType: 'authenticate',
    headerName: 'Dashboard',
    element: <Dashboard />,
    role: [UserRole.CLIENT],
  },
  THERAPIST_DASHBOARD: {
    path: ROUTE_BASE_PATH.DASHBOARD,
    routeType: 'authenticate',
    headerName: 'Dashboard',
    element: <Dashboard />,
    role: [UserRole.THERAPIST],
  },
  ADMIN_DASHBOARD: {
    path: ROUTE_BASE_PATH.DASHBOARD,
    routeType: 'authenticate',
    headerName: 'Dashboard',
    element: <Dashboard />,
    role: [UserRole.ADMIN, UserRole.BACKOFFICE],
  },
  ADMIN_BACKOFFICE_QUEUE: {
    path: '/backoffice-queue',
    routeType: 'authenticate',
    headerName: 'Backoffice',
    element: <Backoffice />,
    breadcrumb: [
      {
        label: 'Backoffice Queue',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.BACKOFFICE_QUEUE_VIEW],
    },
  },

  APPOINTMENT: {
    path: '/appointment',
    routeType: 'authenticate',
    headerName: 'Appointment',
    element: <Appointment />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.APPOINTMENT_VIEW,
        ...(DEPENDENT_PERMISSIONS[PermissionType.APPOINTMENT_VIEW].allow ?? []),
      ],
    },
  },
  ASSESSMENT_FORM: {
    path: '/assessment-form',
    routeType: 'authenticate',
    headerName: 'Assessment Form',
    element: <AssessmentFormList />,
    breadcrumb: [
      {
        label: 'Assessment Form',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.ASSESSMENT_FORM_VIEW],
    },
  },
  EDIT_ASSESSMENT_FORM: {
    path: '/assessment-form/edit/:id',
    navigatePath: id => `/assessment-form/edit/${id}`,
    routeType: 'authenticate',
    headerName: 'Assessment Form',
    element: <DynamicFormBuilder />,
    breadcrumb: [
      {
        label: 'Assessment Form',
        isActive: false,
        path: '/assessment-form',
      },
      {
        label: 'Edit Assessment Form',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.ASSESSMENT_FORM_EDIT,
        ...(DEPENDENT_PERMISSIONS[PermissionType.ASSESSMENT_FORM_EDIT].allow ?? []),
      ],
    },
  },
  BOOK_APPOINTMENT: {
    path: '/appointment/book-appointment',
    routeType: 'authenticate',
    headerName: 'Book Appointment',
    element: <BookAppointment />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Book Appointment',
        isActive: true,
      },
    ],
    role: [UserRole.CLIENT],
  },
  ADMIN_BOOK_APPOINTMENT: {
    path: '/appointment/book-appointment',
    routeType: 'authenticate',
    headerName: 'Book Appointment',
    element: <BookAppointment />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Book Appointment',
        isActive: true,
      },
    ],
    role: [UserRole.BACKOFFICE, UserRole.ADMIN],
    permissions: {
      list: [
        PermissionType.APPOINTMENT_ADD,
        ...(DEPENDENT_PERMISSIONS[PermissionType.APPOINTMENT_ADD].allow ?? []),
      ],
    },
  },
  ADMIN_BOOK_APPOINTMENT_DETAIL: {
    path: '/appointment/book-appointments-details',
    routeType: 'authenticate',
    headerName: 'Book Appointment',
    element: <BookAppointmentDetails />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Book an Appointment',
        isActive: false,
        path: '/appointment/book-appointment',
      },
      {
        label: 'Book slot',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.APPOINTMENT_ADD,
        ...(DEPENDENT_PERMISSIONS[PermissionType.APPOINTMENT_ADD].allow ?? []),
      ],
    },
    role: [UserRole.BACKOFFICE, UserRole.ADMIN],
  },
  BOOK_SLOT: {
    path: '/appointment/book-appointment/book-slot/:id',
    routeType: 'authenticate',
    headerName: 'Book Appointment',
    element: <BookSlot />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Book Appointment',
        isActive: false,
        path: '/appointment/book-appointment',
      },
      {
        label: 'Book slot',
        isActive: true,
      },
    ],
  },
  BOOK_APPOINTMENTS_DETAILS: {
    path: '/appointment/book-appointments-details',
    routeType: 'authenticate',
    headerName: 'Book Appointment',
    element: <BookAppointmentDetails />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Book Appointment',
        isActive: false,
        path: '/appointment/book-appointment',
      },

      {
        label: 'Book slot',
        isActive: true,
      },
    ],
    role: [UserRole.CLIENT],
  },
  MY_CLIENT: {
    path: '/my-client',
    routeType: 'authenticate',
    headerName: 'My Clients',
    element: <ClientListing />,
    breadcrumb: [
      {
        label: 'My Clients',
        isActive: true,
      },
    ],
  },
  MY_CLIENT_DETAIL: {
    path: '/my-client/:client_id',
    routeType: 'authenticate',
    navigatePath: id => `/my-client/${id}`,
    headerName: 'Client Detail',
    element: <ClientDetail />,
    breadcrumb: [
      {
        label: 'My Client',
        isActive: false,
        path: '/my-client',
      },
      {
        label: 'Client Detail',
        isActive: true,
      },
    ],
  },
  AMD_SAFETY_PLAN: {
    path: '/my-client/safety-plan/:formId',
    routeType: 'authenticate',
    navigatePath: id => `/my-client/safety-plan/${id}`,
    headerName: 'Safety Form',
    element: <AmdSafetyPlan />,
    breadcrumb: [
      {
        label: 'My Client',
        isActive: false,
        path: '/my-client',
      },
      {
        label: 'Client Detail',
        isActive: false,
      },
      {
        label: 'Safety plan',
        isActive: true,
      },
    ],
  },
  WELLNESS_DETAIL: {
    path: '/my-client/:id/wellness-detail/:patient_id',
    navigatePath: (client_id: string | number, id: string | number) =>
      `/my-client/${client_id}/wellness-detail/${id}`,
    displayName: '/ My Client / Client Detail / Wellness Details',
    routeType: 'authenticate',
    headerName: 'Wellness Detail',
    element: <WellnessDetails />,
    breadcrumb: [
      {
        label: 'My Client',
        isActive: false,
        path: '/my-client',
      },
      {
        label: 'Client Detail',
        isActive: false,
        path: '/my-client/:id',
        pathIdName: 'id',
      },
      {
        label: 'Wellness Details',
        isActive: true,
        path: '/my-client/:id/wellness-detail/:patient_id',
        pathIdName: 'patient_id',
      },
    ],
  },
  CALENDAR: {
    path: '/calendar',
    routeType: 'authenticate',
    headerName: 'Calendar',
    element: <Calendar />,
    breadcrumb: [
      {
        label: 'Calendar',
        isActive: true,
      },
    ],
  },
  GENERAL_SETTING: {
    path: '/preferences/general-setting',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <GeneralSetting tab='general' />,
    breadcrumb: [
      {
        label: 'General Settings',
        isActive: true,
      },
    ],
  },
  PAYMENT_METHOD: {
    path: '/preferences/payment-method',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <GeneralSetting tab='payment' />,
    breadcrumb: [
      {
        label: 'Payment methods',
        isActive: true,
      },
    ],
  },
  INSURANCE: {
    path: '/preferences/insurance',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <GeneralSetting tab='insurance' />,
    breadcrumb: [
      {
        label: 'Insurance',
        isActive: true,
      },
    ],
  },
  MY_AGREEMENTS: {
    path: '/preferences/my-agreements',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <MyAgreements />,
    breadcrumb: [
      {
        label: 'My Agreements',
        isActive: true,
      },
    ],
  },
  MY_AGREEMENTS_DETAIL: {
    path: '/preferences/my-agreements/:agreementId',
    navigatePath: id => `/preferences/my-agreements/${id}`,
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <ClientAgreementDetail />,
    breadcrumb: [
      {
        label: 'My Agreements',
        isActive: false,
        path: '/preferences/my-agreements',
      },
      {
        label: 'My Agreements Details',
        isActive: true,
      },
    ],
  },

  SESSION_DOCUMENTS: {
    path: '/preferences/session-documents',
    routeType: 'authenticate',
    headerName: 'Session Documents',
    element: <SessionDocuments />,
    breadcrumb: [
      {
        label: 'Session Documents',
        isActive: true,
      },
    ],
  },
  SUBMIT_FORM_RESPONSE: {
    path: '/preferences/session-documents/submit-form/:id',
    routeType: 'authenticate',
    navigatePath: id => `/preferences/session-documents/submit-form/${id}`,
    headerName: 'Settings',
    element: <SubmitForm />,
    breadcrumb: [
      {
        label: 'Session Documents',
        isActive: false,
        path: '/preferences/session-documents',
      },
      {
        label: 'Submit Form',
        isActive: true,
      },
    ],
  },
  EDIT_FORM_RESPONSE: {
    path: '/preferences/session-documents/edit-form/:editId',
    routeType: 'authenticate',
    navigatePath: editId => `/preferences/session-documents/edit-form/${editId}`,
    headerName: 'Settings',
    element: <EditFormResponse />,
    breadcrumb: [
      {
        label: 'Session Documents',
        isActive: false,
        path: '/preferences/session-documents',
      },
      {
        label: 'Edit Form',
        isActive: true,
      },
    ],
  },
  VIEW_FORM_RESPONSE: {
    path: '/preferences/session-documents/view-form-response/:editId',
    routeType: 'authenticate',
    navigatePath: editId => `/preferences/session-documents/view-form-response/${editId}`,
    headerName: 'Form Response',
    element: <ViewFormResponse />,
    breadcrumb: [
      {
        label: 'Session Documents',
        isActive: false,
        path: '/preferences/session-documents',
      },
      {
        label: 'View Form',
        isActive: true,
      },
    ],
  },
  VIEW_FORM_RESPONSE_ADMIN: {
    path: '/client-management/view-form-response/:editId',
    routeType: 'authenticate',
    navigatePath: editId => `/client-management/view-form-response/${editId}`,
    headerName: 'Form Response',
    element: <ViewFormResponse />,
    breadcrumb: [
      {
        label: 'Client Management',
        isActive: true,
        path: '/client-management',
      },
    ],
    permissions: {
      list: [PermissionType.ASSESSMENT_FORM_VIEW],
    },
  },
  VIEW_FORM_RESPONSE_THERAPIST: {
    path: '/my-client/:id/view-form-response/:editId',
    routeType: 'authenticate',
    navigatePath: (clientId: string | number, id: string | number) =>
      `/my-client/${clientId}/view-form-response/${id}`,
    headerName: 'Form Response',
    element: <ViewFormResponse />,
    breadcrumb: [
      {
        label: 'My Client',
        isActive: false,
        path: '/my-client',
      },
      {
        label: 'Client Detail',
        isActive: false,
        path: '/my-client/:id',
        pathIdName: 'id',
      },
      {
        label: 'Form Response',
        isActive: true,
        path: '/my-client/:id/view-form-response/:editId',
        pathIdName: 'editId',
      },
    ],
  },
  CHAT: {
    path: '/chat',
    routeType: 'authenticate',
    headerName: 'Chat',
    displayName: 'Chat',
    element: <Chat />,
    breadcrumb: [
      {
        label: 'Chat',
        isActive: true,
      },
    ],
  },
  CHAT_VIEW: {
    path: '/chat/:chatId',
    routeType: 'authenticate',
    headerName: 'Chat',
    displayName: 'Chat',
    element: <Chat />,
    breadcrumb: [
      {
        label: 'Chat',
        isActive: false,
        path: '/chat',
      },
      {
        label: 'Chat View',
        isActive: true,
        path: '/chat/:chatId',
        pathIdName: 'chatId',
      },
    ],
  },
  SETTINGS: {
    path: '/settings',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <Settings />,
    breadcrumb: [
      {
        label: 'Settings',
        isActive: true,
      },
    ],
    role: [UserRole.THERAPIST, UserRole.CLIENT],
  },
  ADMIN_SETTINGS: {
    path: '/settings',
    routeType: 'authenticate',
    headerName: 'Settings',
    element: <Settings />,
    role: [UserRole.ADMIN, UserRole.BACKOFFICE],
  },
  TRANSACTION: {
    path: '/transaction',
    routeType: 'authenticate',
    headerName: 'Transactions',
    element: <Transaction />,
    permissions: {
      list: [PermissionType.TRANSACTIONS_VIEW],
    },
    breadcrumb: [
      {
        label: 'Transactions',
        isActive: true,
      },
    ],
  },
  CLIENT_MANAGEMENT: {
    path: '/client-management',
    routeType: 'authenticate',
    headerName: 'Client Management',
    element: <ClientManagement />,
    permissions: {
      list: [PermissionType.PATIENT_VIEW],
    },
    breadcrumb: [
      {
        label: 'Client Management',
        isActive: true,
      },
    ],
  },
  ADD_CLIENT: {
    path: '/client-management/add-client',
    routeType: 'authenticate',
    headerName: 'Add Client',
    element: <AddClientForm />,
    breadcrumb: [
      {
        label: 'Client Management',
        isActive: false,
        path: '/client-management',
      },
      {
        label: 'Add Client',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.PATIENT_ADD,
        ...(DEPENDENT_PERMISSIONS[PermissionType.PATIENT_ADD].allow ?? []),
      ],
    },
  },
  EDIT_CLIENT: {
    path: '/client-management/edit-client/:client_id',
    routeType: 'authenticate',
    headerName: 'Edit Client',
    element: <AddClientForm />,
    breadcrumb: [
      {
        label: 'Client Management',
        isActive: false,
        path: '/client-management',
      },
      {
        label: 'Edit Client',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.PATIENT_EDIT,
        ...(DEPENDENT_PERMISSIONS[PermissionType.PATIENT_EDIT].allow ?? []),
      ],
    },
  },
  CLIENT_MANAGEMENT_DETAILS: {
    path: '/client-management/:id',
    navigatePath: id => `/client-management/${id}`,
    routeType: 'authenticate',
    headerName: 'Client Management Details',
    element: <ClientManagementDetails />,
    breadcrumb: [
      {
        label: 'Client Management',
        isActive: false,
        path: '/client-management',
      },
      {
        label: 'Client Details',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.PATIENT_VIEW,
        ...(DEPENDENT_PERMISSIONS[PermissionType.PATIENT_VIEW].allow ?? []),
      ],
    },
  },
  THERAPIST_MANAGEMENT: {
    path: '/therapist-management',
    routeType: 'authenticate',
    headerName: 'Therapist Management',
    element: <TherapistManagement />,
    permissions: {
      list: [PermissionType.THERAPIST_VIEW],
    },
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: true,
      },
    ],
  },
  // ADD_THERAPIST: {
  //   path: '/therapist-management/add-therapist',
  //   routeType: 'authenticate',
  //   headerName: 'Add Therapist',
  //   element: <ProfileAddEditForm />,
  //   breadcrumb: [
  //     {
  //       label: 'Therapist Management',
  //       isActive: false,
  //       path: '/therapist-management',
  //     },
  //     {
  //       label: 'Add Therapist',
  //       isActive: true,
  //     },
  //   ],
  // },
  EDIT_THERAPIST: {
    path: '/therapist-management/edit-therapist/:therapist_id',
    routeType: 'authenticate',
    headerName: 'Edit Therapist',
    element: <ProfileAddEditForm />,
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: false,
        path: '/therapist-management',
      },
      {
        label: 'Edit Therapist',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.THERAPIST_EDIT,
        ...(DEPENDENT_PERMISSIONS[PermissionType.THERAPIST_EDIT].allow ?? []),
      ],
    },
  },
  VIEW_THERAPIST_DETAILS: {
    path: '/therapist-management/view-therapist/:therapist_id',
    routeType: 'authenticate',
    navigatePath: therapist_id => `/therapist-management/view-therapist/${therapist_id}`,
    headerName: 'Therapist Management',
    element: <ViewTherapistDetails />,
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: false,
        path: '/therapist-management',
      },
      {
        label: 'View Therapist',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.THERAPIST_VIEW],
    },
  },
  THERAPIST_APPOINTMENT_LIST: {
    path: '/therapist-management/view-therapist/:therapist_id/appointments',
    routeType: 'authenticate',
    headerName: 'Therapist Management',
    element: <TherapistAppointment />,
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: false,
        path: '/therapist-management',
      },
      {
        label: 'View Therapist',
        isActive: false,
        path: '/therapist-management/view-therapist/:therapist_id',
        pathIdName: 'therapist_id',
      },
      {
        label: 'All Appointment',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.THERAPIST_VIEW, PermissionType.APPOINTMENT_VIEW],
    },
  },

  // ================================

  STAFF_PROFILE: {
    path: '/staff/profile',
    routeType: 'authenticate',
    headerName: 'Profile',
    element: <Profile />,
    breadcrumb: [
      {
        label: 'Profile',
        isActive: true,
      },
    ],
  },
  STAFF_MANAGEMENT: {
    path: '/staff/staff-management',
    routeType: 'authenticate',
    headerName: 'Staff Management',
    element: <StaffManagement />,
    breadcrumb: [
      {
        label: 'Staff Management',
        isActive: true,
      },
    ],
  },
  STAFF_MANAGEMENT_DETAILS: {
    path: '/staff/staff-management/view/:id',
    navigatePath: id => `/staff/staff-management/view/${id}`,
    routeType: 'authenticate',
    headerName: 'Staff Management',
    element: <ViewStaffDetails />,
    breadcrumb: [
      {
        label: 'Staff Management',
        isActive: false,
        path: '/staff/staff-management',
      },
      {
        label: 'View Staff',
        isActive: true,
      },
    ],
  },
  ADD_STAFF_MEMBER: {
    path: '/staff/staff-management/add',
    routeType: 'authenticate',
    headerName: 'Add Staff Member',
    element: <AddStaffMember />,
    breadcrumb: [
      {
        label: 'Staff Management',
        isActive: false,
        path: '/staff/staff-management',
      },
      {
        label: 'Add Staff',
        isActive: true,
      },
    ],
  },
  EDIT_STAFF_MEMBER: {
    path: '/staff/staff-management/edit/:id',
    navigatePath: id => `/staff/staff-management/edit/${id}`,
    routeType: 'authenticate',
    headerName: 'Update Staff Member',
    element: <AddStaffMember />,
    breadcrumb: [
      {
        label: 'Staff Management',
        isActive: false,
        path: '/staff/staff-management',
      },
      {
        label: 'Edit Staff',
        isActive: true,
      },
    ],
  },
  ROLE_PERMISSION: {
    headerName: 'Role & Permission',
    path: '/staff/role-permission',
    routeType: 'authenticate',
    element: <RolesPermissions />,
    breadcrumb: [
      {
        label: 'Roles & Permissions',
        isActive: true,
      },
    ],
  },
  APPOINTMENT_VIEW: {
    headerName: 'Appointment View',
    navigatePath: id => `/appointment/${id}`,
    path: '/appointment/:appointment_id',
    routeType: 'authenticate',
    element: <AppointmentListView />,
    breadcrumb: [
      {
        label: 'Appointment',
        path: '/appointment',
        isActive: false,
      },
      {
        label: 'Appointment Details',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.APPOINTMENT_VIEW,
        ...(DEPENDENT_PERMISSIONS[PermissionType.THIRD_PARTY_LOGS_VIEW].allow ?? []),
      ],
    },
  },
  QUEUE_DETAILS_VIEW: {
    headerName: 'Request Details',
    path: '/backoffice-queue/:id',
    navigatePath: id => `/backoffice-queue/${id}`,
    routeType: 'authenticate',
    element: <QueueRequestDetails />,
    breadcrumb: [
      {
        label: 'Backoffice Queue',
        isActive: false,
        path: '/backoffice-queue',
      },
      {
        label: 'Request Details',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.BACKOFFICE_QUEUE_VIEW],
    },
  },
  REQUEST_SLOT: {
    path: '/appointment/request-slot/:id',
    routeType: 'authenticate',
    headerName: 'Request Slot',
    element: <RequestSlot />,
    breadcrumb: [
      {
        label: 'Appointment',
        isActive: false,
        path: '/appointment',
      },
      {
        label: 'Request Slot',
        isActive: true,
      },
    ],
  },
  AREA_OF_FOCUS: {
    path: '/management/area-of-focus',
    routeType: 'authenticate',
    headerName: 'Area of Focus',
    element: <AreaOfFocus />,
    breadcrumb: [
      {
        label: 'Area of Focus',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.AREA_OF_FOCUS_VIEW],
    },
  },
  TAG: {
    path: '/management/tag',
    routeType: 'authenticate',
    headerName: 'Alert Tag',
    element: <Tag />,
    breadcrumb: [
      {
        label: 'Alert Tag',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.ALERT_TAGS_VIEW],
    },
  },
  SESSION_TAG: {
    path: '/management/session-tag',
    routeType: 'authenticate',
    headerName: 'Session Tag',
    element: <SessionTag />,
    breadcrumb: [
      {
        label: 'Session Tag',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.SESSION_TAGS_VIEW],
    },
  },
  CLINIC_ADDRESSES: {
    path: '/management/clinic-addresses',
    routeType: 'authenticate',
    headerName: 'Clinic Addresses',
    element: <ClinicAddresses />,
    breadcrumb: [
      {
        label: 'Clinic Addresses',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.CLINIC_ADDRESSES_VIEW],
    },
  },
  AGREEMENT: {
    path: '/management/agreement',
    routeType: 'authenticate',
    headerName: 'Agreement',
    element: <AgreementPage />,
    breadcrumb: [
      {
        label: 'Agreement',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.AGREEMENTS_VIEW],
    },
  },
  ADD_CREDENTIALING_ITEM: {
    path: '/therapist-management/edit-therapist/:therapist_id/credentialing-item/add',
    routeType: 'authenticate',
    headerName: 'Credentialing Item',
    element: <AddEditCredentialingItem />,
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: false,
        path: '/therapist-management',
      },
      {
        label: 'Edit Therapist',
        isActive: false,
        path: '/therapist-management/edit-therapist/:therapist_id?active_tab=Credential Items',
        pathIdName: 'therapist_id',
      },
      {
        label: 'Add Credentialing Item',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.THERAPIST_EDIT, PermissionType.THERAPIST_VIEW],
    },
  },

  EDIT_CREDENTIALING_ITEM: {
    path: '/therapist-management/:therapist_id/credentialing-item/:id',
    navigatePath: (therapist_id: string | number, id: string | number) =>
      `/therapist-management/${therapist_id}/credentialing-item/${id}`,
    routeType: 'authenticate',
    headerName: 'Credentialing Item',
    element: <AddEditCredentialingItem />,
    breadcrumb: [
      {
        label: 'Therapist Management',
        isActive: false,
        path: '/therapist-management',
      },
      {
        label: 'Edit Therapist',
        isActive: false,
        path: '/therapist-management/edit-therapist/:therapist_id',
        pathIdName: 'therapist_id',
      },
      {
        label: 'Edit Credentialing Item',
        isActive: true,
        pathIdName: 'id',
      },
    ],
    permissions: {
      list: [PermissionType.THERAPIST_EDIT, PermissionType.THERAPIST_VIEW],
    },
  },
  REMINDER_WIDGETS: {
    path: '/management/reminder-widgets',
    routeType: 'authenticate',
    headerName: 'Reminder Widgets',
    element: <ReminderWidgets />,
    breadcrumb: [
      {
        label: 'Reminder Widgets',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.WIDGETS_VIEW],
    },
  },
  JOIN_APPOINTMENT: {
    path: '/join-appointment/:roomId',
    navigatePath: id => `/join-appointment/${id}`,
    routeType: 'public',
    headerName: 'Join Appointment',
    element: <JoinAppointment />,
  },
  ROOM: {
    path: '/room/:roomId',
    navigatePath: id => `/room/${id}`,
    routeType: 'public',
    headerName: 'Room',
    element: <Room />,
  },
  MEETING_LEFT: {
    path: '/meeting-left/:roomId',
    routeType: 'public',
    headerName: 'Meeting Left',
    navigatePath: id => `/meeting-left/${id}`,
    element: <MeetingLeft />,
  },
  SESSION_EXPIRED: {
    path: '/session-expired',
    routeType: 'public',
    headerName: 'Session Expired',
    element: <SessionExpired />,
  },
  END_SESSION_CONFIRMATION: {
    path: '/end-session-confirmation/:appointment_id',
    navigatePath: id => `/end-session-confirmation/${id}`,
    routeType: 'public',
    headerName: 'End Session Confirmation',
    element: <EndSessionConfirmation />,
  },
  // AMD_LOGS: {
  //   path: '/amd/amd-logs',
  //   routeType: 'authenticate',
  //   headerName: 'AMD Logs',
  //   breadcrumb: [
  //     {
  //       label: 'AMD Logs',
  //       isActive: true,
  //     },
  //   ],
  //   element: <AmdLogsPage />,
  // },
  // AMD_LOGS_DETAILS: {
  //   path: '/amd/amd-logs/:id',
  //   navigatePath: id => `/amd/amd-logs/${id}`,
  //   routeType: 'authenticate',
  //   headerName: 'AMD Logs',
  //   element: <AmdLogDetailPage />,
  //   breadcrumb: [
  //     {
  //       label: 'AMD Logs',
  //       isActive: false,
  //       path: '/amd/amd-logs',
  //     },
  //     {
  //       label: 'AMD Logs Details',
  //       isActive: true,
  //     },
  //   ],
  // },
  AMD_APPOINTMENTS_TYPES: {
    path: '/amd/appointments-types',
    routeType: 'authenticate',
    headerName: 'Appointments Types',
    element: <AmdAppointmentsTypesPage />,
    breadcrumb: [
      {
        label: 'Appointments Types',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.APPOINTMENT_TYPES_VIEW],
    },
  },
  INTAKE_FORM: {
    path: '/my-client/:id/amd',
    navigatePath: id => `/my-client/${id}/amd`,
    routeType: 'authenticate',
    headerName: 'Client Detail',
    element: <IntakeFormPage />,
    breadcrumb: [
      {
        label: 'My Client',
        isActive: false,
        path: '/my-client',
      },
      {
        label: 'Client Detail',
        isActive: false,
        path: '/my-client/:id',
        pathIdName: 'id',
      },
      {
        label: (params: URLSearchParams) => `${params.get('formName') || 'AMD Form'}`,
        isActive: true,
      },
    ],
  },
  PUBLIC_AMD_FORM: {
    path: '/public-amd-intake-form/:id',
    routeType: 'public',
    navigatePath: formAssignId => `/public-amd-intake-form/${formAssignId}`,
    element: <PublicAMDIntakeForm />,
  },
  PUBLIC_FORM: {
    path: '/public-form/:formAssignId',
    routeType: 'public',
    navigatePath: formAssignId => `/public-form/${formAssignId}`,
    element: <PublicForm />,
  },
  GENERAL_AGREEMENTS: {
    path: '/general-agreement/:agreementId',
    routeType: 'public',
    navigatePath: agreementId => `/general-agreement/${agreementId}`,
    element: <GeneralAgreement />,
  },
  CANCEL_APPOINTMENT: {
    path: '/cancel-appointment/:appointmentId',
    routeType: 'public',
    navigatePath: appointmentId => `/cancel-appointment/${appointmentId}`,
    element: <CancelAppointment />,
  },

  THIRD_PARTY_API_LOGS: {
    path: '/third-party-logs',
    routeType: 'authenticate',
    headerName: 'Third Party Logs',
    element: <ThirdPartyApiLogs />,
    breadcrumb: [
      {
        label: 'Third Party Logs',
        isActive: true,
      },
    ],
    permissions: {
      list: [
        PermissionType.THIRD_PARTY_LOGS_VIEW,
        ...(DEPENDENT_PERMISSIONS[PermissionType.THIRD_PARTY_LOGS_VIEW].allow ?? []),
      ],
    },
  },
  // THIRD_PARTY_API_LOGS_DETAILS: {
  //   path: '/third-party-api-logs/:id',
  //   navigatePath: id => `/third-party-logs/${id}`,
  //   routeType: 'authenticate',
  //   headerName: 'Third Party Logs',
  //   element: <ThirdPartyApiLogDetail />,
  //   breadcrumb: [
  //     {
  //       label: 'Third Party Logs',
  //       isActive: false,
  //       path: '/third-party-logs',
  //     },
  //     {
  //       label: 'Third Party Logs Details',
  //       isActive: true,
  //     },
  //   ],
  // },

  THIRD_PARTY_API_LOGS_DETAILS: {
    path: '/third-party-logs/:id',
    routeType: 'authenticate',
    navigatePath: id => `/third-party-logs/${id}`,
    headerName: 'Third Party Logs Details',
    element: <ThirdPartyApiLogDetail />,
    breadcrumb: [
      {
        label: 'Third Party Logs',
        isActive: false,
        path: '/third-party-logs',
      },
      {
        label: 'Third Party Logs Details',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.THIRD_PARTY_LOGS_VIEW],
    },
  },

  TRANSACTION_DETAILS: {
    path: '/transaction/:id',
    routeType: 'authenticate',
    navigatePath: id => `/transaction/${id}`,
    headerName: 'Transaction Details',
    element: <TransactionDetails />,
    breadcrumb: [
      {
        label: 'Transaction',
        isActive: false,
        path: '/transaction',
      },
      {
        label: 'Transaction Details',
        isActive: true,
      },
    ],
    permissions: {
      list: [PermissionType.TRANSACTIONS_VIEW],
    },
  },
  NOT_AUTHORIZED: {
    path: '/not-authorized',
    routeType: 'public',
    element: <NotAuthorized />,
  },
  NOT_FOUND: {
    path: '/not-found',
    routeType: 'public',
    element: <NotFound />,
  },
  UNKNOWN: {
    path: '*',
    routeType: 'public',
    element: <NotFound />,
  },
};
