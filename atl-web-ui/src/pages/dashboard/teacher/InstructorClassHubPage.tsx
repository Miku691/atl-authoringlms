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
    Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const InstructorClassHubPage: React.FC = () => {
    const { offeringId } = useParams<{ offeringId: string }>();
    const navigate = useNavigate();

    const [offering, setOffering] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'syllabus'>('students');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (offeringId) {
            loadHubData();
        }
    }, [offeringId]);

    const loadHubData = async () => {
        setLoading(true);
        try {
            const [offResult, stdResult] = await Promise.allSettled([
                academicService.getOfferingById(offeringId!),
                studentService.getStudentsByOffering(offeringId!)
            ]);

            if (offResult.status === 'fulfilled' && offResult.value.status === 'SUCCESS') {
                setOffering(offResult.value.apiData);
            } else {
                console.error("Hub: Failed to fetch offering", offResult.status === 'rejected' ? offResult.reason : 'API Error');
                toast.error("Failed to load offering details");
            }

            if (stdResult.status === 'fulfilled' && stdResult.value.status === 'SUCCESS') {
                setStudents(stdResult.value.apiData.content || []);
            } else {
                console.error("Hub: Failed to fetch students", stdResult.status === 'rejected' ? stdResult.reason : 'API Error');
                // Don't toast for students unless offering also failed, maybe? 
                // Or just warning.
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
                <p className="text-gray-500 animate-pulse">Syncing class data...</p>
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
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-gray-900">{offering?.name}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">
                                {offering?.type?.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Instructor Workspace • Session 2024-25</p>
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
                        className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <BookOpen className="w-4 h-4" /> Track Syllabus
                    </button>
                </div>
            </div>

            {/* Hub Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-white rounded-t-2xl px-6 pt-4">
                {[
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'attendance', label: 'Attendance Logs', icon: Calendar },
                    { id: 'syllabus', label: 'Course Progress', icon: BookOpen }
                ].map((tab: any) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
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
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-6">
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or admission number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium px-2">
                                <Users className="w-4 h-4" />
                                Total: {filteredStudents.length} Students
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-3">
                                <thead className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">
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
                                        <tr key={std.studentId} className="group hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 bg-white border-y border-l border-gray-50 rounded-l-2xl font-black text-indigo-600">
                                                #{std.rollNo || '-'}
                                            </td>
                                            <td className="px-4 py-4 bg-white border-y border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                                                        {std.avatarUrl ? (
                                                            <img src={std.avatarUrl} alt={std.name} className="w-full h-full object-cover" />
                                                        ) : std.name[0]}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{std.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 bg-white border-y border-gray-50 text-sm font-medium text-gray-500">
                                                {std.admissionNo}
                                            </td>
                                            <td className="px-4 py-4 bg-white border-y border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <a href={`mailto:${std.email}`} className="p-2 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all" title={std.email}>
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <a href={`tel:${std.phone}`} className="p-2 bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all" title={std.phone}>
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 bg-white border-y border-gray-50">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${std.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {std.enrollmentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 bg-white border-y border-r border-gray-50 rounded-r-2xl">
                                                <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors rounded-lg">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 italic">No students found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="py-20 text-center">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Attendance Dashboard Pending</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                            Detailed daily logs and monthly summaries are being integrated.
                            Use the <b>Take Attendance</b> button for real-time marking.
                        </p>
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="py-20 text-center">
                        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Curriculum Mapping Pending</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                            A visual chart of completed chapters and pending topics will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorClassHubPage;
