import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import api from '../../../../../utils/api';
import toast from 'react-hot-toast';
import {
    User,
    BookOpen,
    Users,
    FileText,
    ArrowLeft,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield
} from 'lucide-react';
import AuthenticatedAvatar from '../../../../../components/common/AuthenticatedAvatar';
import StudentDocumentsModal from '../../users/StudentDocumentsModal';

// Interfaces
interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    admissionNo: string;
    admissionDate: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    category: string;
    religion: string;
    address: string;
    status: string;
    profileImageUrl?: string;
    tenantId: string;
}

interface Enrollment {
    id: string;
    offeringId: string;
    academicYear: string;
    status: string;
    enrolledAt: string;
    offeringName?: string; // Enriched
}

interface Guardian {
    id: string;
    guardianName: string;
    relation: string;
    phone: string;
    email: string;
    occupation: string;
    address: string;
}

const StudentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'guardians' | 'documents'>('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [student, setStudent] = useState<Student | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);

    // Document Modal State (reused)
    const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

    useEffect(() => {
        if (id && tenantId) {
            fetchAllData();
        }
    }, [id, tenantId]);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [studentRes, enrollRes, guardianRes] = await Promise.all([
                api.get(`/ims-student/students/${id}`),
                api.get(`/ims-student/student-enrollments/student/${id}`),
                api.get(`/ims-student/student-guardians/student/${id}`)
            ]);

            if (studentRes.data.status === 'SUCCESS') {
                setStudent(studentRes.data.apiData);
            }

            if (enrollRes.data.status === 'SUCCESS') {
                const fetchedEnrollments = enrollRes.data.apiData;
                // Enrich enrollments with offering names (This assumes we might need a separate call or list, 
                // but for now we'll just display ID or handle it if the API returns it. 
                // Ideally, the Backend DTO should have offeringName, or we fetch offerings map.
                // For this step, we will assume DTO enrichment or raw ID display until refined).

                // Let's fetch the offering name for each enrollment to be user friendly
                const enriched = await Promise.all(fetchedEnrollments.map(async (enr: any) => {
                    try {
                        const offRes = await api.get(`/ims-academic/offerings/${enr.offeringId}`);
                        return { ...enr, offeringName: offRes.data.apiData.name };
                    } catch (e) {
                        return { ...enr, offeringName: 'Unknown Offering' };
                    }
                }));
                setEnrollments(enriched);
            }

            if (guardianRes.data.status === 'SUCCESS') {
                setGuardians(guardianRes.data.apiData);
            }

        } catch (error) {
            console.error('Failed to fetch student details', error);
            toast.error('Failed to load student data');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-xl font-semibold text-gray-900">Student not found</h2>
                <button onClick={() => navigate('/people/students')} className="mt-4 text-indigo-600 hover:underline">
                    Back to Students
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'academic', label: 'Academic History', icon: BookOpen },
        { id: 'guardians', label: 'Guardians', icon: Users },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/people/students')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Students
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
                        <AuthenticatedAvatar
                            imageUrl={student.profileImageUrl}
                            fallbackInitial={student.firstName[0]}
                            alt={`${student.firstName}`}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Shield className="w-4 h-4 text-gray-400" />
                                Admission No: <span className="font-medium text-gray-900">{student.admissionNo}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {student.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {student.phone}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold 
                            ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {student.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Content */}
            <div className="min-h-[400px]">

                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                        </div>
                        <div className="px-6 py-5">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.firstName} {student.lastName}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.dob || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.gender || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.bloodGroup || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Religion</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.religion || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.category || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{student.address || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {/* 2. Academic History Tab */}
                {activeTab === 'academic' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Enrollment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offering (Class)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enrollments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                                No enrollment history found.
                                            </td>
                                        </tr>
                                    ) : (
                                        enrollments.map((enrollment) => (
                                            <tr key={enrollment.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enrollment.academicYear}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{enrollment.offeringName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                            enrollment.status === 'WITHDRAWN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {enrollment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. Guardians Tab */}
                {activeTab === 'guardians' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Guardians</h3>
                            {/* TODO: Add 'Add Guardian' button here logic */}
                        </div>
                        {guardians.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-500 italic">No guardians linked to this student.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 p-6">
                                {guardians.map(guardian => (
                                    <div key={guardian.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">{guardian.guardianName} <span className="text-sm font-normal text-gray-500">({guardian.relation})</span></h4>
                                            <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {guardian.phone}</span>
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {guardian.email}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500"><span className="font-medium">Address:</span> {guardian.address}</p>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            {/* Edit/Delete Actions would go here */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
                        <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Documents</h3>
                            <p className="mt-1 text-sm text-gray-500">Upload and view student certificates and ID proofs.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsDocsModalOpen(true)}
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Open Document Manager
                                </button>
                            </div>
                        </div>
                        {/* Documents Modal */}
                        <StudentDocumentsModal
                            isOpen={isDocsModalOpen}
                            onClose={() => setIsDocsModalOpen(false)}
                            studentId={id || null}
                            studentName={`${student.firstName} ${student.lastName}`}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentDetailsPage;
