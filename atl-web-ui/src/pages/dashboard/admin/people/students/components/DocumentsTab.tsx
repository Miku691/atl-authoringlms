import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Eye,
    Download,
    Loader2,
    FileCheck2,
    AlertCircle,
    X,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { documentService, type StudentDocument } from '../../../../../../api/documentService';
import toast from 'react-hot-toast';

interface Props {
    studentId: string;
}

const DocumentsTab: React.FC<Props> = ({ studentId }) => {
    const [docs, setDocs] = useState<StudentDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [masterTypes, setMasterTypes] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocs();
        fetchMasterTypes();
    }, [studentId]);

    const fetchMasterTypes = async () => {
        try {
            const res = await documentService.getMasterDocumentTypes();
            if (res.status === 'SUCCESS') {
                setMasterTypes(res.apiData);
                if (res.apiData.length > 0) setSelectedType(res.apiData[0].code);
            }
        } catch (error) {
            console.error("Failed to load master types", error);
        }
    };

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await documentService.getStudentDocuments(studentId);
            if (res.data.status === 'SUCCESS') setDocs(res.data.apiData);
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        try {
            await documentService.uploadDocument(studentId, selectedType, selectedFile);
            toast.success("Document uploaded successfully");
            setShowUploadModal(false);
            setSelectedFile(null);
            fetchDocs();
        } catch (error) {
            toast.error("Failed to upload document");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await documentService.deleteDocument(id);
            toast.success("Document deleted");
            fetchDocs();
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'REJECTED': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    if (loading) return (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-content-secondary font-medium font-outfit">Retrieving files from secure vault...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-black text-content-primary flex items-center gap-3 font-outfit uppercase tracking-tight">
                            <FileText className="w-6 h-6 text-indigo-600" /> Document Repository
                        </h3>
                        <p className="text-sm text-content-secondary mt-1 font-medium">Compliance and historical records</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-indigo-600/20 dark:shadow-none hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <Upload className="w-4 h-4" /> Upload Record
                    </button>
                </div>

                {docs.length === 0 ? (
                    <div className="text-center py-16 bg-chrome/50 rounded-3xl border-2 border-dashed border-border cursor-pointer hover:border-indigo-300 transition-colors group" onClick={() => setShowUploadModal(true)}>
                        <div className="w-16 h-16 bg-surface rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-300 group-hover:text-indigo-500" />
                        </div>
                        <h4 className="text-content-primary font-black mb-1 font-outfit">No Documents Found</h4>
                        <p className="text-xs text-content-muted font-medium">Click here to upload the first document</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {docs.map(doc => (
                            <div key={doc.id} className="group relative bg-surface border border-border rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xl transition-all animate-fade-in">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-500/20">
                                            <FileCheck2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-content-primary text-sm font-outfit uppercase leading-tight">
                                                {masterTypes.find(t => t.code === doc.documentType)?.label || doc.documentType.replace('_', ' ')}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {getStatusIcon(doc.verificationStatus)}
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-content-muted">
                                                    {doc.verificationStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex gap-1">
                                        <a
                                            href={documentService.getViewUrl(doc.id)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-content-muted hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-all"
                                            title="View Online"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <a
                                            href={documentService.getViewUrl(doc.id)}
                                            download
                                            className="p-2 text-content-muted hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-all"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="System Wipe"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 bg-chrome border-b flex items-center justify-between">
                            <h4 className="font-black text-content-primary font-outfit uppercase tracking-tight">Record Onboarding</h4>
                            <button onClick={() => setShowUploadModal(false)} className="text-content-muted hover:text-content-secondary">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpload} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-content-muted uppercase tracking-widest mb-2 ml-1">Document Category</label>
                                <select
                                    className="w-full px-4 py-3 bg-chrome border border-border rounded-2xl text-sm font-bold text-content-primary focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    {masterTypes.map(t => <option key={t.id} value={t.code}>{t.label}</option>)}
                                </select>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-chrome/50 hover:border-indigo-500/30'
                                    }`}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />
                                <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mb-3 ${selectedFile ? 'bg-surface text-emerald-600' : 'bg-surface text-content-muted'
                                    }`}>
                                    {selectedFile ? <FileCheck2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                </div>
                                <p className="text-sm font-black text-content-primary font-outfit">
                                    {selectedFile ? selectedFile.name : 'Select Data Object'}
                                </p>
                                <p className="text-[10px] text-content-muted uppercase font-black tracking-tighter mt-1">
                                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, JPG, PNG (Max 5MB)'}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Sync to Repository
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsTab;
