import React from 'react';
import { CreditCard, Download, Printer } from 'lucide-react';

const IDCardTab = () => {
    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
            <h3 className="text-lg font-bold text-content-primary mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" /> ID Card Preview
            </h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative w-[320px] h-[200px] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl p-4 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-surface/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-xl"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-sm font-bold opacity-90 uppercase tracking-widest">Student ID</h2>
                                <h1 className="text-lg font-bold mt-1">Institute Name</h1>
                            </div>
                            <div className="w-10 h-10 bg-surface/20 rounded-lg flex items-center justify-center font-bold">
                                LOGO
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="w-20 h-20 bg-gray-300 rounded-lg border-2 border-white/30"></div>
                            <div className="mb-1 space-y-0.5">
                                <p className="text-lg font-bold leading-none">John Doe</p>
                                <p className="text-xs opacity-80">Class 10-A • Roll No: 123</p>
                                <p className="text-xs opacity-70">AD: 2025-01-01</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <p className="text-content-secondary">
                        This is a preview of the generated ID Card based on the student's current profile and enrollment status.
                    </p>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            <Printer className="w-4 h-4" /> Print Card
                        </button>
                        <button className="flex items-center gap-2 bg-surface border border-border text-content-primary px-4 py-2 rounded-lg hover:bg-chrome transition">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IDCardTab;
