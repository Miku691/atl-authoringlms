import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Check } from 'lucide-react';
import { studentService, type BulkAdmissionRequest } from '../../../../../api/studentService';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../../store/store';
import toast from 'react-hot-toast';

const BulkAdmissionPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [jsonInput, setJsonInput] = useState('');
    const [previewData, setPreviewData] = useState<BulkAdmissionRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const handleParse = () => {
        try {
            const data = JSON.parse(jsonInput);
            if (Array.isArray(data)) {
                setPreviewData(data);
                toast.success(`Parsed ${data.length} records`);
            } else {
                toast.error('Input must be a JSON array');
            }
        } catch (e) {
            toast.error('Invalid JSON format');
        }
    };

    const handleSubmit = async () => {
        if (!user?.tenantId) return toast.error("Tenant ID missing");
        setLoading(true);
        try {
            const res = await studentService.executeBulkAdmission(user.tenantId, previewData);
            if (res.status === 'SUCCESS') {
                toast.success('Bulk admission completed successfully!');
                setPreviewData([]);
                setJsonInput('');
            } else {
                toast.error(res.message || 'Failed to process');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-content-primary">Bulk Admission</h1>
            <p className="text-content-secondary">Upload JSON data to admit multiple students at once.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-content-primary mb-2">Paste JSON Data</label>
                        <textarea
                            className="w-full h-64 border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder='[{"firstName": "John", "lastName": "Doe", "admissionNo": "A001", "offeringId": "UUID"}]'
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleParse}
                        className="w-full bg-chrome text-content-primary py-2 rounded-lg hover:bg-chrome transition"
                    >
                        Preview Data
                    </button>
                </div>

                {/* Preview Section */}
                <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        Preview ({previewData.length} Records)
                    </h3>

                    <div className="h-64 overflow-y-auto border rounded-lg bg-chrome p-2">
                        {previewData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-content-muted">
                                <Upload className="w-8 h-8 mb-2" />
                                <p>No data to preview</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-content-secondary uppercase bg-chrome sticky top-0">
                                    <tr>
                                        <th className="px-2 py-1">Name</th>
                                        <th className="px-2 py-1">Adm No</th>
                                        <th className="px-2 py-1">Offering</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-chrome">
                                            <td className="px-2 py-1 font-medium">{row.firstName} {row.lastName}</td>
                                            <td className="px-2 py-1">{row.admissionNo}</td>
                                            <td className="px-2 py-1 font-mono text-xs">{row.offeringId?.substring(0, 8)}...</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || previewData.length === 0}
                        className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg text-white transition ${loading || previewData.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {loading ? 'Processing...' : <><Check className="w-4 h-4" /> Confirm Admission</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkAdmissionPage;
