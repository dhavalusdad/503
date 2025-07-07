import React from 'react';
import type { DashboardHeaderProps } from '../types';
import { Button } from '../../../components/ui/Button';

interface DashboardHeaderExtendedProps extends DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'name' | 'email' | 'company';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'name' | 'email' | 'company') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderExtendedProps> = ({
  stats,
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const getSortIcon = (field: 'name' | 'email' | 'company') => {
    if (sortBy !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total Users: {stats.totalUsers} • Active: {stats.activeUsers} • New: {stats.newUsers}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Sort Buttons */}
          <div className="flex space-x-2">
            {(['name', 'email', 'company'] as const).map((field) => (
              <Button
                key={field}
                variant="outline"
                size="sm"
                onClick={() => onSort(field)}
                className="flex items-center space-x-1"
              >
                <span className="capitalize">{field}</span>
                {getSortIcon(field)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 