import React from 'react';
import { GraduationCap, Shield, QrCode, Phone, Mail } from 'lucide-react';
import AuthenticatedAvatar from '../common/AuthenticatedAvatar';

interface DigitalIDCardProps {
    student: any;
    enrollment: any;
    tenantName?: string;
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ student, enrollment, tenantName }) => {
    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[1.586/1] bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden group border border-white/10 select-none">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]"></div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10 h-full p-6 flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                            <GraduationCap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-0.5">
                                {tenantName || 'Academic Institution'}
                            </h2>
                            <p className="text-[7px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Student Identity Card</p>
                        </div>
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                        Verified
                    </div>
                </div>

                {/* Body */}
                <div className="flex items-center gap-6 py-4">
                    <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/10 p-1 bg-white/5">
                            <AuthenticatedAvatar
                                imageUrl={student.profileImageUrl}
                                fallbackInitial={student.firstName?.[0]}
                                alt={student.firstName}
                                className="w-full h-full rounded-xl object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 rounded-lg border border-white/10">
                            <Shield className="w-3 h-3 text-indigo-400" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none">
                                {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                {enrollment?.offeringName || 'General Student'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-0.5">
                                <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Student ID</p>
                                <p className="text-xs font-black text-indigo-400 tracking-tighter">#{student.admissionNo}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/5 flex items-end justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="space-y-0.5 text-left">
                            <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest">Ph.</p>
                            <p className="text-[8px] font-bold text-slate-300">{student.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-0.5 text-left">
                            <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest">Valid Until</p>
                            <p className="text-[8px] font-bold text-slate-300">July 2026</p>
                        </div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg">
                        <QrCode className="w-8 h-8 text-slate-900" />
                    </div>
                </div>
            </div>

            {/* Gloss Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-50 group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
    );
};

export default DigitalIDCard;
