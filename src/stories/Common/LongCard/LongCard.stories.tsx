import LongCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

// Mock data for stories
// Mock logos
const mockLogo = 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg';
const mockCompanyLogo = 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg';
const mockEventLogo = 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg';

const meta: Meta<typeof LongCard> = {
  title: 'Components/LongCard',
  component: LongCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible card component for displaying events, experiences, or any timeline-based information with optional nested related events.',
      },
    },
  },
  argTypes: {
    data: { control: 'object', description: 'Card data containing experiences' },
    isEnd: {
      control: 'boolean',
      description: 'Whether this is the last card (removes bottom border)',
    },
    isEditable: { control: 'boolean', description: 'Whether to show the edit button' },
    isChild: { control: 'boolean', description: 'Whether this card is a child/nested card' },
    onEdit: { action: 'edited', description: 'Callback when edit is clicked' },
    onDelete: { action: 'deleted', description: 'Callback when delete is clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LongCard>;

// Basic card with minimal info
export const Basic: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '1',
          designation: 'Software Engineer',
          organization: 'Tech Company Inc.',
          start_month: 1,
          start_year: 2023,
          end_month: null,
          end_year: null,
          location: 'San Francisco, CA',
        },
      ],
    },
    isEditable: false,
    isEnd: false,
    isChild: false,
  },
};

// Card with logo
export const WithLogo: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '2',
          designation: 'Senior Frontend Developer',
          organization: 'Innovation Labs',
          start_month: 3,
          start_year: 2022,
          end_month: 2,
          end_year: 2023,
          location: 'New York, NY',
          logo: mockLogo,
        },
      ],
    },
    isEditable: false,
    isEnd: false,
    isChild: false,
  },
};

// Editable card
export const Editable: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '3',
          designation: 'Product Manager',
          organization: 'StartupXYZ',
          start_month: 5,
          start_year: 2021,
          end_month: 4,
          end_year: 2022,
          location: 'Remote',
          logo: mockCompanyLogo,
        },
      ],
    },
    isEditable: true,
    isEnd: false,
    isChild: false,
  },
};

// Card without border (isEnd = true)
export const LastCard: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '4',
          designation: 'Junior Developer',
          organization: 'First Company',
          start_month: 6,
          start_year: 2020,
          end_month: 5,
          end_year: 2021,
          location: 'Boston, MA',
          logo: mockLogo,
        },
      ],
    },
    isEditable: false,
    isEnd: true,
    isChild: false,
  },
};

// Card with only designation (minimal data)
export const MinimalData: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '5',
          designation: 'Freelance Web Developer',
          start_month: 1,
          start_year: 2024,
          end_month: null,
          end_year: null,
        },
      ],
    },
    isEditable: false,
    isEnd: false,
    isChild: false,
  },
};

// Card with related events (nested structure)
export const WithRelatedEvents: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '6',
          designation: 'Tech Conference 2024',
          organization: 'Annual Technology Summit',
          start_month: 3,
          start_year: 2024,
          end_month: 3,
          end_year: 2024,
          location: 'Austin, TX',
          logo: mockCompanyLogo,
          relatedEvents: [
            {
              id: '6-1',
              designation: 'Keynote: Future of AI',
              organization: 'Dr. Jane Smith',
              start_month: 3,
              start_year: 2024,
              end_month: 3,
              end_year: 2024,
              location: 'Main Auditorium',
              logo: mockEventLogo,
            },
            {
              id: '6-2',
              designation: 'Workshop: React Best Practices',
              organization: 'Interactive Session',
              start_month: 3,
              start_year: 2024,
              end_month: 3,
              end_year: 2024,
              location: 'Room 201',
            },
            {
              id: '6-3',
              designation: 'Networking Dinner',
              start_month: 3,
              start_year: 2024,
              end_month: 3,
              end_year: 2024,
              location: 'Grand Ballroom',
              logo: mockEventLogo,
            },
          ],
        },
      ],
    },
    isEditable: true,
    isEnd: false,
    isChild: false,
  },
};

// Complex nested structure
export const ComplexNested: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '7',
          designation: 'Bachelor of Computer Science',
          organization: 'University of Technology',
          start_month: 8,
          start_year: 2018,
          end_month: 5,
          end_year: 2022,
          location: 'Cambridge, MA',
          logo: mockCompanyLogo,
          relatedEvents: [
            {
              id: '7-1',
              designation: "Dean's List",
              start_month: 9,
              start_year: 2021,
              end_month: 6,
              end_year: 2022,
            },
            {
              id: '7-2',
              designation: 'Capstone Project',
              organization: 'AI-Powered Task Management System',
              start_month: 1,
              start_year: 2022,
              end_month: 5,
              end_year: 2022,
              logo: mockEventLogo,
              relatedEvents: [
                {
                  id: '7-2-1',
                  designation: 'Project Presentation',
                  start_month: 5,
                  start_year: 2022,
                  location: 'CS Auditorium',
                },
                {
                  id: '7-2-2',
                  designation: 'Award: Best Technical Implementation',
                  start_month: 5,
                  start_year: 2022,
                },
              ],
            },
            {
              id: '7-3',
              designation: 'Study Abroad Program',
              organization: 'Technical University of Munich',
              start_month: 9,
              start_year: 2020,
              end_month: 12,
              end_year: 2020,
              location: 'Munich, Germany',
            },
          ],
        },
      ],
    },
    isEditable: true,
    isEnd: false,
    isChild: false,
  },
};

// Child card
export const ChildCard: Story = {
  args: {
    data: {
      experiences: [
        {
          id: '8',
          designation: 'Team Lead Promotion',
          organization: 'Led a team of 5 developers',
          start_month: 1,
          start_year: 2023,
          end_month: 1,
          end_year: 2023,
          logo: mockEventLogo,
        },
      ],
    },
    isEditable: false,
    isEnd: true,
    isChild: true,
  },
};

// Timeline example with multiple cards
export const Timeline: Story = {
  render: () => (
    <div className='max-w-2xl mx-auto bg-white p-6 rounded-lg'>
      <h2 className='text-2xl font-bold mb-6 text-gray-900'>Professional experiences</h2>
      <div className='space-y-0'>
        <LongCard
          data={{
            experiences: [
              {
                logo: mockCompanyLogo,
                title: 'Senior Software Engineer',
                subTitle: 'TechCorp Inc.',
                date: '2023 - Present',
                location: 'San Francisco, CA',
                relatedEvents: [
                  {
                    title: 'Led Migration to Microservices',
                    subTitle: 'Reduced system latency by 40%',
                    date: 'Q2 2024',
                  },
                  {
                    title: 'Promoted to Senior Level',
                    date: 'January 2024',
                  },
                ],
              },
            ],
          }}
          isEditable={true}
          onEdit={() => console.log('Edit clicked')}
        />
        <LongCard
          data={{
            experiences: [
              {
                logo: mockLogo,
                title: 'Software Engineer',
                subTitle: 'StartupXYZ',
                date: '2021 - 2023',
                location: 'New York, NY',
                relatedEvents: [
                  {
                    title: 'Built Customer Dashboard',
                    subTitle: 'React & Node.js application',
                    date: '2022',
                  },
                ],
              },
            ],
          }}
          isEditable={true}
          onEdit={() => console.log('Edit clicked')}
        />
        <LongCard
          data={{
            experiences: [
              {
                title: 'Junior Developer',
                subTitle: 'First Company',
                date: '2020 - 2021',
                location: 'Boston, MA',
              },
            ],
          }}
          isEditable={true}
          isEnd={true}
          onEdit={() => console.log('Edit clicked')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Example of how LongCard components can be used together to create a timeline or list view.',
      },
    },
  },
};

// Playground story for testing different combinations
export const Playground: Story = {
  args: {
    data: {
      experiences: [
        {
          logo: mockLogo,
          title: 'Your Title Here',
          subTitle: 'Your Subtitle Here',
          date: '2024',
          location: 'Your Location',
          relatedEvents: [
            {
              title: 'Related Event 1',
              date: 'Date 1',
            },
            {
              logo: mockEventLogo,
              title: 'Related Event 2',
              subTitle: 'With subtitle and logo',
              date: 'Date 2',
              location: 'Location 2',
            },
          ],
        },
      ],
    },
    isEditable: true,
    isEnd: false,
    isChild: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this story to experiment with different prop combinations and see how they affect the component.',
      },
    },
  },
};
