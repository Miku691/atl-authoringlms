import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';
import { enrollmentService, type StudentSummary } from '../../../api/enrollmentService';
import { examService, type MarksRecord, type ExamSchedule } from '../../../api/examService';
import { Save, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MarksEntryGridProps {
    schedule: ExamSchedule;
    offeringName: string;
    onBack: () => void;
}

export default function MarksEntryGrid({ schedule, offeringName, onBack }: MarksEntryGridProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [marksData, setMarksData] = useState<Record<string, MarksRecord>>({});

    useEffect(() => {
        if (user?.tenantId && schedule.offeringId) {
            fetchData();
        }
    }, [schedule, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch enrolled students
            const studentsRes = await enrollmentService.getStudentsByOffering(schedule.offeringId, 'ACTIVE', 0, 1000);
            const studentList: StudentSummary[] = studentsRes.data?.apiData?.content || studentsRes.data?.content || studentsRes.data || [];

            // Fetch existing marks
            const existingMarksRes = await examService.getMarksBySchedule(schedule.id);
            const existingMarks: MarksRecord[] = existingMarksRes || [];

            // Map existing marks by studentId
            const marksMap: Record<string, MarksRecord> = {};
            existingMarks.forEach(m => {
                marksMap[m.studentId] = m;
            });

            // Initialize missing marks for students
            studentList.forEach(st => {
                if (!marksMap[st.studentId]) {
                    marksMap[st.studentId] = {
                        examScheduleId: schedule.id,
                        studentId: st.studentId,
                        marksObtained: null,
                        isAbsent: false,
                        remarks: '',
                        tenantId: user!.tenantId!
                    };
                }
            });

            setStudents(studentList);
            setMarksData(marksMap);
        } catch (err) {
            toast.error("Failed to load marks data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId: string, field: keyof MarksRecord, value: any) => {
        setMarksData(prev => {
            const current = prev[studentId];
            if (field === 'marksObtained') {
                // Ensure it doesn't exceed max marks
                let numericVal = value === '' ? null : Number(value);
                if (numericVal !== null && numericVal > schedule.maxMarks) {
                    numericVal = schedule.maxMarks;
                } else if (numericVal !== null && numericVal < 0) {
                    numericVal = 0;
                }
                return { ...prev, [studentId]: { ...current, [field]: numericVal, isAbsent: false } };
            }
            if (field === 'isAbsent' && value === true) {
                return { ...prev, [studentId]: { ...current, [field]: value, marksObtained: null } };
            }
            return { ...prev, [studentId]: { ...current, [field]: value } };
        });
    };

    const handleSave = async () => {
        if (!user?.tenantId) return;
        setSaving(true);
        try {
            const marksList = Object.values(marksData);
            await examService.saveBulkMarks(schedule.id, marksList, user.tenantId);
            toast.success("Marks saved successfully!");
            // Refetch to get generated IDs if any
            fetchData();
        } catch (err) {
            toast.error("Failed to save marks");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-border">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-content-secondary font-bold uppercase tracking-widest text-[10px]">Loading Gradebook...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-border bg-chrome/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-surface border border-border flex items-center justify-center rounded-xl hover:bg-chrome transition-colors text-content-muted hover:text-content-primary"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-content-primary tracking-tight">Gradebook Entry</h2>
                        <p className="text-content-muted text-[10px] font-bold uppercase tracking-widest mt-1">
                            {offeringName} • Max Marks: {schedule.maxMarks} • Pass: {schedule.passMarks}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Grades
                </button>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-chrome">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-content-muted uppercase tracking-widest w-16">Roll No</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-content-muted uppercase tracking-widest">Student Name</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-content-muted uppercase tracking-widest w-32">Absent</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-content-muted uppercase tracking-widest w-40">Marks Obtained</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-content-muted uppercase tracking-widest">Remarks (Optional)</th>
                            <th className="px-6 py-4 text-center text-[10px] font-black text-content-muted uppercase tracking-widest w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-20 text-center">
                                    <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-content-muted font-bold uppercase tracking-widest text-[10px]">No students enrolled in this offering.</p>
                                </td>
                            </tr>
                        ) : students.map((student, idx) => {
                            const markRec = marksData[student.studentId];
                            if (!markRec) return null;
                            const isPassing = markRec.marksObtained !== null && markRec.marksObtained >= schedule.passMarks;
                            const hasMarks = markRec.marksObtained !== null;

                            return (
                                <tr key={student.studentId} className="hover:bg-chrome/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-content-secondary text-sm">
                                        {student.rollNo || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-content-primary text-sm">{student.name}</div>
                                        <div className="text-[10px] font-bold text-content-muted uppercase">{student.admissionNo}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={markRec.isAbsent}
                                                onChange={(e) => handleMarkChange(student.studentId, 'isAbsent', e.target.checked)}
                                                className="w-5 h-5 rounded border-border text-red-500 focus:ring-red-500 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={markRec.marksObtained === null ? '' : markRec.marksObtained}
                                            onChange={(e) => handleMarkChange(student.studentId, 'marksObtained', e.target.value)}
                                            disabled={markRec.isAbsent}
                                            max={schedule.maxMarks}
                                            min={0}
                                            placeholder="-"
                                            className={`w-full bg-surface border rounded-xl px-4 py-2 font-black text-center text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${markRec.isAbsent ? 'bg-slate-50 opacity-50 border-border' :
                                                    (hasMarks && !isPassing ? 'border-red-200 text-red-600 focus:border-red-500' : 'border-border text-content-primary')
                                                }`}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={markRec.remarks}
                                            onChange={(e) => handleMarkChange(student.studentId, 'remarks', e.target.value)}
                                            placeholder="Add remark..."
                                            className="w-full bg-surface border border-border rounded-xl px-4 py-2 font-bold text-xs text-content-secondary focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {markRec.isAbsent ? (
                                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase border border-red-100">Absent</span>
                                        ) : hasMarks ? (
                                            isPassing ?
                                                <span className="flex items-center justify-center gap-1 text-emerald-600 font-black text-[10px] uppercase"><CheckCircle2 className="w-3 h-3" /> Pass</span> :
                                                <span className="text-red-500 font-black text-[10px] uppercase">Fail</span>
                                        ) : (
                                            <span className="text-content-muted font-bold text-[10px] uppercase">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
