import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, setIsOpen }) => {
    return (
        <header className={`h-16 bg-white border-b border-gray-200 fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'left-64' : 'left-20'}`}>
            <div className="h-full px-6 flex items-center justify-between">

                {/* Left Section: Mobile Toggle & Breadcrumbs (Placeholder) */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:flex items-center text-sm text-gray-500">
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Admin</span>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-gray-900">Dashboard</span>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Search Bar - Hidden on small mobile */}
                    <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all w-64">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1"></div>

                        {/* Profile Dropdown Trigger */}
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-xs">
                                        AD
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
