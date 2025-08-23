import React from 'react';
import { useAppSelector } from '../../app/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Package, Truck, Box } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Income',
      value: '$68,279',
      change: '+8.1%',
      changeType: 'positive',
      description: 'than last month',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expense',
      value: '$43,691',
      change: '-3.1%',
      changeType: 'negative',
      description: 'than last month',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Customers',
      value: '10,699',
      change: '+7.2%',
      changeType: 'positive',
      description: 'than last month',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 95000, netProfit: 35000, taxes: 15000, owes: 25000 },
    { month: 'Feb', revenue: 85000, netProfit: 32000, taxes: 14000, owes: 22000 },
    { month: 'Mar', revenue: 110000, netProfit: 40000, taxes: 18000, owes: 28000 },
    { month: 'Apr', revenue: 98000, netProfit: 37000, taxes: 16000, owes: 24000 },
    { month: 'May', revenue: 115000, netProfit: 42000, taxes: 19000, owes: 29000 },
    { month: 'Jun', revenue: 137459, netProfit: 98786, taxes: 27130, owes: 41092 },
    { month: 'Jul', revenue: 125000, netProfit: 45000, taxes: 20000, owes: 31000 },
    { month: 'Aug', revenue: 118000, netProfit: 43000, taxes: 19000, owes: 30000 },
    { month: 'Sep', revenue: 105000, netProfit: 38000, taxes: 17000, owes: 26000 },
    { month: 'Oct', revenue: 122000, netProfit: 44000, taxes: 20000, owes: 30000 },
    { month: 'Nov', revenue: 132000, netProfit: 48000, taxes: 21000, owes: 33000 },
    { month: 'Dec', revenue: 128000, netProfit: 46000, taxes: 20000, owes: 32000 },
  ];

  const productStats = [
    { status: 'Packed', count: 1845, change: '+3.7%', color: 'bg-blue-100' },
    { status: 'Delivered', count: 3469, change: '+8.1%', color: 'bg-red-100' },
    { status: 'Shipped', count: 5201, change: '+1.7%', color: 'bg-purple-100' },
  ];

  const ordersData = [
    { day: 'Sun', orders: 450 },
    { day: 'Mon', orders: 550 },
    { day: 'Tue', orders: 537 },
    { day: 'Wed', orders: 650 },
    { day: 'Thu', orders: 575 },
    { day: 'Fri', orders: 600 },
    { day: 'Sat', orders: 525 },
  ];

  const recentTransactions = [
    { id: 'PAY-BD12093-SMG-1', product: 'Kpop Album Meow', details: '1 pcs - Free Poster', amount: '$247.59,8', status: 'Completed' },
    { id: 'PAY-98HY6G3-ENT', product: 'Photo Card Enhypen', details: '3 pcs - Free Tumblr', amount: '$761.77,2', status: 'Pending' },
    { id: 'PAY-1BQG093-JMB', product: 'Queencard Gidle', details: '1 pcs - Free Album Group', amount: '$415.9,7', status: 'Completed' },
    { id: 'PAY-98HY6G3-SBY', product: 'Concert Ticket Mujin', details: '8 pcs - Free Banner', amount: '$272.81,3', status: 'Completed' },
    { id: 'PAY-BD12093-SMG-2', product: 'Kpop Album Blackpink', details: '2 pcs - Free Poster', amount: '$363.50,8', status: 'Completed' },
  ];

  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <div className={`flex items-center ${stat.color}`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="ml-1 text-sm font-medium">{stat.change}</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <span className="ml-2 text-sm text-gray-500">{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-medium text-gray-900">Revenue</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Monthly View</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Product Stats and Orders Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-medium text-gray-900">Product Sales</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Weekly View</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {productStats.map((stat) => (
              <div key={stat.status} className="text-center">
                <div className={`${stat.color} rounded-lg p-4 mb-2`}>
                  <p className="text-lg font-semibold">{stat.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{stat.status}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Traffic */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-medium text-gray-900">Orders Traffic</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Weekly View</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">Recent Transaction</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Daily View</span>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-4 font-medium">ID Transaction</th>
                  <th className="pb-4 font-medium">Product</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="text-sm">
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{transaction.id}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{transaction.product}</div>
                      <div className="text-gray-500">{transaction.details}</div>
                    </td>
                    <td className="py-4 font-medium text-gray-900">{transaction.amount}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;