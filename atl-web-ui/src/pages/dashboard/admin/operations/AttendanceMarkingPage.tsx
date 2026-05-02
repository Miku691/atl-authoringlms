
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { academicService } from '../../../../api/academicService';
import { studentService } from '../../../../api/studentService';
import { attendanceService } from '../../../../api/attendanceService';
import {
    Calendar as CalendarIcon,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Loader2,
    Save,
    BarChart3,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { instructorService } from '../../../../api/instructorService';
import { staffService } from '../../../../api/staffService';
import AttendanceChart from '../../../../components/attendance/AttendanceChart';
import Modal from '../../../../components/common/Modal';

interface PersonListItem {
    id: string; // backend person ID (studentId or staffId)
    name: string;
    identifier: string; // admissionNo or employeeCode
    status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
    remarks: string;
}

const AttendanceMarkingPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [personType, setPersonType] = useState<'STUDENT' | 'INSTRUCTOR' | 'STAFF'>('STUDENT');
    const [people, setPeople] = useState<PersonListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Details Modal State
    const [showDetails, setShowDetails] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<{ id: string, name: string } | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        fetchOfferings();
    }, [user?.tenantId]);

    useEffect(() => {
        if (personType === 'STAFF') {
            fetchPeople();
        } else if (selectedOffering) {
            fetchSubjects(selectedOffering);
            fetchPeople();
        } else {
            setPeople([]);
            setSubjects([]);
        }
    }, [selectedOffering, date, personType]);

    const fetchOfferings = async () => {
        if (!user?.tenantId) return;
        try {
            const data = await academicService.getOfferingsByTenant(user.tenantId);
            setOfferings(data || []);
        } catch (error) {
            console.error("Failed to fetch offerings", error);
        }
    };

    const fetchSubjects = async (offeringId: string) => {
        try {
            const response = await academicService.getOfferingSubjects(offeringId);
            if (response.status === 'SUCCESS') {
                setSubjects(response.apiData || []);
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const fetchPeople = async () => {
        if (!selectedOffering && personType !== 'STAFF') return;
        setLoading(true);
        try {
            let personList: any[] = [];
            if (personType === 'STUDENT') {
                const response = await studentService.getStudentsByOffering(selectedOffering);
                personList = (response.apiData.content || []).map((s: any) => ({
                    id: s.studentId, // From StudentSummaryDto
                    name: s.name,    // From StudentSummaryDto
                    identifier: s.admissionNo,
                }));
            } else if (personType === 'INSTRUCTOR') {
                const [assignmentsRes, instructorsRes] = await Promise.all([
                    instructorService.getAssignmentsByOffering(selectedOffering),
                    instructorService.getInstructorsByTenant(user?.tenantId || '')
                ]);

                const instructors = instructorsRes.apiData || [];
                personList = (assignmentsRes.apiData || []).map((item: any) => {
                    const instructor = instructors.find((inst: any) => inst.id === item.instructorId);
                    return {
                        id: item.instructorId,
                        name: instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}` : 'Unknown Instructor',
                        identifier: instructor ? instructor.userId : 'N/A',
                    };
                });
            } else if (personType === 'STAFF') {
                const response = await staffService.getStaffByTenant(user?.tenantId || '');
                personList = (response.apiData || []).map((s: any) => ({
                    id: s.id,
                    name: `${s.firstName || ''} ${s.lastName || ''}`,
                    identifier: s.employeeId,
                }));
            }

            // Fetch existing attendance
            let existingAttendance: any[] = [];
            if (personType === 'STAFF') {
                existingAttendance = await attendanceService.getStaffAttendance(user?.tenantId || '', date);
            } else {
                existingAttendance = await attendanceService.getAttendanceByOfferingAndDate(selectedOffering, date);
            }

            const mappedPeople = personList.map((p: any) => {
                const attendance = existingAttendance.find((a: any) => a.personId === p.id);
                return {
                    ...p,
                    status: attendance ? attendance.status : 'PRESENT',
                    remarks: attendance ? attendance.remarks || '' : ''
                };
            });
            setPeople(mappedPeople);
        } catch (error) {
            console.error("Failed to fetch people", error);
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (personId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE') => {
        setPeople(prev => prev.map(p => p.id === personId ? { ...p, status } : p));
    };

    const handleRemarksChange = (personId: string, remarks: string) => {
        setPeople(prev => prev.map(p => p.id === personId ? { ...p, remarks } : p));
    };

    const saveAttendance = async () => {
        if (!user?.tenantId) return;
        if (personType !== 'STAFF' && !selectedOffering) return;

        setSaving(true);
        try {
            const payload = {
                offeringId: personType === 'STAFF' ? undefined : selectedOffering,
                subjectId: selectedSubject || undefined,
                date: date,
                personType: personType,
                records: people.map(p => ({
                    personId: p.id,
                    personName: p.name,
                    status: p.status,
                    remarks: p.remarks
                }))
            };

            await attendanceService.markBulkAttendance(user.tenantId, payload);
            toast.success("Attendance saved successfully");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    const fetchMonthlyStats = async (personId: string, name: string) => {
        setSelectedPerson({ id: personId, name });
        setShowDetails(true);
        setLoadingStats(true);
        try {
            const now = new Date();
            const res = await attendanceService.getAttendanceStats(personId, personType, now.getMonth() + 1, now.getFullYear());
            setMonthlyStats(res);
        } catch (error) {
            toast.error("Failed to load statistics");
        } finally {
            setLoadingStats(false);
        }
    };

    const filteredPeople = people.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: people.length,
        present: people.filter(p => p.status === 'PRESENT').length,
        absent: people.filter(p => p.status === 'ABSENT').length,
        leave: people.filter(p => p.status === 'LEAVE').length,
        late: people.filter(p => p.status === 'LATE').length
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Attendance Center</h1>
                    <p className="text-content-secondary">Manage daily records for Students, Instructors, and Staff</p>
                </div>
                <button
                    onClick={saveAttendance}
                    disabled={saving || people.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Attendance
                </button>
            </div>

            {/* Selection Bar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1 uppercase tracking-wider">Category</label>
                    <div className="flex bg-chrome p-1 rounded-lg">
                        <button
                            onClick={() => setPersonType('STUDENT')}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${personType === 'STUDENT' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setPersonType('INSTRUCTOR')}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${personType === 'INSTRUCTOR' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Instructors
                        </button>
                        <button
                            onClick={() => setPersonType('STAFF')}
                            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${personType === 'STAFF' ? 'bg-surface text-indigo-600 shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}
                        >
                            Staff
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1 uppercase tracking-wider">Class / Offering</label>
                    <select
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-chrome disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedOffering}
                        disabled={personType === 'STAFF'}
                        onChange={(e) => setSelectedOffering(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {offerings.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1 uppercase tracking-wider">Subject (Optional)</label>
                    <select
                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-chrome disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedSubject}
                        disabled={personType === 'STAFF'}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">General Attendance</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.subjectName || s.subject?.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-content-secondary mb-1 uppercase tracking-wider">Date</label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-muted w-4 h-4" />
                        <input
                            type="date"
                            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-chrome"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-end">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder={`Find ${personType.toLowerCase()}...`}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            {people.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { label: 'Total', value: stats.total, color: 'blue', icon: Users },
                        { label: 'Present', value: stats.present, color: 'green', icon: CheckCircle2 },
                        { label: 'Absent', value: stats.absent, color: 'red', icon: XCircle },
                        { label: 'Leave', value: stats.leave, color: 'orange', icon: Clock },
                        { label: 'Late', value: stats.late, color: 'purple', icon: Clock },
                    ].map((stat) => (
                        <div key={stat.label} className={`bg-${stat.color}-500/5 dark:bg-${stat.color}-500/10 border border-${stat.color}-500/10 dark:border-${stat.color}-500/20 p-3 rounded-xl`}>
                            <div className="flex items-center gap-2 mb-1">
                                <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                <span className={`text-xs font-medium text-${stat.color}-700 dark:text-${stat.color}-300 uppercase`}>{stat.label}</span>
                            </div>
                            <p className={`text-xl font-bold text-${stat.color}-900 dark:text-${stat.color}-100`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* People List */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                {!selectedOffering && personType !== 'STAFF' ? (
                    <div className="p-12 text-center text-content-muted">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p>Select a class and date to start marking attendance</p>
                    </div>
                ) : loading ? (
                    <div className="p-12 text-center text-content-secondary">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                        <p>Loading {personType === 'STUDENT' ? 'student' : 'staff'} list...</p>
                    </div>
                ) : filteredPeople.length === 0 ? (
                    <div className="p-12 text-center text-content-secondary">
                        <p>No records found for the selected criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-chrome border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">{personType === 'STUDENT' ? 'Student' : 'Staff Member'}</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredPeople.map((person, idx) => (
                                    <tr key={person.id || `person-${idx}`} className="hover:bg-chrome transition-colors">
                                        <td className="px-6 py-4">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer group"
                                                onClick={() => fetchMonthlyStats(person.id, person.name)}
                                            >
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
                                                        {person.name[0]}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <BarChart3 className="w-3 h-3 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-content-primary group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                                        {person.name}
                                                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                                                    </p>
                                                    <p className="text-xs text-content-secondary">ID: {person.identifier}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(person.id, 'PRESENT')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${person.status === 'PRESENT'
                                                        ? 'bg-green-600 text-white shadow-sm scale-105'
                                                        : 'bg-chrome text-content-secondary hover:bg-chrome'
                                                        }`}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(person.id, 'ABSENT')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${person.status === 'ABSENT'
                                                        ? 'bg-red-600 text-white shadow-sm scale-105'
                                                        : 'bg-chrome text-content-secondary hover:bg-chrome'
                                                        }`}
                                                >
                                                    A
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(person.id, 'LATE')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${person.status === 'LATE'
                                                        ? 'bg-purple-600 text-white shadow-sm scale-105'
                                                        : 'bg-chrome text-content-secondary hover:bg-chrome'
                                                        }`}
                                                >
                                                    L
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(person.id, 'LEAVE')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${person.status === 'LEAVE'
                                                        ? 'bg-orange-600 text-white shadow-sm scale-105'
                                                        : 'bg-chrome text-content-secondary hover:bg-chrome'
                                                        }`}
                                                >
                                                    LV
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                className="w-full text-sm bg-chrome border border-border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-content-primary"
                                                placeholder="Add note..."
                                                value={person.remarks}
                                                onChange={(e) => handleRemarksChange(person.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Monthly Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                title="Monthly Attendance Details"
                size="lg"
            >
                <div className="p-4">
                    {loadingStats ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-content-secondary font-medium">Analyzing attendance data...</p>
                        </div>
                    ) : monthlyStats ? (
                        <AttendanceChart
                            stats={monthlyStats}
                            personName={selectedPerson?.name || 'User'}
                        />
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-content-muted">
                            <BarChart3 className="w-16 h-16 opacity-10 mb-4" />
                            <p>No statistics available for this period.</p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => setShowDetails(false)}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AttendanceMarkingPage;
