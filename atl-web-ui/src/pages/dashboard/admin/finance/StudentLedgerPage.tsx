import React, { useEffect, useState } from 'react';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';
import { Search, Calculator, Calendar, IdCard, Smartphone, HelpCircle, FileText, Clock, Users, ArrowRight, Tag, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { financeService } from '../../../../api/financeService';
import { studentService } from '../../../../api/studentService';
import type { StudentFeeRecord, DemandNote, FeeDiscount, StudentFeeConcession } from '../../../../types/finance';
import { academicService, type ImsOffering, type AcademicSession } from '../../../../api/academicService';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';


interface Student {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    status: string;
    phone?: string;
    tenantId: string;
}

interface Guardian {
    id: string;
    guardianName: string;
    relation: string;
    phone: string;
    isPrimary?: boolean;
}

const StudentLedgerPage: React.FC = () => {
    const { format, currencyCode } = useCurrency();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.roles?.includes('TENANT_ADMIN');

    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [ledger, setLedger] = useState<StudentFeeRecord[]>([]);
    const [demandNotes, setDemandNotes] = useState<DemandNote[]>([]);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [activeOffering, setActiveOffering] = useState<string>('');
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Concession States
    const [concessions, setConcessions] = useState<StudentFeeConcession[]>([]);
    const [feeDiscounts, setFeeDiscounts] = useState<FeeDiscount[]>([]);
    const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);
    const [concessionData, setConcessionData] = useState({
        feeDiscountId: '',
        academicYear: '',
        remarks: ''
    });
    const [isAssigningConcession, setIsAssigningConcession] = useState(false);

    // Allocation States
    const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

    // Demand Note States
    const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
    const [demandData, setDemandData] = useState({
        billingMonth: '',
        feeHeadId: '',
        feeHeadName: '',
        amount: 0,
        dueDate: '',
        description: ''
    });
    const [isGeneratingDemand, setIsGeneratingDemand] = useState(false);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [allocationData, setAllocationData] = useState({
        offeringId: '',
        academicYear: ''
    });
    const [isAllocating, setIsAllocating] = useState(false);

    // Pay Note States
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<DemandNote | null>(null);
    const [payData, setPayData] = useState({
        amount: 0,
        paymentMode: 'CASH' as any,
        referenceNumber: ''
    });
    const [isPaying, setIsPaying] = useState(false);

    useEffect(() => {
        if (user?.tenantId) {
            fetchOfferings(user.tenantId);
        }
    }, [user?.tenantId]);

    const fetchOfferings = async (tenantId: string) => {
        try {
            const [offeringData, sessionData] = await Promise.all([
                academicService.getOfferingsByTenant(tenantId),
                academicService.getSessionsByTenant(tenantId)
            ]);
            setOfferings(offeringData);
            setSessions(sessionData);

            // Set default academic year to current session
            const current = sessionData.find((s: AcademicSession) => s.isCurrent);
            if (current) {
                setAllocationData(prev => ({ ...prev, academicYear: current.name }));
                setConcessionData(prev => ({ ...prev, academicYear: current.name }));
            }
        } catch (error) {
            console.error('Failed to fetch initial data', error);
        }
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 3) {
            setStudents([]);
            return;
        }

        try {
            // Ideally we'd have a search API, but for now we filter all students
            const allStudents = await studentService.getAllStudents();
            const filtered = (allStudents.apiData as Student[]).filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
                s.admissionNo.toLowerCase().includes(term.toLowerCase())
            );
            setStudents(filtered);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const fetchLedger = async (studentId: string) => {
        setIsLoading(true);
        try {
            const [ledgerData, enrollmentData, guardianData, mappingData, demandData, concessionDataRes, discountData] = await Promise.all([
                financeService.getStudentLedger(studentId),
                studentService.getStudentEnrollments(studentId),
                studentService.getStudentGuardians(studentId),
                studentService.getStudentGuardianMappings(studentId),
                financeService.getStudentDemandNotes(studentId),
                financeService.getConcessionsByStudent(studentId),
                financeService.getFeeDiscounts()
            ]);
            setLedger(ledgerData);

            // Merge guardians from both sources
            const directGuardians = (guardianData.apiData || []).map((g: any) => ({
                id: g.id,
                guardianName: g.guardianName,
                relation: g.relation,
                phone: g.phone,
                isPrimary: true
            }));

            const mappedGuardians = (mappingData.apiData || []).map((m: any) => ({
                id: m.guardianId || m.id,
                guardianName: m.guardianName,
                relation: m.relation,
                phone: m.guardianPhone || m.phone,
                isPrimary: m.isPrimary
            }));

            // Combine and prioritize primary
            const combinedGuardians = [...directGuardians, ...mappedGuardians].sort((a,b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
            setGuardians(combinedGuardians);
            setDemandNotes(demandData || []);
            setConcessions(concessionDataRes || []);
            setFeeDiscounts(discountData || []);

            // Auto-detect active offering
            const activeEnrollment = enrollmentData.apiData?.find((e: any) => e.status === 'ACTIVE') || enrollmentData.apiData?.[0];
            if (activeEnrollment) {
                setAllocationData(prev => ({ ...prev, offeringId: activeEnrollment.offeringId }));

                // Fetch offering details for name
                try {
                    const offRes = await academicService.getOfferingById(activeEnrollment.offeringId);
                    setActiveOffering(offRes.apiData.name);
                } catch (e) {
                    setActiveOffering('Unknown Offering');
                }
            } else {
                setActiveOffering('Not Enrolled');
            }
        } catch (error) {
            toast.error('Failed to fetch financial data');
        } finally {
            setIsLoading(false);
        }
    };

    const selectStudent = (student: Student) => {
        setSelectedStudent(student);
        setStudents([]);
        setSearchTerm('');
        fetchLedger(student.id);
    };

    const handleAssignConcession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        setIsAssigningConcession(true);
        try {
            await financeService.grantConcession({
                studentId: selectedStudent.id,
                ...concessionData
            });
            toast.success('Concession assigned successfully');
            setIsConcessionModalOpen(false);
            setConcessionData({ feeDiscountId: '', academicYear: allocationData.academicYear, remarks: '' });
            fetchLedger(selectedStudent.id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign concession');
        } finally {
            setIsAssigningConcession(false);
        }
    };

    const handleRevokeConcession = async (id: string) => {
        if (!window.confirm("Are you sure you want to revoke this concession? This won't affect past fee records automatically.")) return;
        try {
            await financeService.revokeConcession(id);
            toast.success("Concession revoked");
            fetchLedger(selectedStudent!.id);
        } catch (error: any) {
            toast.error("Failed to revoke concession");
        }
    };

    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsAllocating(true);
        try {
            await financeService.allocateFees(
                selectedStudent.id,
                allocationData.offeringId,
                allocationData.academicYear
            );
            toast.success('Fees allocated successfully');
            setIsAllocateModalOpen(false);
            fetchLedger(selectedStudent.id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to allocate fees');
        } finally {
            setIsAllocating(false);
        }
    };

    const handleGenerateDemand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setIsGeneratingDemand(true);
        try {
            await financeService.createDemandNote({
                studentId: selectedStudent.id,
                academicYear: allocationData.academicYear,
                ...demandData,
                status: 'PENDING'
            });
            toast.success('Bill generated successfully');
            setIsDemandModalOpen(false);
            setDemandData({ billingMonth: '', feeHeadId: '', feeHeadName: '', amount: 0, dueDate: '', description: '' });
            fetchLedger(selectedStudent.id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate bill');
        } finally {
            setIsGeneratingDemand(false);
        }
    };

    const handlePayNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !selectedNote) return;

        setIsPaying(true);
        try {
            await financeService.collectPayment({
                studentId: selectedStudent.id,
                amount: payData.amount,
                paymentMode: payData.paymentMode,
                referenceNumber: payData.referenceNumber,
                feeRecordIds: [] // Priority logic in backend handles Demand Notes
            });
            toast.success('Payment collected successfully');
            setIsPayModalOpen(false);
            fetchLedger(selectedStudent.id);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment collection failed');
        } finally {
            setIsPaying(false);
        }
    };

    const openPayModal = (note: DemandNote) => {
        setSelectedNote(note);
        setPayData({
            amount: note.balance,
            paymentMode: 'CASH',
            referenceNumber: ''
        });
        setIsPayModalOpen(true);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PARTIAL': return 'bg-blue-100 text-blue-800';
            case 'UNPAID': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Fee Ledger</h1>
                    <p className="text-sm text-gray-500">View and manage student financial records</p>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search student by name or ID..."
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                    />

                    {/* Search Results Dropdown */}
                    {students.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {students.map((s: any) => (
                                <button
                                    key={s.id}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-0"
                                    onClick={() => selectStudent(s)}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                                        <p className="text-xs text-gray-500">ID: {s.admissionNo}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedStudent ? (
                <div className="space-y-6">
                    {/* Student Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex flex-wrap items-center gap-6 lg:gap-12 flex-1">
                            {/* Student Primary Info Block */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{activeOffering}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <IdCard className="w-3 h-3 text-indigo-400" />
                                            <span className="text-xs font-bold text-gray-700">{selectedStudent.admissionNo}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Smartphone className="w-3 h-3 text-indigo-400" />
                                            <span className="text-xs font-bold text-gray-700">{selectedStudent.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-12 w-px bg-gray-100 hidden sm:block" />

                            {/* Guardian Info Block */}
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> Guardian
                                </p>
                                <p className="text-sm font-black text-gray-900">{guardians[0]?.guardianName || 'N/A'}</p>
                                <p className="text-xs font-bold text-indigo-500">{guardians[0]?.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            {isAdmin && (
                                <>
                                    <button
                                        onClick={() => setIsConcessionModalOpen(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                                    >
                                        <Tag className="w-4 h-4" />
                                        Assign Concession
                                    </button>
                                    <button
                                        onClick={() => setIsDemandModalOpen(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Generate Bill
                                    </button>
                                    <button
                                        onClick={() => setIsAllocateModalOpen(true)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Calculator className="w-4 h-4" />
                                        Allocate Fees
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Ledger Table */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Fee Head Balances (Structural)</h3>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Total Liability</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Fee Head</th>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Due Date</th>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Paid</th>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Balance</th>
                                                <th className="px-6 py-3 text-left font-semibold tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading records...</td>
                                                </tr>
                                            ) : ledger.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                                        <HelpCircle className="w-8 h-8 text-gray-300" />
                                                        No fee records found for this student.
                                                    </td>
                                                </tr>
                                            ) : (
                                                ledger.map((record: any) => (
                                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{record.feeHeadName}</div>
                                                            <div className="text-xs text-gray-500">{record.academicYear}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(record.dueDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                            {format(record.amountDue)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                            {format(record.amountPaid)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                                                            {format(record.balance)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(record.status)}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Demand Notes / Monthly Bills */}
                        <div className="xl:col-span-1 space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        Monthly Bills
                                    </h3>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Demand Notes</span>
                                </div>
                                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                                    {demandNotes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 italic text-sm">
                                            No billing notes generated yet.
                                        </div>
                                    ) : (
                                        demandNotes.map((note: any) => (
                                            <div key={note.id} className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors bg-white shadow-sm ring-1 ring-gray-900/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{note.billingMonth}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{note.academicYear}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${note.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {note.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-600 line-clamp-1 italic">{note.description}</p>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold">
                                                            <Clock className="w-3 h-3" />
                                                            Due: {note.dueDate}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <p className="text-lg font-black text-indigo-600">{format(note.amount)}</p>
                                                        {note.status !== 'PAID' && (
                                                            <button
                                                                onClick={() => openPayModal(note)}
                                                                className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                                            >
                                                                Pay Note
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Applied Concessions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-amber-50/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-amber-600" />
                                        Active Concessions
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                                    {concessions.filter(c => c.status === 'ACTIVE').length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 italic text-sm">
                                            No active concessions.
                                        </div>
                                    ) : (
                                        concessions.filter(c => c.status === 'ACTIVE').map((con: any) => {
                                            const discount = feeDiscounts.find(d => d.id === con.feeDiscountId);
                                            return (
                                                <div key={con.id} className="p-4 border border-amber-100 rounded-xl bg-gradient-to-br from-amber-50/30 to-white shadow-sm ring-1 ring-amber-900/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{discount?.name || 'Unknown Discount'}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">{con.academicYear}</p>
                                                        </div>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                                            {discount?.type === 'PERCENTAGE' ? `${discount.value}% OFF` : `${format(discount?.value || 0)} OFF`}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-2">
                                                        <p className="text-xs text-gray-600 italic max-w-[70%] line-clamp-2">{con.remarks || 'No remarks provided'}</p>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleRevokeConcession(con.id!)}
                                                                className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                                            >
                                                                Revoke
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <Search className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Find a Student</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
                        Use the search bar above to look up a student by name or admission number to view their financial ledger.
                    </p>
                </div>
            )}

            {/* Fee Allocation Modal */}
            {isAllocateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-indigo-600" />
                                Allocate Fees
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Generate fee records based on offering structure.</p>
                        </div>

                        <form onSubmit={handleAllocate} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Academic Offering</label>
                                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium flex justify-between items-center">
                                    <span>{offerings.find((o: any) => o.id === allocationData.offeringId)?.name || 'Not Enrolled'}</span>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">Auto-detected</span>
                                </div>
                                <p className="text-[10px] text-gray-400 px-1 mt-1">Fee allocation is based on the student's current enrollment.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Academic Year</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <select 
                                        required 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                                        value={allocationData.academicYear} 
                                        onChange={e => setAllocationData({ ...allocationData, academicYear: e.target.value })}
                                    >
                                        <option value="">Select Academic Year...</option>
                                        {sessions.sort((a,b) => b.name.localeCompare(a.name)).map(s => (
                                            <option key={s.id} value={s.name}>
                                                {s.name} {s.isCurrent ? '(Current)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex gap-2">
                                <Clock className="w-6 h-6 shrink-0" />
                                <p>Allocation will generate all fee records defined in the structure for the chosen offering. Existing unpaid records will not be duplicated.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAllocateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAllocating || !allocationData.offeringId}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                                >
                                    {isAllocating ? 'Allocating...' : 'Generate Fees'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Demand Note (Bill) Generation Modal */}
            {isDemandModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-green-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-green-600" />
                                Generate Monthly Bill
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Create a demand note for the student for a specific period.</p>
                        </div>

                        <form onSubmit={handleGenerateDemand} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Fee Head</label>
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    required
                                    value={demandData.feeHeadId}
                                    onChange={e => {
                                        const head = ledger.find(l => l.feeHeadId === e.target.value);
                                        setDemandData({
                                            ...demandData,
                                            feeHeadId: e.target.value,
                                            feeHeadName: head?.feeHeadName || ''
                                        });
                                    }}
                                >
                                    <option value="">Select Fee Head</option>
                                    {ledger.map((record: any) => (
                                        <option
                                            key={record.feeHeadId}
                                            value={record.feeHeadId}
                                            disabled={record.balance <= 0}
                                        >
                                            {record.feeHeadName} (Bal: {format(record.balance)}){record.balance <= 0 ? ' - FULLY PAID' : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 px-1 mt-1">This bill will reduce the chosen fee head balance upon payment.</p>
                            </div>

                            <FloatingLabelInput
                                label="Billing Month(s)"
                                placeholder="e.g. January 2024"
                                required
                                value={demandData.billingMonth}
                                onChange={e => setDemandData({ ...demandData, billingMonth: e.target.value })}
                                icon={<Calendar className="w-4 h-4" />}
                            />

                            <FloatingLabelInput
                                label="Bill Amount"
                                type="number"
                                required
                                value={demandData.amount}
                                onChange={e => setDemandData({ ...demandData, amount: parseFloat(e.target.value) })}
                                icon={<span>{getCurrencySymbol(currencyCode)}</span>}
                            />

                            <FloatingLabelInput
                                label="Due Date"
                                type="date"
                                required
                                value={demandData.dueDate}
                                onChange={e => setDemandData({ ...demandData, dueDate: e.target.value })}
                                icon={<Clock className="w-4 h-4" />}
                            />

                            <FloatingLabelInput
                                label="Description / Remarks"
                                placeholder="Details about this month's fees"
                                value={demandData.description}
                                onChange={e => setDemandData({ ...demandData, description: e.target.value })}
                            />

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsDemandModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isGeneratingDemand}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                                >
                                    {isGeneratingDemand ? 'Generating...' : 'Confirm Generation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Note Modal */}
            {isPayModalOpen && selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>{getCurrencySymbol(currencyCode)}</span>
                                Pay Monthly Bill
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Collect payment for {selectedNote.billingMonth}</p>
                        </div>

                        <form onSubmit={handlePayNote} className="p-6 space-y-4">
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Balance</span>
                                    <span className="text-xs font-bold text-indigo-600 uppercase">{selectedNote.feeHeadName}</span>
                                </div>
                                <div className="text-2xl font-black text-gray-900">{format(selectedNote.balance)}</div>
                            </div>

                            <FloatingLabelInput
                                label="Amount to Pay"
                                type="number"
                                required
                                value={payData.amount}
                                onChange={e => setPayData({ ...payData, amount: parseFloat(e.target.value) })}
                                icon={<span>{getCurrencySymbol(currencyCode)}</span>}
                            />

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER'].map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setPayData({ ...payData, paymentMode: mode as any })}
                                            className={`py-2 px-1 text-[10px] font-black rounded-lg border transition-all ${payData.paymentMode === mode
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {mode.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {payData.paymentMode !== 'CASH' && (
                                <FloatingLabelInput
                                    label="Ref Number / Tx ID"
                                    required
                                    value={payData.referenceNumber}
                                    onChange={e => setPayData({ ...payData, referenceNumber: e.target.value })}
                                />
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsPayModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPaying || payData.amount <= 0}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
                                >
                                    {isPaying ? 'Processing...' : 'Collect Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Concession Modal */}
            {isConcessionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-amber-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-600" />
                                Assign Fee Concession
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Apply a discount rule to this student. The discount will be applied during the next fee allocation.</p>
                        </div>

                        <form onSubmit={handleAssignConcession} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Discount Rule</label>
                                <select
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                    value={concessionData.feeDiscountId}
                                    onChange={e => setConcessionData({ ...concessionData, feeDiscountId: e.target.value })}
                                >
                                    <option value="">Select Discount</option>
                                    {feeDiscounts.map((discount: any) => (
                                        <option key={discount.id} value={discount.id}>
                                            {discount.name} ({discount.type === 'PERCENTAGE' ? `${discount.value}%` : `₹${discount.value}`}) - {discount.scope}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase px-1">Academic Year</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <select 
                                        required 
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none appearance-none"
                                        value={concessionData.academicYear} 
                                        onChange={e => setConcessionData({ ...concessionData, academicYear: e.target.value })}
                                    >
                                        <option value="">Select Academic Year...</option>
                                        {sessions.sort((a,b) => b.name.localeCompare(a.name)).map(s => (
                                            <option key={s.id} value={s.name}>
                                                {s.name} {s.isCurrent ? '(Current)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <FloatingLabelInput
                                label="Remarks / Reason"
                                placeholder="Why is this concession applied?"
                                value={concessionData.remarks}
                                onChange={e => setConcessionData({ ...concessionData, remarks: e.target.value })}
                            />

                            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800 flex gap-2">
                                <HelpCircle className="w-5 h-5 shrink-0" />
                                <p>Concessions automatically adjust the due amount for applicable fee heads when "Allocate Fees" or "Bulk Fee Allocation" is run.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsConcessionModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAssigningConcession || !concessionData.feeDiscountId}
                                    className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
                                >
                                    {isAssigningConcession ? 'Assigning...' : 'Assign Concession'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentLedgerPage;

