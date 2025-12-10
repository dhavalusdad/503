import type { AppointmentData, AppointmentTable, SessionNote } from '@/features/appointment/types';

// Dummy Data
export const appointmentData: AppointmentTable[] = [
  {
    id: '1',
    clientName: 'Jane Smith',
    appointmentId: '550e8400-e29b-41d4-a716-446655440001',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Self Pay',
    sessionStatus: 'Upcoming',
  },
  {
    id: '2',
    clientName: 'Terrence Kshterin',
    appointmentId: '550e8400-e29b-41d4-a716-446655440002',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Insurance Pay',
    sessionStatus: 'Upcoming',
  },
  {
    id: '3',
    clientName: 'Lindsay Roberts',
    appointmentId: '550e8400-e29b-41d4-a716-446655440003',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '25:00',
    status: 'Insurance Pay',
    sessionStatus: 'Completed',
  },
  {
    id: '4',
    clientName: 'Derrick Marquardt',
    appointmentId: '550e8400-e29b-41d4-a716-446655440004',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '30:00',
    status: 'Insurance Pay',
    sessionStatus: 'Completed',
  },
  {
    id: '5',
    clientName: 'Jeanette Goyette',
    appointmentId: '550e8400-e29b-41d4-a716-446655440005',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '15:00',
    status: 'Self Pay',
    sessionStatus: 'Completed',
  },
  {
    id: '6',
    clientName: 'Bobbie Skiles',
    appointmentId: '550e8400-e29b-41d4-a716-446655440006',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '20:00',
    status: 'Self Pay',
    sessionStatus: 'Cancelled',
  },
  {
    id: '7',
    clientName: 'Tami Heidenreich',
    appointmentId: '550e8400-e29b-41d4-a716-446655440007',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Self Pay',
    sessionStatus: 'No Show',
  },
  {
    id: '8',
    clientName: 'Billie Barrows',
    appointmentId: '550e8400-e29b-41d4-a716-446655440008',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Insurance Pay',
    sessionStatus: 'Cancelled',
  },
  {
    id: '9',
    clientName: 'Jane Smith',
    appointmentId: '550e8400-e29b-41d4-a716-446655440009',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Insurance Pay',
    sessionStatus: 'Cancelled',
  },
  {
    id: '10',
    clientName: 'Terrence Kshterin',
    appointmentId: '550e8400-e29b-41d4-a716-446655440010',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '20:00',
    status: 'Insurance Pay',
    sessionStatus: 'Completed',
  },
  {
    id: '11',
    clientName: 'Lindsay Roberts',
    appointmentId: '550e8400-e29b-41d4-a716-446655440011',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Insurance Pay',
    sessionStatus: 'Cancelled',
  },
  {
    id: '12',
    clientName: 'Derrick Marquardt',
    appointmentId: '550e8400-e29b-41d4-a716-446655440012',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '30:00',
    status: 'Self Pay',
    sessionStatus: 'Completed',
  },
  {
    id: '13',
    clientName: 'Jeanette Goyette',
    appointmentId: '550e8400-e29b-41d4-a716-446655440013',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '',
    status: 'Self Pay',
    sessionStatus: 'Cancelled',
  },
  {
    id: '14',
    clientName: 'Bobbie Skiles',
    appointmentId: '550e8400-e29b-41d4-a716-446655440014',
    date: 'Apr 13, 2025',
    time: '2:30 PM',
    duration: '20:00',
    status: 'Self Pay',
    sessionStatus: 'Completed',
  },
];

export const appointmentDataSample: AppointmentData = {
  appointmentId: '550e8400-e29b-41d4-a716-446655440000',
  clientName: 'Sarah Johnson',
  clientAvatar: 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg',
  status: 'confirmed',
  bookedOn: 'Jan 15, 2024',
  appointmentDate: 'Jan 22, 2024',
  appointmentTime: '2:00 PM - 3:00 PM',
  duration: '60 minutes',
  areaOfFocus: 'Anxiety Management',
  therapyType: 'Cognitive Behavioral Therapy',
  sessionType: 'Individual Session',
  reasonForVisit: 'Stress and work-life balance issues',
};

export const sessionNotesData: Record<'before' | 'during' | 'after', SessionNote[]> = {
  before: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Client preparation and pre-session assessment',
      content:
        "Client reported increased anxiety levels this week due to work deadlines. Completed PHQ-9 assessment - score of 12 indicating moderate depression symptoms. Client requested to focus on coping strategies during today's session.",
      updatedAt: '2 hours ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Review of homework assignments',
      content:
        'Client completed daily mood tracking as assigned. Noted patterns of increased anxiety in the mornings. Relaxation techniques practiced 4 out of 7 days.',
      updatedAt: '1 day ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Session goals and objectives',
      content:
        'Primary goals: 1) Address work-related stress triggers, 2) Practice grounding techniques, 3) Review progress on sleep hygiene improvements.',
      updatedAt: '1 day ago',
    },
  ],
  during: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Cognitive restructuring exercise',
      content:
        'Worked on identifying negative thought patterns related to work performance. Client demonstrated good insight into catastrophic thinking. Practiced thought challenging techniques using the ABCDE model.',
      updatedAt: '30 minutes ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Breathing and relaxation techniques',
      content:
        'Introduced progressive muscle relaxation. Client responded well to guided practice. Reported decreased tension in shoulders and jaw after 10-minute session.',
      updatedAt: '25 minutes ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Discussion of coping strategies',
      content:
        'Reviewed current coping mechanisms. Identified healthy (exercise, journaling) and unhealthy (caffeine overuse, isolation) strategies. Developed plan to increase healthy coping.',
      updatedAt: '15 minutes ago',
    },
  ],
  after: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Session summary and key takeaways',
      content:
        'Client gained insight into connection between thoughts and physical symptoms. Successfully practiced relaxation technique. Expressed commitment to implementing daily practice routine.',
      updatedAt: '5 minutes ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Homework assignments for next week',
      content:
        'Continue mood tracking with emphasis on identifying triggers. Practice progressive muscle relaxation daily for 10 minutes. Complete thought record worksheet for 3 stressful situations.',
      updatedAt: '3 minutes ago',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Next session planning',
      content:
        'Scheduled follow-up for same time next week. Plan to review homework progress and introduce mindfulness meditation techniques. Consider discussing medication consultation with psychiatrist.',
      updatedAt: '1 minute ago',
    },
  ],
};
