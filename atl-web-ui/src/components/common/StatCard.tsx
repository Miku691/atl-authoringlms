import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon: Icon, color }) => {
    // Dynamic color classes map
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    const iconBgClass = colorClasses[color] || 'bg-chrome text-content-secondary';

    return (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-content-secondary">{label}</p>
                    <p className="text-2xl font-bold text-content-primary mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconBgClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-content-secondary'}`}>
                    {change}
                </span>
                <span className="text-content-muted ml-2">from last month</span>
            </div>
        </div>
    );
};

export default StatCard;
