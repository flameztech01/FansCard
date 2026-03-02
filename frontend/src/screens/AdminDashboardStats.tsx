import { useState, useEffect } from 'react';
import AdminNavbar from "../components/AdminNavbar";
import { useGetUsersQuery } from '../slices/adminApiSlice';
import { DollarSign, Users, TrendingUp, Download, RefreshCw } from 'lucide-react';

// Exchange rate (you might want to fetch this from an API)
const USD_TO_NGN_RATE = 1500; // Example rate - replace with actual rate

interface User {
  _id: string;
  name: string;
  email: string;
  amount?: number;
  paid: boolean;
  status: string;
  packageType?: string;
  createdAt: string;
}

const AdminDashboardStats = () => {
  const { data: users, isLoading, error, refetch } = useGetUsersQuery({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    totalRevenueUSD: 0,
    totalRevenueNGN: 0,
    commissionUSD: 0,
    commissionNGN: 0,
  });

  // ✅ helper to safely format package name
  const formatPackageType = (pkg?: string) => {
    if (!pkg) return 'Basic';
    return pkg.charAt(0).toUpperCase() + pkg.slice(1);
  };

  useEffect(() => {
    if (users) {
      // Filter only paid users (approved status)
      const paidUsersList = users.filter((user: User) =>
        user.paid === true && user.status === 'approved'
      );

      // Calculate total revenue from paid users
      const totalRevenueUSD = paidUsersList.reduce((sum: number, user: User) =>
        sum + (user.amount || 0), 0
      );

      // Calculate commission (30%)
      const commissionUSD = totalRevenueUSD * 0.3;

      // Convert to NGN
      const totalRevenueNGN = totalRevenueUSD * USD_TO_NGN_RATE;
      const commissionNGN = commissionUSD * USD_TO_NGN_RATE;

      setStats({
        totalUsers: users.length,
        paidUsers: paidUsersList.length,
        totalRevenueUSD,
        totalRevenueNGN,
        commissionUSD,
        commissionNGN,
      });
    }
  }, [users]);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // ✅ safe conversion rate (avoid divide by 0)
  const conversionRate =
    stats.totalUsers > 0 ? (stats.paidUsers / stats.totalUsers) * 100 : 0;

  if (isLoading) {
    return (
      <div>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32"></div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Error Loading Statistics
              </h2>
              <p className="text-gray-600 mb-4">There was a problem fetching the data.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Statistics</h1>
              <p className="text-gray-600 mt-2">Overview of payments and commissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Total Registered
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-sm text-gray-600 mt-1">Total users</p>
            </div>

            {/* Paid Users */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Paid Users
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.paidUsers)}</p>
              <p className="text-sm text-gray-600 mt-1">Users who have paid</p>
              <p className="text-xs text-gray-500 mt-2">
                {conversionRate.toFixed(1)}% conversion rate
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  Total Revenue
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatUSD(stats.totalRevenueUSD)}</p>
              <p className="text-sm text-gray-600 mt-1">USD</p>
              <p className="text-xs text-gray-500 mt-2">{formatNGN(stats.totalRevenueNGN)}</p>
            </div>

            {/* Commission */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  Your Commission (30%)
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatUSD(stats.commissionUSD)}</p>
              <p className="text-sm text-gray-600 mt-1">USD</p>
              <p className="text-xs text-gray-500 mt-2">{formatNGN(stats.commissionNGN)}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Paid Users List</h2>
              <p className="text-sm text-gray-600 mt-1">Users who have completed payment</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (USD)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount (NGN)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission (30%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {users
                    ?.filter((user: User) => user.paid === true && user.status === 'approved')
                    .map((user: User) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.packageType === 'premium'
                                ? 'bg-purple-100 text-purple-700'
                                : user.packageType === 'standard'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {/* ✅ fixed: safe formatting */}
                            {formatPackageType(user.packageType)}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium">{formatUSD(user.amount || 0)}</td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatNGN((user.amount || 0) * USD_TO_NGN_RATE)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-medium text-yellow-600">
                            {formatUSD((user.amount || 0) * 0.3)}
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatNGN((user.amount || 0) * 0.3 * USD_TO_NGN_RATE)}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStats;