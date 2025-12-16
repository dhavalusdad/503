import { NoteCard } from '@/stories/Common/NoteCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof NoteCard> = {
  title: 'NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A card component for displaying note content with edit functionality. Users can view notes and edit them inline with save/discard options.',
      },
    },
  },
  argTypes: {
    title: {
      description: 'The title of the note',
      control: 'text',
    },
    content: {
      description: 'The main content/body of the note',
      control: 'text',
    },
    updated_at: {
      description: 'Timestamp showing when the note was last updated',
      control: 'text',
    },
    onSave: {
      description: 'Callback function called when note is saved',
      action: 'saved',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    title: 'Meeting Notes - Q4 Planning',
    content:
      'Discussed quarterly goals and budget allocation. Key decisions: increase marketing spend by 15%, hire 2 new developers, launch product beta in December. Action items: Sarah to prepare budget proposal, Mike to review candidate resumes, Lisa to finalize beta testing plan.',
    updated_at: '2 hours ago',
    onSave: noteData => console.log('Note saved:', noteData),
  },
};

// Story with long content
export const LongContent: Story = {
  args: {
    title: 'Project Requirements - Mobile App Redesign',
    content:
      'The mobile app redesign project aims to improve user experience and increase engagement. We need to focus on simplifying the navigation, updating the visual design to match our new brand guidelines, and implementing accessibility improvements. The project timeline is 3 months with the following phases: Phase 1 - User research and wireframing (4 weeks), Phase 2 - UI design and prototyping (6 weeks), Phase 3 - Development and testing (2 weeks). Budget allocated is $50,000 with resources from design, development, and QA teams. Additional considerations include user testing sessions, stakeholder reviews, and post-launch monitoring to ensure successful implementation.',
    updated_at: '1 day ago',
    onSave: noteData => console.log('Long note saved:', noteData),
  },
  parameters: {
    docs: {
      description: {
        story: 'Note card with longer content to test text wrapping and layout behavior.',
      },
    },
  },
};

// Story with short content
export const ShortContent: Story = {
  args: {
    title: 'Quick Reminder',
    content: 'Call dentist to schedule appointment.',
    updated_at: '5 minutes ago',
    onSave: noteData => console.log('Short note saved:', noteData),
  },
  parameters: {
    docs: {
      description: {
        story: 'Note card with minimal content to test compact layout.',
      },
    },
  },
};

// Story with recent timestamp
export const RecentlyUpdated: Story = {
  args: {
    title: 'Urgent Task Update',
    content:
      'Client feedback received. Need to address the color scheme concerns and adjust the typography for better readability. Timeline moved up by one week.',
    updated_at: 'Just now',
    onSave: noteData => console.log('Recent note saved:', noteData),
  },
  parameters: {
    docs: {
      description: {
        story: 'Note card showing a recently updated note.',
      },
    },
  },
};

// Story with old timestamp
export const OlderNote: Story = {
  args: {
    title: 'Archive - Legacy System Notes',
    content:
      'Documentation for the old payment system. Keep for reference during migration. Contains API endpoints, database schemas, and integration details that might be useful for troubleshooting.',
    updated_at: '3 months ago',
    onSave: noteData => console.log('Archive note saved:', noteData),
  },
  parameters: {
    docs: {
      description: {
        story: 'Note card with an older timestamp to test different time displays.',
      },
    },
  },
};

// Story without callbacks (for testing without actions)
export const WithoutCallbacks: Story = {
  args: {
    title: 'Read-Only Style Note',
    content:
      "This note demonstrates the component behavior without callback functions. Edit functionality will still work but won't trigger external actions.",
    updated_at: '1 week ago',
  },
  parameters: {
    docs: {
      description: {
        story: 'Note card without onSave and onDiscard callbacks to test optional prop behavior.',
      },
    },
  },
};

// Interactive story for testing edit mode
export const InteractiveEditTest: Story = {
  args: {
    title: 'Test Editing Functionality',
    content:
      'Click the edit button to test the inline editing feature. Try modifying the title and content, then save or discard changes.',
    updated_at: '30 minutes ago',
    onSave: noteData => {
      console.log('Interactive note saved:', noteData);
      alert(
        `Note saved!\nTitle: ${noteData.title}\nContent: ${noteData.content.substring(0, 50)}...`
      );
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive story for testing the edit functionality. Click edit, make changes, and test save/discard actions.',
      },
    },
  },
};
