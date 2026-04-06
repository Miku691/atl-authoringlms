import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { academicService, type ImsOffering } from '../../../api/academicService';
import { instructorService } from '../../../api/instructorService';
import { examService, type ExamSchedule, type MarksRecord } from '../../../api/examService';
import { 
    GraduationCap, 
    ChevronRight, 
    Loader2, 
    Save, 
    AlertCircle, 
    CheckCircle2,
    Calendar,
    Users,
    Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../utils/api';

export default function InstructorGradebook() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [marks, setMarks] = useState<MarksRecord[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.email && user?.tenantId) {
            initialize();
        }
    }, [user]);

    useEffect(() => {
        if (selectedOfferingId) {
            fetchSchedules();
            setSelectedScheduleId(null);
            setMarks([]);
        }
    }, [selectedOfferingId]);

    useEffect(() => {
        if (selectedScheduleId) {
            fetchMarksAndStudents();
        }
    }, [selectedScheduleId]);

    const initialize = async () => {
        setLoading(true);
        try {
            const profileRes = await instructorService.resolveProfile(user!.email!, user!.tenantId!);
            if (profileRes.status === 'SUCCESS' && profileRes.apiData) {
                const offeringsData = await academicService.getOfferingsByInstructor(profileRes.apiData.id);
                setOfferings(offeringsData || []);
                if (offeringsData && offeringsData.length > 0) {
                    setSelectedOfferingId(offeringsData[0].id);
                }
            }
        } catch (err) {
            toast.error("Failed to load instructor context");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        if (!selectedOfferingId || !user?.tenantId) return;
        try {
            const data = await examService.getSchedulesByOffering(selectedOfferingId, user.tenantId);
            setSchedules(data || []);
        } catch (err) {
            toast.error("Failed to load assessments");
        }
    };

    const fetchMarksAndStudents = async () => {
        if (!selectedScheduleId || !selectedOfferingId) return;
        setLoading(true);
        try {
            const [marksData, enrollRes] = await Promise.all([
                examService.getMarksBySchedule(selectedScheduleId),
                api.get(`/ims-student-service/enrollments/offering/${selectedOfferingId}`)
            ]);
            
            const studentList = enrollRes.data.apiData || [];
            setStudents(studentList);

            // Initialize marks for all students
            const existingMarksMap = new Map((marksData || []).map((m: MarksRecord) => [m.studentId, m]));
            const initialMarks = studentList.map((s: any) => {
                const existing = existingMarksMap.get(s.studentId);
                return existing || {
                    examScheduleId: selectedScheduleId,
                    studentId: s.studentId,
                    studentName: s.name,
                    rollNo: s.rollNo,
                    marksObtained: null,
                    isAbsent: false,
                    remarks: '',
                    tenantId: user?.tenantId || ''
                };
            });
            setMarks(initialMarks);
        } catch (err) {
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleMarksChange = (studentId: string, value: string) => {
        const num = value === '' ? null : parseFloat(value);
        setMarks(prev => prev.map(m => m.studentId === studentId ? { ...m, marksObtained: num } : m));
    };

    const handleToggleAbsent = (studentId: string) => {
        setMarks(prev => prev.map(m => m.studentId === studentId ? { ...m, isAbsent: !m.isAbsent, marksObtained: !m.isAbsent ? 0 : null } : m));
    };

    const handleSave = async () => {
        if (!selectedScheduleId || !user?.tenantId) return;
        setSaving(true);
        try {
            await examService.saveBulkMarks(selectedScheduleId, marks, user.tenantId);
            toast.success("Gradebook updated successfully!");
        } catch (err) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !marks.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Opening Gradebook...</p>
            </div>
        );
    }

    const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header Section */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Instructor Workspace</p>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gradebook</h1>
                        </div>
                    </div>

                    {marks.length > 0 && (
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save All Changes
                        </button>
                    )}
                </div>

                {/* Offering Selection */}
                <div className="mt-10 flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {offerings.map(off => (
                        <button
                            key={off.id}
                            onClick={() => setSelectedOfferingId(off.id)}
                            className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 whitespace-nowrap ${
                                selectedOfferingId === off.id 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                                : 'bg-white text-slate-500 border-slate-50 hover:border-indigo-100 hover:text-indigo-600'
                            }`}
                        >
                            {off.name}
                        </button>
                    ))}
                </div>

                {/* Assessment Grid */}
                {schedules.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {schedules.map(sch => (
                            <button
                                key={sch.id}
                                onClick={() => setSelectedScheduleId(sch.id)}
                                className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                                    selectedScheduleId === sch.id
                                    ? 'bg-indigo-50 border-indigo-600 shadow-sm'
                                    : 'bg-white border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl transition-colors ${
                                        selectedScheduleId === sch.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-600'
                                    }`}>
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ${selectedScheduleId === sch.id ? 'text-indigo-600' : 'text-slate-200'}`} />
                                </div>
                                <h3 className={`font-black uppercase tracking-tight text-sm mb-1 ${selectedScheduleId === sch.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                                    {sch.subjectName || 'Internal Paper'}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(sch.examDate).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Students Table */}
            {selectedScheduleId && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Student Performance List</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Maximum Marks: {selectedSchedule?.maxMarks} | Pass Marks: {selectedSchedule?.passMarks}</p>
                        </div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            {students.length} Enrolled
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4 text-left">Student Info</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-left">Marks</th>
                                    <th className="px-8 py-4 text-left">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {marks.map((m, idx) => (
                                    <tr key={m.studentId} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm">{m.studentName}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Roll: {m.rollNo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button 
                                                onClick={() => handleToggleAbsent(m.studentId)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                    m.isAbsent 
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                }`}
                                            >
                                                {m.isAbsent ? 'Absent' : 'Present'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="relative max-w-[120px]">
                                                <input 
                                                    type="number"
                                                    disabled={m.isAbsent}
                                                    value={m.marksObtained ?? ''}
                                                    onChange={(e) => handleMarksChange(m.studentId, e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all font-black text-lg outline-none text-center ${
                                                        m.isAbsent 
                                                        ? 'bg-slate-100 border-slate-100 text-slate-300' 
                                                        : 'bg-white border-slate-50 focus:border-indigo-600 text-slate-900'
                                                    }`}
                                                    placeholder="0"
                                                />
                                                {!m.isAbsent && m.marksObtained !== null && m.marksObtained < (selectedSchedule?.passMarks || 0) && (
                                                    <div className="absolute -right-2 -top-2">
                                                        <AlertCircle className="w-5 h-5 text-rose-500 fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <input 
                                                type="text"
                                                value={m.remarks}
                                                onChange={(e) => setMarks(prev => prev.map(mm => mm.studentId === m.studentId ? { ...mm, remarks: e.target.value } : mm))}
                                                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-50 focus:border-indigo-600 outline-none font-bold text-slate-600 text-xs transition-all"
                                                placeholder="Add performance note..."
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {!selectedScheduleId && offerings.length > 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 max-w-2xl mx-auto mt-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Select Assessment</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase mt-1">Please select an offering and a paper to begin marking</p>
                </div>
            )}
        </div>
    );
}
