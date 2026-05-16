import React, { useState, useEffect } from 'react';
import { 
    Upload, 
    FileSpreadsheet, 
    Check, 
    Download, 
    AlertCircle, 
    Info, 
    ChevronDown, 
    ChevronUp,
    Search,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { studentService, type BulkAdmissionRequest } from '../../../../../api/studentService';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../../../../../store/store';
import toast from 'react-hot-toast';
import SubscriptionLockedOverlay from '../../components/SubscriptionLockedOverlay';
import api from '../../../../../utils/api';
import * as XLSX from 'xlsx';
import PageHeader from '../../../../../components/common/PageHeader';

interface OfferingLookup {
    id: string;
    name: string;
    programName: string;
    levelName: string;
}

const BulkAdmissionPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    
    const [previewData, setPreviewData] = useState<BulkAdmissionRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [subLimits, setSubLimits] = useState<{ planName: string; maxStudents: number; currentStudents: number } | null>(null);
    const [isCheckingLimits, setIsCheckingLimits] = useState(true);
    const [offerings, setOfferings] = useState<OfferingLookup[]>([]);
    const [showOfferingLookup, setShowOfferingLookup] = useState(false);
    const [offeringSearch, setOfferingSearch] = useState('');

    useEffect(() => {
        if (user?.tenantId) {
            checkLimits();
            fetchOfferings();
        }
    }, [user?.tenantId]);

    const checkLimits = async () => {
        try {
            setIsCheckingLimits(true);
            const [subRes, statsRes] = await Promise.all([
                api.get(`/ims-platform-service/api/v1/platform/tenant/${user?.tenantId}/subscription`),
                api.get(`/ims-platform-service/api/v1/platform/tenant/stats/${user?.tenantId}`)
            ]);

            const subData = subRes.data.apiData || subRes.data;
            const statsData = statsRes.data.apiData || statsRes.data;

            setSubLimits({
                planName: subData.planName,
                maxStudents: subData.maxStudents,
                currentStudents: statsData.studentCount
            });
        } catch (error) {
            console.error("Failed to check subscription limits", error);
        } finally {
            setIsCheckingLimits(false);
        }
    };

    const fetchOfferings = async () => {
        try {
            const res = await api.get(`/ims-academic-service/offerings/tenant/${user?.tenantId}`);
            if (res.data?.status === 'SUCCESS') {
                setOfferings(res.data.apiData || []);
            }
        } catch (error) {
            console.error("Failed to fetch offerings", error);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            ['First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'DOB (YYYY-MM-DD)', 'Admission No', 'Offering ID']
        ];
        const sampleData = [
            ['John', 'Doe', 'john.doe@example.com', '9876543210', 'Male', '2010-05-15', 'ADM2024001', offerings[0]?.id || 'COPY_ID_FROM_LOOKUP']
        ];
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
        
        // Add column widths
        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 40 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Bulk Admission Template');
        XLSX.writeFile(wb, 'EduFlow_Bulk_Admission_Template.xlsx');
        toast.success('Template downloaded successfully');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const mappedData: BulkAdmissionRequest[] = data.map(row => ({
                    firstName: row['First Name']?.toString() || '',
                    lastName: row['Last Name']?.toString() || '',
                    email: row['Email']?.toString() || '',
                    phone: row['Phone']?.toString() || '',
                    gender: row['Gender']?.toString() || '',
                    dob: row['DOB (YYYY-MM-DD)']?.toString() || '',
                    admissionNo: row['Admission No']?.toString() || '',
                    offeringId: row['Offering ID']?.toString() || ''
                })).filter(s => s.firstName && s.lastName);

                if (mappedData.length === 0) {
                    toast.error('No valid records found in the file');
                } else {
                    setPreviewData(mappedData);
                    toast.success(`Successfully loaded ${mappedData.length} records`);
                }
            } catch (error) {
                console.error("Error parsing file", error);
                toast.error('Failed to parse Excel file. Please use the provided template.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = async () => {
        if (!user?.tenantId) return toast.error("Tenant ID missing");
        if (previewData.length === 0) return toast.error("No data to submit");

        // Validate offering IDs
        const invalidRecords = previewData.filter(s => !s.offeringId || s.offeringId.length < 30);
        if (invalidRecords.length > 0) {
            toast.error(`${invalidRecords.length} records have missing or invalid Offering IDs`);
            return;
        }

        setLoading(true);
        try {
            const res = await studentService.executeBulkAdmission(user.tenantId, previewData);
            if (res.status === 'SUCCESS') {
                toast.success('Bulk admission completed successfully!');
                navigate('/people/students/all');
            } else {
                toast.error(res.message || 'Failed to process bulk admission');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Server error during bulk admission';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredOfferings = offerings.filter(o => 
        o.name?.toLowerCase().includes(offeringSearch.toLowerCase()) || 
        o.programName?.toLowerCase().includes(offeringSearch.toLowerCase())
    );

    return (
        <div className="space-y-6 relative pb-20">
            {isCheckingLimits ? (
                <div className="fixed inset-0 z-[100] bg-surface/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                </div>
            ) : subLimits && subLimits.maxStudents > 0 && subLimits.currentStudents >= subLimits.maxStudents ? (
                <SubscriptionLockedOverlay
                    planName={subLimits.planName}
                    reason="STUDENT_LIMIT"
                    currentCount={subLimits.currentStudents}
                    maxLimit={subLimits.maxStudents}
                />
            ) : null}

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-chrome rounded-lg transition-colors text-content-secondary"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <PageHeader 
                    title="Bulk Admission" 
                    description="Upload multiple student records at once using an Excel spreadsheet." 
                    icon={FileSpreadsheet}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Instructions & Upload */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm">
                        <h3 className="text-lg font-bold text-content-primary mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-500" />
                            Instructions
                        </h3>
                        <ul className="space-y-3 text-sm text-content-secondary">
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                Download the official template below.
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                Fill in student details. Offering ID is mandatory.
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                Upload the file and preview the data.
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                Review carefully and click 'Confirm Admission'.
                            </li>
                        </ul>

                        <button
                            onClick={downloadTemplate}
                            className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-chrome text-content-primary rounded-2xl font-bold border border-border hover:bg-chrome transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Download Template
                        </button>
                    </div>

                    {/* Offering Lookup */}
                    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setShowOfferingLookup(!showOfferingLookup)}
                            className="w-full p-6 flex items-center justify-between hover:bg-chrome/50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-emerald-500" />
                                <h3 className="text-lg font-bold text-content-primary">Find Offering IDs</h3>
                            </div>
                            {showOfferingLookup ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        {showOfferingLookup && (
                            <div className="p-6 pt-0 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                                    <input 
                                        type="text"
                                        placeholder="Search by Class/Batch..."
                                        className="w-full pl-10 pr-4 py-2 bg-chrome border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={offeringSearch}
                                        onChange={(e) => setOfferingSearch(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                                    {filteredOfferings.map(o => (
                                        <div key={o.id} className="p-3 bg-chrome rounded-xl border border-border text-xs group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-content-primary">{o.name}</span>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(o.id);
                                                        toast.success('ID copied!');
                                                    }}
                                                    className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Copy ID
                                                </button>
                                            </div>
                                            <p className="text-content-muted truncate">{o.programName} • {o.levelName}</p>
                                            <p className="mt-1 font-mono text-[10px] text-indigo-400 truncate">{o.id}</p>
                                        </div>
                                    ))}
                                    {filteredOfferings.length === 0 && (
                                        <p className="text-center py-4 text-content-muted text-sm italic">No offerings found</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Upload & Preview */}
                <div className="xl:col-span-2 space-y-6">
                    {/* File Dropzone */}
                    <div className="bg-surface p-8 rounded-3xl border-2 border-dashed border-border hover:border-indigo-400 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h4 className="text-xl font-bold text-content-primary mb-1">Upload Enrollment Data</h4>
                        <p className="text-content-secondary max-w-sm">Drag and drop your filled Excel file here, or click to browse files.</p>
                    </div>

                    {/* Preview Table */}
                    {previewData.length > 0 && (
                        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden animate-slide-up">
                            <div className="p-6 border-b border-border flex items-center justify-between bg-chrome/30">
                                <h3 className="font-bold text-content-primary flex items-center gap-2">
                                    <Check className="w-5 h-5 text-emerald-500" />
                                    Data Preview ({previewData.length} Records)
                                </h3>
                                <button 
                                    onClick={() => setPreviewData([])}
                                    className="text-xs font-bold text-red-500 hover:underline"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-chrome/50 text-content-secondary text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Student Name</th>
                                            <th className="px-6 py-4 font-bold">Contact</th>
                                            <th className="px-6 py-4 font-bold">Admission No</th>
                                            <th className="px-6 py-4 font-bold">Offering ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="hover:bg-chrome/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-content-primary">{row.firstName} {row.lastName}</div>
                                                    <div className="text-[10px] text-content-muted">{row.gender} • {row.dob}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-content-primary">{row.email || '—'}</div>
                                                    <div className="text-xs text-content-muted">{row.phone || '—'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{row.admissionNo || 'Auto-generated'}</td>
                                                <td className="px-6 py-4">
                                                    <div className={`font-mono text-xs p-1 rounded inline-block ${!row.offeringId ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {row.offeringId ? row.offeringId.substring(0, 16) + '...' : 'Missing ID'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-chrome/10 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-content-muted text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Review data carefully before confirming.
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Check className="w-5 h-5" /> Confirm Admission</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkAdmissionPage;
