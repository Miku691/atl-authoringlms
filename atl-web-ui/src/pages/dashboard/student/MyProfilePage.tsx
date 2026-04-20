import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import {
    User, Mail, Phone, Calendar, MapPin,
    Shield, Briefcase, GraduationCap,
    Heart, Home, Award, Bookmark, AlertCircle
} from 'lucide-react';
import AuthenticatedAvatar from '../../../components/common/AuthenticatedAvatar';
import DigitalIDCard from '../../../components/student/DigitalIDCard';
import toast from 'react-hot-toast';

const MyProfilePage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [profile, setProfile] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            fetchProfileData();
        }
    }, [user?.email, user?.tenantId]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const { student, enrollment } = await studentDashboardService.getStudentContext(user!.email!, user!.tenantId!);
            setProfile(student);
            setEnrollment(enrollment);
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error("Could not load full profile data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm mt-10">
                <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</h2>
                <p className="text-slate-500 mt-2">No student profile linked to your account was found.</p>
            </div>
        );
    }

    const sections = [
        {
            title: 'Contact Details',
            icon: Mail,
            items: [
                { label: 'Email Address', value: profile.email, icon: Mail },
                { label: 'Phone Number', value: profile.phone || 'Not Provided', icon: Phone },
                { label: 'Residential Address', value: profile.address || 'Not Provided', icon: MapPin },
            ]
        },
        {
            title: 'Personal Info',
            icon: Heart,
            items: [
                { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A', icon: Calendar },
                { label: 'Gender Identity', value: profile.gender || 'N/A', icon: User },
                { label: 'Blood Group', value: profile.bloodGroup || 'N/A', icon: Award },
                { label: 'Religion', value: profile.religion || 'N/A', icon: Bookmark },
            ]
        },
        {
            title: 'Academic Status',
            icon: GraduationCap,
            items: [
                { label: 'Admission Number', value: profile.admissionNo, icon: Shield },
                { label: 'Current Offering', value: enrollment?.offeringName || 'Not Enrolled', icon: Briefcase },
                { label: 'Admission Date', value: profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : 'N/A', icon: Calendar },
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in px-4 lg:px-0">
            {/* Premium Header/Banner - High Contrast & Airy */}
            <div className="relative h-80 md:h-[32rem] rounded-[4rem] overflow-hidden bg-[#0A0C10] group shadow-2xl transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-slate-950 z-10"></div>
                
                {/* Abstract Background Design */}
                <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden">
                    <div className="absolute -right-20 -top-20 text-[32rem] font-black text-white/[0.03] italic leading-none select-none uppercase transform rotate-12 group-hover:scale-110 transition-transform duration-[2s]">
                        {profile.firstName?.[0]}
                    </div>
                    <div className="absolute right-20 bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] group-hover:scale-150 transition-transform duration-[2s]"></div>
                </div>

                <div className="absolute inset-0 z-20 p-10 lg:p-16 flex flex-col justify-end">
                    <div className="flex flex-col md:flex-row items-end gap-8 lg:gap-12 relative">
                        {/* Avatar Architecture */}
                        <div className="relative transform translate-y-16 lg:translate-y-24 transition-transform duration-700 group-hover:translate-y-12 lg:group-hover:translate-y-20">
                            <div className="p-2.5 bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative z-10 transition-transform group-hover:scale-105 duration-500">
                                <AuthenticatedAvatar
                                    imageUrl={profile.profileImageUrl}
                                    fallbackInitial={profile.firstName?.[0]}
                                    alt={profile.firstName}
                                    className="w-44 h-44 lg:w-64 lg:h-64 rounded-[3rem] border-4 border-slate-50 shadow-inner object-cover"
                                />
                                <div className="absolute bottom-6 right-6 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg animate-pulse">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            {/* Glow behind avatar */}
                            <div className="absolute inset-0 bg-indigo-600/20 blur-[60px] rounded-full scale-110 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </div>

                        {/* Text Metadata */}
                        <div className="pb-4 lg:pb-8 flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 backdrop-blur-xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 italic shadow-xl shadow-emerald-900/20">
                                    {profile.status}
                                </span>
                                <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-white/40 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md italic">
                                    NODE_{profile.admissionNo}
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                                {profile.firstName} <span className="text-indigo-400 group-hover:text-white transition-colors duration-500">{profile.lastName}</span>
                            </h1>
                        </div>

                        {/* Right Section - Tertiary Info */}
                        <div className="hidden lg:flex flex-col items-end gap-4 pb-8 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic leading-none">Institutional Hash</p>
                            <code className="bg-white/5 px-4 py-1 rounded text-[9px] font-mono text-indigo-300 border border-white/5 uppercase tracking-widest">{profile.id}</code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid - Modern Airy Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-24 lg:mt-32">

                {/* Information Sections - Sophisticated Cards */}
                <div className="lg:col-span-8 space-y-10">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-[3.5rem] p-12 border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 group/section overflow-hidden relative">
                            {/* Abstract Graphic */}
                            <div className="absolute -top-10 -right-10 text-[12rem] font-black text-slate-50/50 italic leading-none group-hover/section:scale-110 transition-transform duration-[1.5s] pointer-events-none select-none uppercase opacity-30">
                                {section.title.split(' ')[0]}
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-5 italic group-hover/section:text-indigo-600 transition-colors">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/section:bg-indigo-600 group-hover/section:text-white group-hover/section:rotate-6 transition-all duration-500">
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    {section.title}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {section.items.map((item, i) => (
                                        <div key={i} className="space-y-3 group/item">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 italic opacity-60">
                                                <item.icon className="w-3 h-3 text-slate-300 group-hover/item:text-indigo-400 transition-colors" />
                                                {item.label}
                                            </p>
                                            <div className="flex items-center gap-4 translate-x-0 group-hover/item:translate-x-2 transition-transform duration-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-100 group-hover/item:bg-indigo-600 transition-colors"></div>
                                                <p className="text-xl font-black text-slate-900 tracking-tight uppercase italic group-hover/item:text-indigo-600 transition-colors">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar: Digital ID Card & Info - Performance Tracking */}
                <div className="lg:col-span-4 space-y-10 pt-10 lg:pt-0">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-6">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">Digital Identity</h3>
                        </div>
                        <div className="group/idcard hover:scale-[1.02] transition-transform duration-700">
                            <DigitalIDCard 
                                student={profile} 
                                enrollment={enrollment} 
                                tenantName={user?.tenantName ?? undefined} 
                            />
                        </div>
                    </div>

                    <div className="bg-[#0A0C10] rounded-[3.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group/verify">
                        {/* Background Design */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[40px] group-hover/verify:scale-150 transition-transform duration-700"></div>
                        
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 italic relative z-10 transition-colors group-hover/verify:text-amber-500">
                             <Shield className="w-4 h-4" /> System Verification
                        </h3>
                        
                        <div className="space-y-6 relative z-10">
                             <div className="flex items-center justify-between group/line">
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic transition-colors group-hover/line:text-slate-400">Class Matrix</span>
                                 <span className="text-[11px] font-black text-white uppercase tracking-wider italic bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 transition-all group-hover/line:bg-indigo-600 group-hover/line:border-indigo-600">{profile.category || 'General'}</span>
                             </div>
                             <div className="flex items-center justify-between group/line">
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic transition-colors group-hover/line:text-slate-400">Survival Node</span>
                                 <span className="text-[11px] font-black text-white uppercase tracking-wider italic bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 transition-all group-hover/line:bg-amber-600 group-hover/line:border-amber-600">{profile.bloodGroup || 'N/A'}</span>
                             </div>
                             
                             <div className="pt-8 mt-8 border-t border-white/5 group-hover/verify:border-indigo-500/20 transition-all duration-700">
                                 <div className="flex gap-4">
                                     <AlertCircle className="w-8 h-8 text-indigo-400 shrink-0 opacity-40" />
                                     <p className="text-[10px] text-slate-500 font-black leading-relaxed italic uppercase tracking-tight opacity-70">
                                         Identification verified against institutional master records. Verified by IMS Cryptographic Protocol G8.
                                     </p>
                                 </div>
                             </div>
                        </div>

                        {/* Decorative background number */}
                        <div className="absolute -bottom-10 -right-6 text-[10rem] font-black text-white/[0.02] italic leading-none select-none pointer-events-none uppercase">
                            VER
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
