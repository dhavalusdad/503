import Card from '@/stories/Common/Card';

import type { Therapist } from '@/stories/Common/Card/types';
import type { Meta, StoryObj } from '@storybook/react';

// Mock data for different scenarios
const mockTherapistWithAvailability: Therapist = {
  id: '1',
  bio: 'Dr. Sarah Johnson is a licensed clinical psychologist with extensive experience in cognitive behavioral therapy, anxiety disorders, and trauma recovery. She specializes in helping individuals overcome life challenges through evidence-based therapeutic approaches.',
  years_experience: 8,
  user: {
    id: 'user-1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    gender: 'female',
    profile_image: '/images/therapist-1.jpg',
  },
  specialist: [
    {
      area_of_focus_id: '1',
      area_of_focus: {
        name: 'Anxiety Disorders',
      },
    },
    {
      area_of_focus_id: '2',
      area_of_focus: {
        name: 'Cognitive Behavioral Therapy',
      },
    },
    {
      area_of_focus_id: '3',
      area_of_focus: {
        name: 'Trauma Recovery',
      },
    },
  ],
  availability: [
    {
      id: 'avail-1',
      start_time: '2024-01-15T09:00:00Z',
      end_time: '2024-01-15T10:00:00Z',
      status: 'Available',
    },
    {
      id: 'avail-2',
      start_time: '2024-01-15T14:00:00Z',
      end_time: '2024-01-15T15:00:00Z',
      status: 'Available',
    },
    {
      id: 'avail-3',
      start_time: '2024-01-15T16:30:00Z',
      end_time: '2024-01-15T17:30:00Z',
      status: 'Available',
    },
    {
      id: 'avail-4',
      start_time: '2024-01-15T18:00:00Z',
      end_time: '2024-01-15T19:00:00Z',
      status: 'Available',
    },
  ],
};

const mockTherapistNoAvailability: Therapist = {
  id: '2',
  bio: 'Dr. Michael Chen is a compassionate therapist who focuses on relationship counseling and family therapy. With over 12 years of experience, he helps couples and families navigate complex emotional challenges.',
  years_experience: 12,
  user: {
    id: 'user-2',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'michael.chen@example.com',
    gender: 'male',
    profile_image: '/images/therapist-2.jpg',
  },
  specialist: [
    {
      area_of_focus_id: '4',
      area_of_focus: {
        name: 'Relationship Counseling',
      },
    },
    {
      area_of_focus_id: '5',
      area_of_focus: {
        name: 'Family Therapy',
      },
    },
  ],
  availability: [
    {
      id: 'avail-5',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T11:00:00Z',
      status: 'Booked',
    },
    {
      id: 'avail-6',
      start_time: '2024-01-15T15:00:00Z',
      end_time: '2024-01-15T16:00:00Z',
      status: 'Unavailable',
    },
  ],
};

const mockTherapistMinimalData: Therapist = {
  id: '3',
  user: {
    id: 'user-3',
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    gender: 'female',
    profile_image: '/images/therapist-3.jpg',
  },
};

const mockTherapistNewTherapist: Therapist = {
  id: '4',
  bio: 'Alex Thompson is a newly licensed therapist passionate about helping young adults navigate life transitions, career stress, and personal growth.',
  years_experience: 1,
  user: {
    id: 'user-4',
    first_name: 'Alex',
    last_name: 'Thompson',
    email: 'alex.thompson@example.com',
    gender: 'non-binary',
    profile_image: '/images/therapist-4.jpg',
  },
  specialist: [
    {
      area_of_focus_id: '6',
      area_of_focus: {
        name: 'Life Transitions',
      },
    },
  ],
  availability: [
    {
      id: 'avail-7',
      start_time: '2024-01-15T11:00:00Z',
      end_time: '2024-01-15T12:00:00Z',
      status: 'Available',
    },
    {
      id: 'avail-8',
      start_time: '2024-01-15T13:00:00Z',
      end_time: '2024-01-15T14:00:00Z',
      status: 'Available',
    },
  ],
};

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A card component for displaying therapist information, availability, and booking options. Features hover overlay with detailed information.',
      },
    },
  },
  argTypes: {
    data: {
      description: 'Therapist data object containing user info, specialties, and availability',
      control: false,
    },
    isDatepicker: {
      description: 'Whether to show calendar icon for date selection',
      control: 'boolean',
    },
    onClick: {
      description: 'Click handler for the booking button',
      action: 'clicked',
    },
    index: {
      description: 'Card index for positioning hover overlay (affects left/right placement)',
      control: { type: 'number', min: 0, max: 10 },
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

// Default story with available therapist
export const Default: Story = {
  args: {
    data: mockTherapistWithAvailability,
    isDatepicker: false,
    index: 0,
    onClick: () => console.log('Book Now clicked'),
  },
};

// Therapist with no availability
export const NoAvailability: Story = {
  args: {
    data: mockTherapistNoAvailability,
    isDatepicker: false,
    index: 1,
    onClick: () => console.log('Request Sent'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the card appears when the therapist has no available time slots. The booking button is disabled and shows "Request Sent".',
      },
    },
  },
};

// With date picker enabled
export const WithDatePicker: Story = {
  args: {
    data: mockTherapistWithAvailability,
    isDatepicker: true,
    index: 2,
    onClick: () => console.log('Book Now with date picker'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Card with date picker enabled, showing the calendar icon when there are multiple available time slots.',
      },
    },
  },
};

// Minimal data (new therapist)
export const MinimalData: Story = {
  args: {
    data: mockTherapistMinimalData,
    isDatepicker: false,
    index: 0,
    onClick: () => console.log('Minimal data clicked'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Card with minimal therapist data - no bio, experience, specialties, or availability. Shows how the component handles missing data gracefully.',
      },
    },
  },
};

// New therapist with limited experience
export const NewTherapist: Story = {
  args: {
    data: mockTherapistNewTherapist,
    isDatepicker: false,
    index: 1,
    onClick: () => console.log('New therapist clicked'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Card showing a newly licensed therapist with 1 year of experience and limited specialties.',
      },
    },
  },
};

// Right-aligned hover (index divisible by 4 minus 1)
export const RightAlignedHover: Story = {
  args: {
    data: mockTherapistWithAvailability,
    isDatepicker: false,
    index: 3, // This will trigger right-aligned hover
    onClick: () => console.log('Right-aligned hover clicked'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Card with hover overlay positioned to the left (when index % 4 === 3). Useful for cards at the right edge of a grid.',
      },
    },
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    data: mockTherapistWithAvailability,
    isDatepicker: false,
    index: 0,
    className: 'shadow-lg border-2 border-blue-200',
    onClick: () => console.log('Custom styled clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with custom CSS classes applied for additional styling.',
      },
    },
  },
};

// Interactive demo with multiple cards
export const GridDemo: Story = {
  render: () => (
    <div className='grid grid-cols-4 gap-4 max-w-6xl'>
      <Card
        data={mockTherapistWithAvailability}
        isDatepicker={false}
        index={0}
        onClick={() => console.log('Card 1 clicked')}
      />
      <Card
        data={mockTherapistNoAvailability}
        isDatepicker={true}
        index={1}
        onClick={() => console.log('Card 2 clicked')}
      />
      <Card
        data={mockTherapistNewTherapist}
        isDatepicker={false}
        index={2}
        onClick={() => console.log('Card 3 clicked')}
      />
      <Card
        data={mockTherapistMinimalData}
        isDatepicker={false}
        index={3}
        onClick={() => console.log('Card 4 clicked')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demo showing multiple cards in a grid layout to demonstrate hover positioning logic and different states.',
      },
    },
  },
};

// Loading state simulation
export const LoadingState: Story = {
  args: {
    data: {
      id: 'loading',
      user: {
        id: 'loading-user',
        first_name: 'Loading',
        last_name: '...',
        email: 'loading@example.com',
        gender: 'unknown',
        profile_image: '',
      },
    },
    isDatepicker: false,
    index: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates how the card might appear during loading state with minimal data.',
      },
    },
  },
};

// Error state with missing user data
export const ErrorState: Story = {
  args: {
    data: {
      id: 'error-therapist',
      bio: 'This therapist has incomplete profile data.',
      years_experience: 5,
    } as Therapist, // Type assertion to allow incomplete data for testing
    isDatepicker: false,
    index: 0,
    onClick: () => console.log('Error state clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component handles missing user data gracefully.',
      },
    },
  },
};
