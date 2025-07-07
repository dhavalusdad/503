export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastVisit: string;
  totalSessions: number;
  therapist: string;
}

export interface ClientTableColumn {
  id: keyof Client;
  header: string;
  accessorKey: keyof Client;
  cell?: (value: Client[keyof Client]) => React.ReactNode;
} 