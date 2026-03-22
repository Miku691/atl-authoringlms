import React, { useState, useEffect } from 'react';
import { 
    BarChart3, PieChart as PieChartIcon, TrendingUp, DollarSign, Download
} from 'lucide-react';
import { financeService } from '../../../../api/financeService';
import type { Budget } from '../../../../types/finance';
import toast from 'react-hot-toast';

export const BudgetReportPage: React.FC = () => {
    const [reportData, setReportData] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [academicYear, setAcademicYear] = useState('2023-24');

    useEffect(() => {
        fetchReport();
    }, [academicYear]);

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            const data = await financeService.getBudgetReport(academicYear);
            setReportData(data);
        } catch (error) {
            toast.error('Failed to load budget report');
        } finally {
            setIsLoading(false);
        }
    };

    const totalAllocated = reportData.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = reportData.reduce((sum, b) => sum + (b.actualSpend || 0), 0);
    const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budget vs Actual Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">Track utilization and compare spending against planned budget</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="px-3 py-2 border border-blue-100 rounded-lg outline-none bg-white text-sm font-semibold text-blue-600 shadow-sm"
                    >
                        <option value="2023-24">2023-24</option>
                        <option value="2024-25">2024-25</option>
                    </select>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Total Budget</p>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign className="h-4 w-4" /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{totalAllocated.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Actual Spend</p>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingUp className="h-4 w-4" /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Utilization</p>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PieChartIcon className="h-4 w-4" /></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{utilization.toFixed(1)}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><BarChart3 className="h-4 w-4" /></div>
                    </div>
                    <p className={`text-xl font-bold ${utilization > 90 ? 'text-red-600' : 'text-green-600'}`}>
                        {utilization > 100 ? 'Over Budget' : utilization > 80 ? 'Near Limit' : 'Healthy'}
                    </p>
                </div>
            </div>

            {/* Detailed Analysis Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Category-wise Utilization</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Allocated</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Spent</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Generating report...</td></tr>
                            ) : reportData.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No data available for this period</td></tr>
                            ) : (
                                reportData.map((item) => {
                                    const itemSpent = item.actualSpend || 0;
                                    const itemUtil = item.allocatedAmount > 0 ? (itemSpent / item.allocatedAmount) * 100 : 0;
                                    const balance = item.allocatedAmount - itemSpent;
                                    
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{item.categoryName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[160px]">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                                        <span>{itemUtil.toFixed(0)}% Utilized</span>
                                                        <span>{balance < 0 ? 'Over' : ''}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                                itemUtil > 100 ? 'bg-red-500' : itemUtil > 80 ? 'bg-amber-500' : 'bg-blue-500'
                                                            }`}
                                                            style={{ width: `${Math.min(itemUtil, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                ₹{item.allocatedAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-600">
                                                ₹{itemSpent.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                                                <span className={balance < 0 ? 'text-red-600' : 'text-green-600'}>
                                                    {balance < 0 ? '-' : ''}₹{Math.abs(balance).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
