import React from 'react';
import StatCard from '../../../components/common/StatCard';
import { Users, BookOpen, GraduationCap, Building2, TrendingUp, DollarSign } from 'lucide-react';

const AdminDashboardHome: React.FC = () => {
    // Mock Data - To be replaced by API calls
    const stats = [
        { label: 'Total Students', value: '2,543', change: '+12.5%', icon: GraduationCap, color: 'indigo' },
        { label: 'Active Teachers', value: '142', change: '+3.2%', icon: Users, color: 'emerald' },
        { label: 'Total Courses', value: '38', change: '0%', icon: BookOpen, color: 'blue' },
        { label: 'Revenue (YTD)', value: '$124k', change: '+18.2%', icon: DollarSign, color: 'amber' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div>
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'}`}>
                                {stat.change}
                            </span>
                            <span className="text-gray-400 ml-2">from last month</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Content Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-gray-400">
                    <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                    <p>Analytics Chart (Coming Soon)</p>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                    SM
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New student registration</p>
                                    <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;
