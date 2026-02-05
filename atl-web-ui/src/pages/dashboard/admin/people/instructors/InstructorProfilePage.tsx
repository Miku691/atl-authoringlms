import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import AuthenticatedAvatar from '../../../../../components/common/AuthenticatedAvatar';
import {
    User, Book, Calendar, FileText, ArrowLeft,
    Mail, Briefcase, Award, GraduationCap, MapPin
} from 'lucide-react';
import InstructorTimetableTab from './components/InstructorTimetableTab';
import InstructorSubjectsTab from './components/InstructorSubjectsTab';

interface Instructor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
    specialization: string;
    qualification: string;
    experienceYears?: number;
    joinDate?: string;
    profileImageUrl?: string;
    status: string;
    address?: string;
}

const OverviewTab = ({ instructor }: { instructor: Instructor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" /> Professional Profile
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Employee Details</p>
                        <p className="font-medium text-gray-900 mt-1">{instructor.firstName} {instructor.lastName}</p>
                        <p className="text-sm text-gray-600">ID: {instructor.employeeId}</p>
                        <p className="text-sm text-gray-600">Joined: {instructor.joinDate || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Specialization</p>
                        <p className="font-medium text-gray-900 mt-1">{instructor.specialization}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Qualification</p>
                        <p className="font-medium text-gray-900 mt-1">{instructor.qualification}</p>
                        <p className="text-sm text-gray-600">Experience: {instructor.experienceYears || 0} Years</p>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Contact Info</p>
                        <p className="font-medium text-gray-900 mt-1">{instructor.email}</p>
                        <p className="text-sm text-gray-600">{instructor.phone}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                        <p className="font-medium text-gray-900 mt-1">{instructor.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const InstructorProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'subjects' | 'docs'>('overview');

    useEffect(() => {
        if (id) fetchInstructor();
    }, [id]);

    const fetchInstructor = async () => {
        try {
            const response = await api.get(`/ims-instructor-service/instructors/${id}`);
            if (response.data.status === 'SUCCESS') {
                setInstructor(response.data.apiData);
            }
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!instructor) return <div className="p-8 text-center text-red-500">Instructor not found</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'subjects', label: 'Subjects', icon: Book },
        { id: 'docs', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-8 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="bg-white p-1 rounded-full shadow-lg">
                                <AuthenticatedAvatar
                                    imageUrl={instructor.profileImageUrl}
                                    fallbackInitial={instructor.firstName[0]}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full border-4 border-white text-4xl"
                                />
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{instructor.firstName} {instructor.lastName}</h1>
                                <p className="text-gray-500">{instructor.specialization} • <span className="text-green-600 font-medium">{instructor.status}</span></p>
                            </div>
                        </div>
                        <div className="mb-2 flex gap-2">
                            <button
                                onClick={() => navigate('/people/instructors')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to List
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-1 border-b overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="animate-fade-in-up">
                {activeTab === 'overview' && <OverviewTab instructor={instructor} />}
                {activeTab === 'timetable' && id && <InstructorTimetableTab instructorId={id} />}
                {activeTab === 'subjects' && id && <InstructorSubjectsTab instructorId={id} />}

                {activeTab === 'docs' && (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center text-gray-500 border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 uppercase tracking-tight">Personnel Vault</h3>
                        <p className="text-sm mt-1">Institutional records and identity documents are managed here.</p>
                        <button className="mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-black transition-all">
                            Configure Documents
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorProfilePage;
