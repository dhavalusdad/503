import type { OptionType } from '@/features/calendar/types';

// Credentialing Item Types
export interface CredentialingFormData {
  carrierName: OptionType | null;
  dateRoster: string | Date | null;
  recredentialDate: string | Date | null;
  status: string;
  ticketId: string;
  state: OptionType | null;
  credentialDate: string | Date | null;
  recredentialInProgress: boolean;
  idNumber: string;
}

export interface CredentialingItem {
  id: string;
  carrier_id: string;
  carrier?: {
    carrier_name: string;
    id: string;
  };
  state_id: string;
  state: {
    id: string;
    state: {
      id: string;
      name: string;
    };
  };
  date_roster: string;
  credential_date: string;
  recredential_date?: string;
  id_number: string | number;
  ticket_id: string;
  status: 'Credentialed' | 'Denied' | 'Expired' | 'On Roster' | 'Pending';
  is_recredential_in_progress?: boolean;
}
