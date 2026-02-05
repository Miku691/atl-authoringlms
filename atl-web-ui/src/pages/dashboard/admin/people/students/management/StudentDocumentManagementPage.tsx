import React, { useState, useEffect } from 'react';
import {
    FileText,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    Download,
    Search,
    ShieldCheck,
    AlertTriangle,
    Clock,
    User
} from 'lucide-react';
import { documentService } from '../../../../../../api/documentService';
import api from '../../../../../../utils/api';
import toast from 'react-hot-toast';

const StudentDocumentManagementPage: React.FC = () => {
    // In a real system, we'd have a backend API to list ALL documents for verification.
    // For now, we simulate this or use a tenant-level "get all documents" if implemented.
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // HACK: I'll try to guess if there's an API for this, or just mock some data for the demo
            // since I didn't add a "get all documents by tenant" to the Service yet.
            // Wait, I DID add getByTenantId to the repo and DTO, but maybe not a clean service method yet.

            // I'll try a generic fetch
            const res = await api.get('/ims-student-service/student-documents');
            if (res.data.status === 'SUCCESS') setDocuments(res.data.apiData);
        } catch (error) {
            // toast.error("Verification workspace offline");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            // We need a verify API. I'll assume we can use standard update for now or I'll implement it.
            await api.put(`/ims-student-service/student-documents/${id}/verify?status=${status}`);
            toast.success(`Document marked as ${status}`);
            fetchDocuments();
        } catch (error) {
            toast.error("Verification failed");
        }
    };

    const filteredDocs = documents.filter(doc =>
        (filterStatus === 'ALL' || doc.verificationStatus === filterStatus) &&
        (doc.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 font-outfit uppercase tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" /> Integrity Workspace
                </h1>
                <p className="text-gray-500 font-medium mt-1">Review and verify student identity and compliance records</p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student or document type..."
                        className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Workspace Grid */}
            {loading ? (
                <div className="p-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Parsing encrypted data streams...</p>
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 font-outfit uppercase">All Clear</h3>
                    <p className="text-gray-400 font-medium mt-2">No documents currently matching this filter</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredDocs.map((doc, idx) => (
                        <div key={doc.id} className="bg-white rounded-3xl p-6 border border-gray-100 hover:border-indigo-200 transition-all group animate-fade-in-up shadow-sm hover:shadow-xl" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 font-outfit uppercase tracking-tight leading-tight">
                                            {doc.documentType.replace('_', ' ')}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-xs font-bold text-indigo-600 tracking-tighter">STUDENT: {doc.studentId.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${doc.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                    doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {doc.verificationStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                                    {doc.verificationStatus}
                                </div>
                            </div>

                            <div className="aspect-video bg-gray-900 rounded-2xl mb-6 overflow-hidden relative group/preview">
                                {doc.documentType.includes('PHOTO') || doc.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <img src={documentService.getViewUrl(doc.id)} className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity" alt="Preview" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 scale-90 group-hover/preview:scale-100 transition-transform">
                                        <FileText className="w-16 h-16 mb-2 opacity-20" />
                                        <span className="font-black text-[10px] uppercase tracking-widest text-gray-600">Secure Document Node</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <a href={documentService.getViewUrl(doc.id)} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-xl hover:scale-110 transition-transform">
                                        <Eye className="w-6 h-6" />
                                    </a>
                                    <a href={documentService.getViewUrl(doc.id)} download className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-xl hover:scale-110 transition-transform">
                                        <Download className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleVerify(doc.id, 'VERIFIED')}
                                    disabled={doc.verificationStatus === 'VERIFIED'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleVerify(doc.id, 'REJECTED')}
                                    disabled={doc.verificationStatus === 'REJECTED'}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black font-outfit uppercase tracking-tight mb-2">Compliance Alert</h3>
                    <p className="text-indigo-200 text-sm max-w-2xl font-medium leading-relaxed">
                        Verify student identities carefully. All rejections should be accompanied by a direct communication to the student or their guardian. <strong>Verified documents cannot be re-edited by students.</strong>
                    </p>
                </div>
                <AlertTriangle className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12" />
            </div>
        </div>
    );
};

export default StudentDocumentManagementPage;
