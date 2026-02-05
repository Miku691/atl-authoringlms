import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import {
    User, Mail, Phone, Calendar, MapPin,
    Shield, Briefcase, GraduationCap,
    Heart, Home, Award, Bookmark
} from 'lucide-react';
import AuthenticatedAvatar from '../../../components/common/AuthenticatedAvatar';
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
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Premium Header/Banner */}
            <div className="relative h-64 md:h-80 rounded-[3rem] overflow-hidden bg-slate-900 group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900 to-indigo-950/90 z-10 transition-all group-hover:bg-opacity-70"></div>
                <div className="absolute right-0 bottom-0 w-full h-full opacity-20 pointer-events-none transform scale-150 rotate-12">
                    <GraduationCap className="w-full h-full text-white" strokeWidth={0.5} />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div className="flex items-end gap-6 md:gap-8">
                        <div className="p-2 bg-white rounded-[2.5rem] shadow-2xl transform translate-y-6 md:translate-y-12">
                            <AuthenticatedAvatar
                                imageUrl={profile.profileImageUrl}
                                fallbackInitial={profile.firstName?.[0]}
                                alt={profile.firstName}
                                className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] border-4 border-white shadow-inner"
                            />
                        </div>
                        <div className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                                    {profile.status}
                                </span>
                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">ID: #{profile.admissionNo}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase italic drop-shadow-lg">
                                {profile.firstName} {profile.lastName}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 md:mt-24 pt-8 md:pt-16">

                {/* Information Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <section.icon className="w-24 h-24" />
                            </div>

                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <section.icon className="w-4 h-4 text-indigo-600" />
                                </div>
                                {section.title}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {section.items.map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            {item.label}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight transition-colors group-hover:text-indigo-600">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Card: Organization Presence */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-10 flex items-center gap-3">
                                <Home className="w-4 h-4" /> Academic Mapping
                            </h3>

                            <div className="space-y-10">
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Category</p>
                                    <p className="text-2xl font-black italic tracking-tight">{profile.category || 'General'}</p>
                                </div>
                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Institution Mapping</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                            <GraduationCap className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase text-white">Active Student</p>
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Verified Academic Seat</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Interactive Glow */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] transition-all group-hover:scale-125"></div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex items-start gap-4">
                        <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                            <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Secure Record</p>
                            <p className="text-[11px] text-emerald-600/70 font-medium leading-relaxed">
                                This profile is verified and strictly read-only for security compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
