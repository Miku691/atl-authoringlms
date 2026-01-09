import React, { type ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    backgroundImage?: string; // Optional custom background
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    backgroundImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2850&q=80"
}) => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={backgroundImage}
                        alt="Authentication Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />

                <div className="relative z-10 w-full flex flex-col justify-between p-12">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600/20 backdrop-blur-sm p-3 rounded-xl border border-indigo-500/30">
                            <ShieldCheck className="h-8 w-8 text-indigo-400" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Academia Tech</span>
                    </div>

                    <div className="space-y-6">
                        <blockquote className="text-2xl font-medium text-white">
                            "Empowering education through technology. Manage your institute with ease and efficiency."
                        </blockquote>
                        <div className="flex items-center space-x-2 text-indigo-200">
                            <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm font-semibold uppercase tracking-wider">Secure Platform</span>
                        </div>
                    </div>

                    <div className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Academia Tech Labs. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Mobile Logo View */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {subtitle}
                        </p>
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
