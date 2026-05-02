import React, { useState, useEffect } from 'react';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import { X, Upload, FileText, Trash2, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

interface StudentDocument {
    id: string;
    documentType: string;
    fileUrl: string;
    uploadedAt: string;
}

interface StudentDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string | null;
    studentName: string;
}

const StudentDocumentsModal: React.FC<StudentDocumentsModalProps> = ({
    isOpen,
    onClose,
    studentId,
    studentName
}) => {
    const [documents, setDocuments] = useState<StudentDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState('OTHER');

    // Delete State
    const [docToDelete, setDocToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && studentId) {
            fetchDocuments();
        }
    }, [isOpen, studentId]);

    const fetchDocuments = async () => {
        if (!studentId) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/ims-student-service/student-documents/student/${studentId}`);
            if (response.data.status === 'SUCCESS') {
                setDocuments(response.data.apiData);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !studentId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('studentId', studentId);
        formData.append('documentType', documentType);

        try {
            const response = await api.post('/ims-student-service/student-documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'SUCCESS') {
                toast.success('Document uploaded successfully');
                setSelectedFile(null);
                setDocumentType('OTHER');
                fetchDocuments(); // Refresh list
            }
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await api.delete(`/ims-student-service/student-documents/${id}`);
            if (response.data.status === 'SUCCESS') {
                toast.success('Document deleted');
                setDocuments(documents.filter(d => d.id !== id));
                setDocToDelete(null);
            }
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    if (!isOpen) return null;

    return (
        <>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <span>
                    Documents: <span className="text-indigo-600">{studentName}</span>
                </span>
            }
            maxWidth="3xl"
        >
            <div className="p-6">
                {/* Upload Section */}
                <div className="mb-8 bg-chrome p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-medium text-content-primary mb-3 flex items-center">
                        <Upload className="w-4 h-4 mr-2" /> Upload New Document
                    </h4>
                    <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-content-secondary mb-1">Document Type</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="block w-full text-sm border border-border bg-surface text-content-primary p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="AADHAAR_CARD">Aadhaar Card</option>
                                <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                                <option value="TRANSFER_CERTIFICATE">Transfer Certificate</option>
                                <option value="PROFILE_IMAGE">Profile Image</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-content-secondary mb-1">File</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-content-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedFile || isUploading}
                            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                        </button>
                    </form>
                </div>

                {/* Documents List */}
                <div>
                    <h4 className="text-sm font-medium text-content-primary mb-3">Uploaded Documents</h4>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-content-secondary border-2 border-dashed border-border rounded-lg">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-content-muted" />
                            <p>No documents uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border border-border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow bg-surface">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                            {doc.documentType === 'PROFILE_IMAGE' ? (
                                                <ImageIcon className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setDocToDelete(doc.id)}
                                            className="text-content-muted hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-content-primary truncate" title={doc.documentType}>
                                            {doc.documentType.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-content-secondary mt-1">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border flex justify-end">
                                        <a
                                            href={doc.fileUrl} // Note: This might need processing if it's a local path
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                        >
                                            <Download className="w-3 h-3 mr-1" /> Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!docToDelete}
                onClose={() => setDocToDelete(null)}
                onConfirm={() => docToDelete && handleDelete(docToDelete)}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
};

export default StudentDocumentsModal;
