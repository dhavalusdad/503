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

export interface UserCardProps {
  user: DashboardUser;
  onUserClick?: (user: DashboardUser) => void;
}

export interface DashboardHeaderProps {
  stats: DashboardStats;
} 