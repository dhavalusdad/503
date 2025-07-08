import { useDashboard, DashboardCard, UserCard } from '../../features/dashboard';
import { SectionLoader } from '@/stories/Common/Loader/Spinner';

const Dashboard = () => {
  const {
    users,
    stats,
    isLoading,
    error,
    handleUserClick,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SectionLoader  />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading dashboard</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-600">Dashboard data is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <DashboardHeader
        stats={stats}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      /> */}

      <div className="px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Users"
            value={stats.totalUsers}
            icon={
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Active Users"
            value={stats.activeUsers}
            icon={
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ value: 8, isPositive: true }}
          />
          <DashboardCard
            title="New Users"
            value={stats.newUsers}
            icon={
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
            trend={{ value: 15, isPositive: true }}
          />
          <DashboardCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={
              <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Users Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users ({users?.length})</h2>
          </div>
          <div className="p-6">
            {users?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users?.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onUserClick={handleUserClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;