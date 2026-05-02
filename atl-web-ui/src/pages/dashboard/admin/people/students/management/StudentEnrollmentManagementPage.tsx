import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    Search,
    Loader2,
    ChevronRight,
    UserCheck,
    CheckCircle,
    UserMinus,
    Calendar,
    ArrowRightLeft,
    Filter,
    Clock,
    User
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../../store/store';
import { enrollmentService } from '../../../../../../api/enrollmentService';
import { academicService, type ImsOffering } from '../../../../../../api/academicService';
import toast from 'react-hot-toast';

const StudentEnrollmentManagementPage: React.FC = () => {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [loading, setLoading] = useState(true);
    // offeringsLoading was removed as it was unused

    // Filters
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');

    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (user?.tenantId) {
            fetchOfferings(user.tenantId);
        }
    }, [user]);

    const fetchOfferings = async (tenantId: string) => {
        try {
            const data = await academicService.getOfferingsByTenant(tenantId);
            setOfferings(data || []);
        } catch (error) {
            toast.error("Failed to load offerings");
        } finally {
            // setOfferingsLoading(false); // Removed as offeringsLoading state was removed
        }
    };

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const rawRes = await enrollmentService.getStudentsByOffering(selectedOffering || 'none', selectedStatus);
            if (rawRes.data.status === 'SUCCESS') {
                setEnrollments(rawRes.data.apiData.content || []);
            }
        } catch (error) {
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await enrollmentService.updateEnrollment(id, { status: newStatus as any });
            toast.success(`Enrollment marked as ${newStatus}`);
            fetchEnrollments();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredEnrollments = enrollments.filter(e =>
        e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-content-primary font-outfit uppercase tracking-tight flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-indigo-600" /> Enrollment Hub
                    </h1>
                    <p className="text-content-secondary font-medium mt-1">Manage active student placements and academic progress</p>
                </div>
            </div>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-100 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-surface/20 rounded-2xl backdrop-blur-md">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-[10px] opacity-80">Total Active</span>
                    </div>
                    <div className="text-4xl font-black font-outfit leading-none mb-1">{enrollments.length}</div>
                    <p className="text-xs font-medium opacity-70">Students in selected offering</p>
                </div>

                <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4 mb-4 text-emerald-600">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-[10px] text-content-muted">Completed</span>
                    </div>
                    <div className="text-4xl font-black font-outfit leading-none mb-1 text-content-primary">0</div>
                    <p className="text-xs font-medium text-content-muted">Graduated this session</p>
                </div>

                <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border">
                    <div className="flex items-center gap-4 mb-4 text-amber-600">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-[10px] text-content-muted">Upcoming</span>
                    </div>
                    <div className="text-4xl font-black font-outfit leading-none mb-1 text-content-primary">{offerings.length}</div>
                    <p className="text-xs font-medium text-content-muted">Available academic programs</p>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-surface rounded-[2rem] p-4 shadow-sm border border-border flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or admission number..."
                        className="w-full pl-12 pr-6 py-4 bg-chrome rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-surface transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative group min-w-[200px]">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-indigo-600" />
                        <select
                            className="w-full pl-10 pr-4 py-4 bg-chrome rounded-2xl text-sm font-black text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
                            value={selectedOffering}
                            onChange={(e) => setSelectedOffering(e.target.value)}
                        >
                            <option value="">Select Offering</option>
                            {offerings.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-indigo-600" />
                        <select
                            className="pl-10 pr-6 py-4 bg-chrome rounded-2xl text-sm font-black text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="WITHDRAWN">WITHDRAWN</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchEnrollments}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-surface rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-content-secondary font-bold uppercase tracking-widest text-xs">Synchronizing Academic State...</p>
                    </div>
                ) : filteredEnrollments.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-chrome rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-content-primary font-outfit uppercase">No Placements Found</h3>
                        <p className="text-content-muted font-medium mt-2">Try adjusting your filters or selection</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-chrome/50 border-b border-border">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Student Profile</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Identities</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Position</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted">Life Cycle</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-content-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEnrollments.map((e, idx) => (
                                    <tr key={e.enrollmentId} className="hover:bg-indigo-50/20 transition-all group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-surface rounded-2xl shadow-sm border border-border overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                                    {e.avatarUrl ? (
                                                        <img src={e.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-indigo-600 font-black text-xl bg-indigo-50">
                                                            {e.name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-content-primary font-outfit text-base uppercase leading-tight">{e.name}</div>
                                                    <div className="text-xs text-content-muted font-bold mt-1 lowercase">{e.email || 'no-email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-indigo-600 text-sm tracking-tighter">#{e.admissionNo}</div>
                                            <div className="text-[10px] text-content-muted font-black uppercase tracking-widest mt-1">Admission No.</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-content-primary text-sm">Roll: {e.rollNo || 'NA'}</div>
                                            <div className="text-[10px] text-content-muted font-black uppercase tracking-widest mt-1">Rank/Index</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${e.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                e.enrollmentStatus === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {e.enrollmentStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {selectedStatus === 'ACTIVE' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(e.enrollmentId, 'COMPLETED')}
                                                            className="p-3 text-content-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                                                            title="Mark as Completed"
                                                        >
                                                            <UserCheck className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(e.enrollmentId, 'WITHDRAWN')}
                                                            className="p-3 text-content-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                            title="Withdraw Student"
                                                        >
                                                            <UserMinus className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(e.enrollmentId, 'ACTIVE')}
                                                        className="p-3 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                        title="Re-activate"
                                                    >
                                                        <ArrowRightLeft className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button className="p-3 text-content-muted hover:text-content-primary transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex gap-6 animate-slide-up">
                <div className="w-14 h-14 bg-surface rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <BookOpen className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                    <h4 className="font-black text-amber-900 uppercase font-outfit tracking-tight">Academic Promotion Logic</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed mt-1 font-medium italic">
                        "Promoting a student to the next semester or batch creates a fresh enrollment record. This ensures their historical performance and roll numbers are preserved for compliance and reporting. Always mark previous enrollment as COMPLETED before starting a new one."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentEnrollmentManagementPage;
