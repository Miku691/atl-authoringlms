import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    icon: Icon,
    iconColor = "text-indigo-600",
    actions
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                    {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-content-secondary mt-1">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
