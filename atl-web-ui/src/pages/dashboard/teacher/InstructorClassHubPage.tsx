import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { academicService } from '../../../api/academicService';
import { studentService } from '../../../api/studentService';
import {
    Users,
    Calendar,
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Loader2,
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthenticatedAvatar from '../../../components/common/AuthenticatedAvatar';

const InstructorClassHubPage: React.FC = () => {
    const { offeringId } = useParams<{ offeringId: string }>();
    const navigate = useNavigate();

    const [offering, setOffering] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'syllabus'>('students');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize] = useState(10);

    useEffect(() => {
        if (offeringId) {
            loadHubData();
        }
    }, [offeringId, currentPage]);

    const loadHubData = async () => {
        setLoading(true);
        try {
            const [offResult, stdResult] = await Promise.allSettled([
                academicService.getOfferingById(offeringId!),
                studentService.getStudentsByOffering(offeringId!, currentPage, pageSize)
            ]);

            if (offResult.status === 'fulfilled' && offResult.value.status === 'SUCCESS') {
                setOffering(offResult.value.apiData);
            }

            if (stdResult.status === 'fulfilled' && stdResult.value.status === 'SUCCESS') {
                const data = stdResult.value.apiData;
                setStudents(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }

        } catch (error) {
            console.error("Hub load error", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-content-secondary animate-pulse">Syncing class data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-chrome rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-content-muted" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-content-primary">{offering?.name}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                                {offering?.type?.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-content-secondary mt-1">Instructor Workspace • Session 2024-25</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/operations/attendance', { state: { offeringId } })}
                        className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> Take Attendance
                    </button>
                    <button
                        onClick={() => navigate('/academics/syllabus', { state: { offeringId } })}
                        className="flex-1 md:flex-none px-4 py-2 bg-surface border border-border text-content-primary rounded-xl text-sm font-bold hover:bg-chrome transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <BookOpen className="w-4 h-4" /> Track Syllabus
                    </button>
                </div>
            </div>

            {/* Hub Navigation Tabs */}
            <div className="flex border-b border-border bg-surface rounded-t-2xl px-6 pt-4">
                {[
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'attendance', label: 'Attendance Logs', icon: Calendar },
                    { id: 'syllabus', label: 'Course Progress', icon: BookOpen }
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-content-muted hover:text-content-secondary'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-lg shadow-indigo-100"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-surface rounded-b-2xl shadow-sm border border-border p-6">
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or admission number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-chrome border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-content-secondary font-medium px-2">
                                <Users className="w-4 h-4" />
                                Total: {totalElements} Students
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-1">
                                <thead className="text-xs font-black text-content-muted uppercase tracking-widest text-left">
                                    <tr>
                                        <th className="px-4 pb-2">Roll</th>
                                        <th className="px-4 pb-2">Student</th>
                                        <th className="px-4 pb-2">Admission No</th>
                                        <th className="px-4 pb-2">Contact</th>
                                        <th className="px-4 pb-2">Status</th>
                                        <th className="px-4 pb-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((std) => (
                                        <tr key={std.studentId} className="group hover:bg-chrome transition-colors">
                                            <td className="px-4 py-2 bg-surface border-y border-l border-border rounded-l-2xl font-black text-indigo-600">
                                                #{std.rollNo || '-'}
                                            </td>
                                            <td className="px-4 py-2 bg-surface border-y border-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        <AuthenticatedAvatar
                                                            imageUrl={std.avatarUrl}
                                                            fallbackInitial={std.name[0]}
                                                            alt={std.name}
                                                            size="sm"
                                                            className="h-full w-full"
                                                        />
                                                    </div>
                                                    <span className="font-bold text-content-primary">{std.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 bg-surface border-y border-border text-sm font-medium text-content-secondary">
                                                {std.admissionNo}
                                            </td>
                                            <td className="px-4 py-2 bg-surface border-y border-border">
                                                <div className="flex items-center gap-3">
                                                    <a href={`mailto:${std.email}`} className="p-2 bg-chrome text-content-muted hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all" title={std.email}>
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <a href={`tel:${std.phone}`} className="p-2 bg-chrome text-content-muted hover:bg-green-50 hover:text-green-600 rounded-lg transition-all" title={std.phone}>
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 bg-surface border-y border-border">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${std.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {std.enrollmentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 bg-surface border-y border-r border-border rounded-r-2xl">
                                                <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors rounded-lg">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-20 bg-chrome/50 rounded-2xl border border-dashed border-border">
                                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-content-muted italic">No students found matching your search.</p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                                    <div className="text-sm font-medium text-content-secondary uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                        Showing {students.length} of {totalElements} Students
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                            className="px-4 py-2 border border-border rounded-xl text-sm font-black text-content-secondary hover:bg-chrome disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Previous
                                        </button>
                                        <div className="flex items-center gap-1.5 px-4 h-10 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <span className="text-sm font-black text-indigo-600">{currentPage + 1}</span>
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter">of</span>
                                            <span className="text-sm font-black text-indigo-600">{totalPages}</span>
                                        </div>
                                        <button
                                            disabled={currentPage >= totalPages - 1}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
                                        >
                                            Next <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="py-20 text-center">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-content-primary">Attendance Dashboard Pending</h3>
                        <p className="text-sm text-content-secondary max-w-sm mx-auto mt-2">
                            Detailed daily logs and monthly summaries are being integrated.
                            Use the <b>Take Attendance</b> button for real-time marking.
                        </p>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="py-20 text-center">
                        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-content-primary">Curriculum Mapping Pending</h3>
                        <p className="text-sm text-content-secondary max-w-sm mx-auto mt-2">
                            A visual chart of completed chapters and pending topics will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorClassHubPage;
