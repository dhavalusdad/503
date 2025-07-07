import type { DashboardUser, DashboardStats, DashboardData } from '../types';

// Mock stats calculation - in real app, this would come from API
const calculateStats = (users: DashboardUser[]): DashboardStats => {
  return {
    totalUsers: users.length,
    activeUsers: Math.floor(users.length * 0.8), // 80% active
    newUsers: Math.floor(users.length * 0.2), // 20% new
    totalRevenue: users.length * 1000, // Mock revenue
  };
};

export const transformDashboardData = (users: DashboardUser[]): DashboardData => {
  return {
    users,
    stats: calculateStats(users),
  };
};

// Filter users by search term
// export const filterUsers = (users: DashboardUser[], searchTerm: string): DashboardUser[] => {
//   if (!searchTerm.trim()) return users;
  
//   return users.filter(user => 
//     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.company.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
// };

// Sort users by different criteria
// export const sortUsers = (users: DashboardUser[], sortBy: 'name' | 'email' | 'company', order: 'asc' | 'desc' = 'asc'): DashboardUser[] => {
//   return [...users].sort((a, b) => {
//     let aValue: string;
//     let bValue: string;
    
//     switch (sortBy) {
//       case 'name':
//         aValue = a.name;
//         bValue = b.name;
//         break;
//       case 'email':
//         aValue = a.email;
//         bValue = b.email;
//         break;
//       case 'company':
//         aValue = a.company.name;
//         bValue = b.company.name;
//         break;
//       default:
//         aValue = a.name;
//         bValue = b.name;
//     }
    
//     if (order === 'asc') {
//       return aValue.localeCompare(bValue);
//     } else {
//       return bValue.localeCompare(aValue);
//     }
//   });
// }; 