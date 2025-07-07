import { useState, useMemo } from 'react';
import { useGetDashboardData } from '../../../api/dashboard';
import type { DashboardUser } from '../types';
import { filterUsers, sortUsers, transformDashboardData } from '../services/dashboard.service';

export const useDashboard = () => {
  const { data: rawData, isLoading, error,dataUpdatedAt } = useGetDashboardData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Transform and process data
  const dashboardData = useMemo(() => {
    if (!rawData) return null;
    return transformDashboardData(rawData);
  }, [dataUpdatedAt]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!dashboardData?.users) return [];
    
    const filtered = filterUsers(dashboardData.users, searchTerm);
    return sortUsers(filtered, sortBy, sortOrder);
  }, [dashboardData?.users, searchTerm, sortBy, sortOrder]);

  // Handle user selection
  const handleUserClick = (user: DashboardUser) => {
    console.log('User clicked:', user);
    // Add your user click logic here
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle sorting
  const handleSort = (field: 'name' | 'email' | 'company') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return {
    // Data
    dashboardData,
    users: filteredAndSortedUsers,
    stats: dashboardData?.stats,
    
    // State
    searchTerm,
    sortBy,
    sortOrder,
    isLoading,
    error,
    
    // Actions
    handleUserClick,
    handleSearch,
    handleSort,
  };
}; 