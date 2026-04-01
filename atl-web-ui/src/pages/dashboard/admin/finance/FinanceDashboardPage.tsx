import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    CreditCard,
    PieChart as PieChartIcon,
    BarChart3,
    MoreVertical,
    Download,
    Banknote,
    CircleDollarSign
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { financeService } from '../../../../api/financeService';
import type { CollectionSummary } from '../../../../api/financeService';
import toast from 'react-hot-toast';
import { useCurrency } from '../../../../context/CurrencyContext';

const FinanceDashboardPage: React.FC = () => {
    const { format, currencySymbol } = useCurrency();
    const [summary, setSummary] = useState<CollectionSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use real data from summary if available, otherwise fallback to empty/mock
    const monthlyTrendData = summary?.monthlyTrend || [];
    const collectionBySource = summary?.feeDistribution || [];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = Math.max(0, now.getTime() - date.getTime());
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (date.toDateString() === now.toDateString()) {
            if (diffInMins < 1) return 'Just now';
            if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
            return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
        }
        return date.toLocaleDateString();
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await financeService.getCollectionSummary();
            setSummary(data);
        } catch (error) {
            toast.error('Failed to load financial summary');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading Financial Analytics...</div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance Dashboard</h1>
                    <p className="text-gray-500 text-sm font-medium italic">Comprehensive financial health and collection analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm font-bold text-sm">
                        <Download size={16} />
                        Export Ledger
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm">
                        <CircleDollarSign size={16} />
                        Quick Collection
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Today's Collection" 
                    value={format(summary?.todayCollection || 0)}
                    icon={<CreditCard className="text-indigo-600" />}
                    trend="+12% from yesterday"
                    trendType="up"
                />
                <KPICard 
                    title="Monthly Collection" 
                    value={format(summary?.monthCollection || 0)}
                    icon={<TrendingUp className="text-emerald-600" />}
                    trend="+5% from last month"
                    trendType="up"
                />
                <KPICard 
                    title="Annual Collection" 
                    value={format(summary?.yearCollection || 0)}
                    icon={<Banknote className="text-blue-600" />}
                    trend={`Target: ${format(50000000)}`}
                    trendType="neutral"
                />
                <KPICard 
                    title="Pending Receivables" 
                    value={format(summary?.pendingReceivables || 0)} 
                    icon={<TrendingDown className="text-rose-600" />}
                    trend="Requires Attention"
                    trendType="down"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue vs Expense Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 size={18} className="text-indigo-600" />
                            Revenue vs Expense Trend
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded-full" /> Income</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-400 rounded-full" /> Expense</div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrendData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${currencySymbol}${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [format(value), '']}
                                />
                                <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={3} fill="none" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Collection Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <PieChartIcon size={18} className="text-indigo-600" />
                        Fee Distribution
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={collectionBySource}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {collectionBySource.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [format(Number(value)), 'Value']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        {collectionBySource.map((item, index) => (
                            <div key={item.name} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-gray-600 font-medium">{item.name}</span>
                                </div>
                                <span className="font-bold text-gray-900">{format(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Collection By Offering */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <BarChart3 size={18} className="text-emerald-600" />
                        Collection by Offering
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(summary?.collectionByOffering || {}).map(([id, val]) => ({
                                name: summary?.offeringNames?.[id] || id.substring(0, 8),
                                value: val
                            })).slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip formatter={(val: any) => [format(val), 'Collection']} />
                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Collections Feed */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <History size={18} className="text-indigo-600" />
                            Recent Collections
                        </h3>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-2">
                        {summary?.recentTransactions?.map((t: any, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                                        <ArrowUpRight size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{t.studentName}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            {t.offeringName ? `${t.offeringName} • ` : ''}{t.paymentMode || 'Online Payment'}
                                        </p>
                                        {t.feeHeadName && (
                                            <p className="text-[9px] text-gray-400 font-medium italic truncate max-w-[150px]" title={t.feeHeadName}>
                                                {t.feeHeadName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">+{format(t.amount || 0)}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {formatRelativeTime(t.transactionDate)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: string;
    trendType: 'up' | 'down' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendType }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">{icon}</div>
            <button className="text-gray-300 hover:text-gray-500"><MoreVertical size={16} /></button>
        </div>
        <div className="mt-5 relative z-10">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none">{title}</p>
            <h2 className="text-3xl font-black text-gray-900 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors">{value}</h2>
            <div className={`flex items-center gap-1.5 mt-3 text-[11px] font-bold ${
                trendType === 'up' ? 'text-emerald-600' : 
                trendType === 'down' ? 'text-rose-600' : 'text-blue-500'
            }`}>
                {trendType === 'up' && <ArrowUpRight size={12} />}
                {trendType === 'down' && <ArrowDownRight size={12} />}
                {trendType === 'neutral' && <Calendar size={12} />}
                {trend}
            </div>
        </div>
    </div>
);

const History: React.FC<{size: number, className: string}> = ({size, className}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l4 2"/>
    </svg>
);

export default FinanceDashboardPage;
