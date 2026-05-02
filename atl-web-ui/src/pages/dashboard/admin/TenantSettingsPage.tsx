import React, { useState } from 'react';
import { Building2, Settings } from 'lucide-react';
import TenantProfileSection from './settings/TenantProfileSection';

type Tab = 'profile' | 'general';

const TenantSettingsPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<Tab>('profile');

    const renderContent = () => {
        switch (currentTab) {
            case 'profile':
                return <TenantProfileSection />;
            case 'general':
                return <div className="p-8 text-center text-content-secondary">Advanced configurations coming soon...</div>;
            default:
                return <TenantProfileSection />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-content-primary">Institute Settings</h1>
                <p className="text-sm text-content-secondary">Manage your organization's profile and configuration.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                        <nav className="flex flex-col p-2 space-y-1">
                            <button
                                onClick={() => setCurrentTab('profile')}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentTab === 'profile'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-content-secondary hover:bg-chrome'
                                    }`}
                            >
                                <Building2 className="w-5 h-5 mr-3" />
                                General Profile
                            </button>

                            <div className="border-t border-border my-2"></div>

                            <button
                                onClick={() => setCurrentTab('general')}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${currentTab === 'general'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-content-secondary hover:bg-chrome'
                                    }`}
                            >
                                <Settings className="w-5 h-5 mr-3" />
                                Advanced Config
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default TenantSettingsPage;
