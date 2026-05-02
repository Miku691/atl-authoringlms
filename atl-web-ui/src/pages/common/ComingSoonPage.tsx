import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const ComingSoonPage: React.FC = () => {
    const location = useLocation();
    const title = location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page';

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-content-muted">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 text-center max-w-md">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                <p className="text-content-secondary">
                    This module is currently under development. <br />
                    Check back soon for updates.
                </p>
                <div className="mt-6 px-4 py-2 bg-slate-900 rounded-lg text-xs font-mono text-content-secondary border border-slate-800">
                    Path: {location.pathname}
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;
