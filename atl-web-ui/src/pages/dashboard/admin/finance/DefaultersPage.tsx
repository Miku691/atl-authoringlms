import React, { useState, useEffect } from 'react';
import {
    AlertCircle, Search, Download, Filter, TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';
import { format as formatDate } from 'date-fns';
import type { DefaulterDTO } from '../../../../types/finance';
import { financeService } from '../../../../api/financeService';
import { academicService } from '../../../../api/academicService';
import type { ImsOffering } from '../../../../api/academicService';
import toast from 'react-hot-toast';
import type { RootState } from '../../../../store/store';
import { useSelector } from 'react-redux';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';

export const DefaultersPage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const { tenantId } = useSelector((state: RootState) => state.auth.user!) || {};
    const [defaulters, setDefaulters] = useState<DefaulterDTO[]>([]);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tenantId) fetchOfferings();
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchDefaulters();
    }, [tenantId, selectedOffering]);

    const fetchOfferings = async () => {
        if (!tenantId) return;
        try {
            const data = await academicService.getOfferingsByTenant(tenantId);
            setOfferings(data);
        } catch (error) {
            console.error('Failed to fetch offerings:', error);
            toast.error('Failed to load classes/offerings');
        }
    };

    const fetchDefaulters = async () => {
        if (!tenantId) return;
        try {
            setIsLoading(true);
            const data = await financeService.getDefaulters(selectedOffering || undefined);
            setDefaulters(data);
        } catch (error) {
            console.error('Failed to fetch defaulters:', error);
            toast.error('Failed to load defaulters schedule');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        // Simple CSV export
        const headers = ['Student ID', 'Student Name', 'Class/Offering', 'Total Overdue', 'Late Fee', 'Installments Overdue', 'Earliest Due Date'];
        const csvContent = [
            headers.join(','),
            ...defaulters.map(d => [
                d.studentId,
                `"${d.studentName}"`,
                `"${offerings.find(o => o.id === d.offeringId)?.name || d.offeringName || ''}"`,
                d.totalOverdue,
                d.totalLateFee,
                d.overdueInstallmentsCount,
                d.earliestDueDate
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Defaulters_Report_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
    };

    const filteredDefaulters = defaulters.filter(d =>
        d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentId.includes(searchTerm)
    );

    const totalDefaulters = filteredDefaulters.length;
    const totalAmountOverdue = filteredDefaulters.reduce((sum, d) => sum + d.totalOverdue, 0);
    const totalLateFees = filteredDefaulters.reduce((sum, d) => sum + d.totalLateFee, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Defaulters List</h1>
                    <p className="text-sm text-content-secondary mt-1">Track students with overdue fees and applied penalties</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={defaulters.length === 0}
                    className="flex items-center px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-content-primary hover:bg-chrome disabled:opacity-50"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-content-secondary">Total Defaulters</p>
                            <p className="text-2xl font-bold text-content-primary mt-1">{totalDefaulters}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-content-secondary">Total Overdue Amount</p>
                            <p className="text-2xl font-bold text-content-primary mt-1">{format(totalAmountOverdue)}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-content-secondary">Total Late Fees Applied</p>
                            <p className="text-2xl font-bold text-content-primary mt-1">{format(totalLateFees)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-64 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                        <select
                            value={selectedOffering}
                            onChange={(e) => setSelectedOffering(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-surface"
                        >
                            <option value="">All Classes/Offerings</option>
                            {offerings.map(offering => (
                                <option key={offering.id} value={offering.id}>
                                    {offering.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Defaulters Table */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-chrome">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Student Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Class/Offering
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Overdue Installments
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Late Fee Active
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Total Overdue
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-content-secondary uppercase tracking-wider">
                                    Oldest Due Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-content-secondary">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDefaulters.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-content-secondary">
                                        <AlertCircle className="mx-auto h-8 w-8 text-content-muted mb-2" />
                                        No defaulters found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredDefaulters.map((defaulter) => (
                                    <tr key={defaulter.studentId} className="hover:bg-chrome">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium text-sm">
                                                        {defaulter.studentName.split(' ').map((n: string) => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-content-primary">{defaulter.studentName}</div>
                                                    <div className="text-xs text-content-secondary">ID: {defaulter.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-content-secondary">
                                            {offerings.find(o => o.id === defaulter.offeringId)?.name || defaulter.offeringName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {defaulter.overdueInstallmentsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-content-secondary">
                                            {defaulter.totalLateFee > 0 ? (
                                                <span className="text-purple-600 font-medium">{format(defaulter.totalLateFee)}</span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                            {format(defaulter.totalOverdue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-content-secondary">
                                            <div className="flex items-center justify-end text-red-600 font-medium space-x-1">
                                                <Calendar className="h-4 w-4 mr-1 text-content-muted" />
                                                {defaulter.earliestDueDate ? formatDate(new Date(defaulter.earliestDueDate), 'MMM dd, yyyy') : '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="bg-surface px-4 py-3 border-t border-border sm:px-6 flex items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm text-content-primary">
                            Showing <span className="font-medium">{filteredDefaulters.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredDefaulters.length}</span> of <span className="font-medium">{filteredDefaulters.length}</span> results
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
