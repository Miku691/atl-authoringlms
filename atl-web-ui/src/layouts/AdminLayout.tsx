import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Navbar from '../components/admin/Navbar';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <main
                className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-64' : 'pl-20'
                    }`}
            >
                <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
