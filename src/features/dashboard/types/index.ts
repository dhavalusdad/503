// Dashboard Data Types
export interface DashboardUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalRevenue: number;
}

export interface DashboardData {
  users: DashboardUser[];
  stats: DashboardStats;
}

// Component Props Types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface DashboardHeaderProps {
  stats: DashboardStats;
}

export interface PendingFormListProps {
  id: string;
  form_title: string;
  status: string;
  form_id: string;
  assigned_to: string;
  appointment_id: null;
  assigned_by: string;
  submitted_at: null;
  created_at: Date;
  updated_at: Date;
  assignedByUser: {
    id: string;
    first_name: string;
    last_name: string;
  };
  form: {
    id: string;
    due_date: Date;
  };
}

//pending assingment form

interface AppointmentSlot {
  start_time: string;
  end_time: string;
}

interface Appointment {
  id: string;
  client_id: string;
  slot: AppointmentSlot;
}

interface AssignedUser {
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

export interface UnsignedFormNote {
  id: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  form_title?: string;
  assignedUser?: AssignedUser;
  appointment?: Appointment;
}
