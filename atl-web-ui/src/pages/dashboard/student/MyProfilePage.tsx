import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { studentDashboardService } from '../../../api/studentDashboardService';
import {
    User, Mail, Phone, Calendar, MapPin,
    GraduationCap, Users, BookOpen, BadgeCheck,
    CreditCard, Heart, Shield, Briefcase
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
                <div className="w-8 h-8 border-4 border-[#0054d1] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] mt-10">
                <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1a3d8a]">Access Restricted</h2>
                <p className="text-slate-500 mt-2">No student profile linked to your account was found.</p>
            </div>
        );
    }

    const sections = [
        {
            title: 'Personal Details',
            subtitle: 'Identification and demographic data',
            icon: User,
            iconBg: 'bg-[#f1f3f9]',
            items: [
                { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A' },
                { label: 'Gender', value: profile.gender || 'N/A' },
                { label: 'Blood Group', value: profile.bloodGroup || 'N/A' },
                { label: 'Email Address', value: profile.email || 'N/A' },
                { label: 'Phone Number', value: profile.phone || 'N/A' },
                { label: 'Address', value: profile.address || 'N/A', fullWidth: true },
            ]
        },
        {
            title: 'Guardian Information',
            subtitle: 'Family contact and relation details',
            icon: Users,
            iconBg: 'bg-[#fff3ec]',
            items: [
                { label: 'Guardian Name', value: profile.guardianName || 'N/A' },
                { label: 'Relation', value: profile.guardianRelation || 'N/A' },
                { label: 'Guardian Phone', value: profile.guardianPhone || 'N/A' },
                { label: 'Occupation', value: profile.guardianOccupation || 'N/A' },
            ]
        },
        {
            title: 'Academic Context',
            subtitle: 'Enrollment and institutional tracking',
            icon: BookOpen,
            iconBg: 'bg-[#dae2ff]',
            items: [
                { label: 'Admission Number', value: profile.admissionNo },
                { label: 'Department', value: profile.department || 'N/A' },
                { label: 'Current Program', value: enrollment?.offeringName || 'Not Enrolled' },
                { label: 'Admission Date', value: profile.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : 'N/A' },
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-700 px-4 lg:px-0">
            {/* Page Header Block - Academic Curator Pattern */}
            <div className="bg-[#f1f3f9] rounded-2xl p-8 md:p-10 relative overflow-hidden mb-10">
                <div className="relative z-10">
                    <span className="text-[10px] font-semibold text-[#3c5ba9] uppercase tracking-widest mb-2 block">Student Identity</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1a3d8a] tracking-tight">My Profile</h1>
                    <p className="text-sm text-[#424655] mt-1 max-w-md">Personal & Academic Information</p>
                    
                    <div className="flex items-center gap-3 mt-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dae1ff] text-[#0054d1]">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            {profile.admissionNo}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {profile.status}
                        </span>
                    </div>
                </div>
                {/* Decorative circle */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#2a6df4]/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-8 right-12 w-24 h-24 bg-[#0054d1]/5 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column - Main Info Cards */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header Avatar & Identity Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_16px_-4px_rgba(26,61,138,0.06)] flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-[#dae2ff] relative group">
                                <AuthenticatedAvatar
                                    imageUrl={profile.profileImageUrl}
                                    fallbackInitial={profile.firstName?.[0]}
                                    alt={profile.firstName}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#0054d1]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-[#181c20] tracking-tight">
                                {profile.firstName} {profile.lastName}
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[#424655]">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-[#2a6df4]" />
                                    {profile.email}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-[#2a6df4]" />
                                    {profile.phone || 'No phone'}
                                </div>
                            </div>
                            <div className="pt-2">
                                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f1f3f9] px-2.5 py-1 rounded-md">
                                    {enrollment?.offeringName || 'Academic Node'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section Cards */}
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-white rounded-2xl shadow-[0_2px_16px_-4_rgba(26,61,138,0.06)] overflow-hidden">
                            {/* Section Header */}
                            <div className="px-8 py-6 border-b border-[#f1f3f9] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center`}>
                                        <section.icon className="w-5 h-5 text-[#2a6df4]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">{section.title}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{section.subtitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Fields */}
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {section.items.map((item, iIdx) => (
                                        <div key={iIdx} className={item.fullWidth ? "md:col-span-2" : ""}>
                                            <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest mb-1.5">{item.label}</p>
                                            <p className="text-sm font-bold text-[#181c20]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column - Sidebar Widgets */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Digital ID Card Display */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pl-2">
                            <CreditCard className="w-4 h-4 text-[#2a6df4]" />
                            <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Digital Credential</h3>
                        </div>
                        <div className="hover:scale-[1.01] transition-transform duration-500">
                            <DigitalIDCard 
                                student={profile} 
                                enrollment={enrollment} 
                                tenantName={user?.tenantName ?? undefined} 
                            />
                        </div>
                    </div>

                    {/* Verification / Security Widget */}
                    <div className="bg-[#181c20] rounded-2xl p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status Verification</h3>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Institution Hash</span>
                                    <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-1 rounded">{profile.tenantId?.substring(0, 12)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">Category</span>
                                    <span className="text-[10px] font-bold text-[#2a6df4] uppercase">{profile.category || 'Standard'}</span>
                                </div>
                                
                                <div className="h-px bg-white/5 w-full my-1"></div>
                                
                                <div className="flex gap-4">
                                    <Heart className="w-8 h-8 text-[#ba1a1a] opacity-40 shrink-0" />
                                    <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                        Identity records are digitally signed and verified by the institutional security gateway.
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Background numbers/decor */}
                        <div className="absolute -bottom-6 -right-6 text-6xl font-black text-white/5 italic select-none pointer-events-none">ID_V</div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0054d1]/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfilePage;
