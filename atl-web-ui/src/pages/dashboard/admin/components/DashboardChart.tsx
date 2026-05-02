import React, { useState } from 'react';
import {
    PieChart, Pie, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Layout } from 'lucide-react';

interface ChartData {
    name: string;
    value: number;
    id?: string; // Optional ID for drill-down (e.g., offeringId)
    fill?: string; // Added for color management
}

interface DashboardChartProps {
    title: string;
    data: ChartData[];
    colors?: string[];
    onSegmentClick?: (data: ChartData) => void;
}

const DashboardChart: React.FC<DashboardChartProps> = ({
    title,
    data,
    colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    onSegmentClick
}) => {
    const [view, setView] = useState<'pie' | 'bar'>('pie');

    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Prepare data with colors for Recharts (avoids deprecated Cell component)
    const coloredData = data.map((item, index) => ({
        ...item,
        fill: item.fill || colors[index % colors.length]
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-90">
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-1">{payload[0].name}</p>
                    <p className="text-sm font-black text-white">
                        {payload[0].value} {payload[0].value === 1 ? 'Student' : 'Students'}
                        <span className="ml-2 text-indigo-400">
                            ({((payload[0].value / total) * 100).toFixed(1)}%)
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
            <div className="p-6 border-b border-border flex justify-between items-center bg-chrome/30">
                <h3 className="text-xs font-black text-content-primary flex items-center gap-3 tracking-widest">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:rotate-12 transition-transform">
                        <Layout className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    {title.toUpperCase()}
                </h3>

                <div className="flex bg-chrome p-1 rounded-xl">
                    <button
                        onClick={() => setView('pie')}
                        className={`p-1.5 rounded-lg transition-all ${view === 'pie' ? 'bg-surface shadow-sm text-indigo-600' : 'text-content-muted hover:text-content-secondary'}`}
                        title="Pie View"
                    >
                        <PieIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView('bar')}
                        className={`p-1.5 rounded-lg transition-all ${view === 'bar' ? 'bg-surface shadow-sm text-indigo-600' : 'text-content-muted hover:text-content-secondary'}`}
                        title="Bar View"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6 h-[320px] relative">
                {data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <Layout className="w-12 h-12 mb-4 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No data available</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {view === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={coloredData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                    onClick={(data: any) => onSegmentClick?.(data as ChartData)}
                                    className="cursor-pointer"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    content={({ payload }) => (
                                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                                            {payload?.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                    <span className="text-[10px] font-bold text-content-secondary uppercase tracking-tighter">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </PieChart>
                        ) : (
                            <BarChart data={coloredData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar
                                    dataKey="value"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={1500}
                                    onClick={(data: any) => onSegmentClick?.(data as ChartData)}
                                    className="cursor-pointer"
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default DashboardChart;
