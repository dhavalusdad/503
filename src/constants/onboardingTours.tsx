import { type TourStep } from '@/stories/Common/Tour';

export const clientOnboardingTourSteps: TourStep[] = [
  {
    target: '#tour-welcome-section',
    showCenterModal: true,
    content: (
      <div className='text-center'>
        <h2 className='font-semibold text-primary text-lg'>Welcome!</h2>
        <p className='text-sm text-gray-600 mt-1'>
          Let’s take a quick tour to help you get familiar with booking a therapy session.
        </p>
      </div>
    ),
  },
  {
    target: '#tour-book-btn',
    clickTargetOnNext: '#tour-book-btn',
    content: 'Quickly schedule a new therapy session with the therapist using this button.',
    placement: 'left' as const,
    arrowPosition: 'start' as const,
    title: 'Book Appointment',
    willNavigate: true,
  },
  {
    target: '#tour-filters-section',
    placement: 'bottom' as const,
    title: 'Therapist Filters',
    content: `
      Customize your therapist search using State, City, Payment Method,
      Therapy Type and more. Adjust any filters to refine your results.
    `,
  },
  {
    target: '#tour-search-therapist-btn',
    placement: 'left' as const,
    title: 'Search Therapist',
    content: 'Once done, click here to search therapists that match your chosen filters.',
    clickTargetOnNext: '#tour-sidebar-dashboard',
    willNavigate: true,
  },
  {
    target: '#tour-appoimentment-card',
    placement: 'bottom' as const,
    arrowPosition: 'center' as const,
    title: 'Upcoming Appointments',
    content: 'View your scheduled therapy sessions. You can join, reschedule, or cancel from here.',
  },
  {
    target: '#tour-pendingprofile-info',
    placement: 'bottom' as const,
    arrowPosition: 'center' as const,
    title: 'Pending Steps',
    content:
      'Complete your onboarding tasks here. These steps help us personalize your therapy experience.',
  },
  {
    target: '#tour-profile-menu',
    placement: 'bottom' as const,
    arrowPosition: 'end' as const,
    title: 'Your Profile',
    content: 'Access your account details and settings here.',
    clickTargetOnNext: '#tour-sidebar-myappointment',
  },
  {
    target: '#tour-sidebar-myappointment',
    placement: 'right' as const,
    arrowPosition: 'start' as const,
    title: 'My Appointments',
    content:
      'You can check your appointments booked, completed, upcoming, and cancelled from here.',
  },
  {
    target: '#tour-chat-icon',
    placement: 'left' as const,
    arrowPosition: 'start' as const,
    title: 'Therapist Chat',
    content: 'You can jump into chat with your therapist',
    clickTargetOnNext: '#tour-sidebar-transaction',
  },
  {
    target: '#tour-sidebar-transaction',
    placement: 'right' as const,
    arrowPosition: 'start' as const,
    title: 'Transactions',
    content: 'View all transaction records for completed sessions.',
  },
  {
    target: '#tour-sidebar-preferences',
    placement: 'right' as const,
    arrowPosition: 'start' as const,
    title: 'Preferences',
    content: 'Customize your account settings and preferences.',
    clickTargetsBeforeEnter: ['#tour-sidebar-preferences', '#tour-sidebar-generalsetting'],
  },
  {
    target: '#tour-timezone-select',
    placement: 'bottom' as const,
    arrowPosition: 'end' as const,
    title: 'Timezone',
    content: 'Choose your timezone for accurate appointment scheduling.',
  },
  {
    target: '#tour-notification-section',
    placement: 'top' as const,
    arrowPosition: 'center' as const,
    title: 'Notification',
    content: 'Manage email and push notification preferences.',
    clickTargetOnNext: '#tour-payment-tab',
    willNavigate: true,
  },
  {
    target: '#tour-addNewPatmentMethod-btn',
    placement: 'left' as const,
    arrowPosition: 'start' as const,
    title: 'Payment Method',
    content: 'Save your credit or debit card for easy payments.',
    clickTargetOnNext: '#tour-insurance-tab',
    willNavigate: true,
  },
  {
    target: '#tour-addInsurance-btn',
    clickTargetOnNext: '#tour-sidebar-myagreement',
    placement: 'left' as const,
    arrowPosition: 'start' as const,
    title: 'Insurance',
    content: 'Add or manage your insurance details for billing.',
  },
  {
    target: '#tour-sidebar-myagreement',
    clickTargetOnNext: '#tour-sidebar-sessionducuments',
    placement: 'right' as const,
    arrowPosition: 'start' as const,
    title: 'My Agreements',
    content: 'Access and review all your signed agreements.',
  },
  {
    target: '#tour-sidebar-sessionducuments',
    placement: 'right' as const,
    arrowPosition: 'start' as const,
    title: 'Session Documents',
    content: 'Access documents from your therapy sessions.',
  },
];

export const TOUR_KEYS = {
  CLIENT_ONBOARD: 'client_onboard_tour',
} as const;

export const TOURS_MAP = {
  [TOUR_KEYS.CLIENT_ONBOARD]: clientOnboardingTourSteps,
};

export type TourKey = keyof typeof TOURS_MAP;
