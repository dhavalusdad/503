import {  useMemo } from 'react';
import { useGetDashboardData } from '../../../api/dashboard';
import type { DashboardUser } from '../types';
import { transformDashboardData } from '../services/dashboard.service';

export const useDashboard = () => {
  const { data: rawData, isLoading, error,dataUpdatedAt } = useGetDashboardData();

  // Transform and process data
  const dashboardData = useMemo(() => {
    if (!rawData) return null;
    return transformDashboardData(rawData);
  }, [dataUpdatedAt]);

  // Filter and sort users
  // Handle user selection
  const handleUserClick = (user: DashboardUser) => {
    console.log('User clicked:', user);
    // Add your user click logic here
  };


  return {
    // Data
    dashboardData,
    users: dashboardData?.users,
    stats: dashboardData?.stats,
    
    // State
    isLoading,
    error,
    
    // Actions
    handleUserClick,
  };
}; 