
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { academicService, type GradingScale } from '../../../../api/academicService';
import {
    Plus,
    Trash2,
    Edit2,
    Percent,
    Award,
    Save,
    X,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';


const GradingConfigPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [scales, setScales] = useState<GradingScale[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scaleToDelete, setScaleToDelete] = useState<GradingScale | null>(null);
    const [editingScale, setEditingScale] = useState<Partial<GradingScale> | null>(null);

    useEffect(() => {
        fetchScales();
    }, [user?.tenantId]);

    const fetchScales = async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            const response = await academicService.getGradingScales(user.tenantId);
            setScales(response.apiData || []);
        } catch (error) {
            console.error("Failed to fetch grading scales", error);
            toast.error("Failed to load grading scales");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingScale({
            gradeLabel: '',
            minPercentage: 0,
            maxPercentage: 100,
            gradePoint: 0.0,
            description: '',
            tenantId: user?.tenantId || ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (scale: GradingScale) => {
        setEditingScale(scale);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingScale || !user?.tenantId) return;

        setIsSaving(true);
        try {
            if (editingScale.id) {
                await academicService.updateGradingScale(user.tenantId, editingScale.id, editingScale as GradingScale);
                toast.success("Grading scale updated");
            } else {
                await academicService.createGradingScale(user.tenantId, { ...editingScale, tenantId: user.tenantId } as GradingScale);
                toast.success("Grading scale created");
            }
            setIsModalOpen(false);
            fetchScales();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save grading scale");
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = (scale: GradingScale) => {
        setScaleToDelete(scale);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!scaleToDelete) return;
        setIsDeleting(true);
        try {
            if (user?.tenantId) {
                await academicService.deleteGradingScale(user.tenantId, scaleToDelete.id!);
                toast.success("Grading scale removed");
                setDeleteModalOpen(false);
                fetchScales();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-8 h-8 text-indigo-600" />
                        Grading Configuration
                    </h1>
                    <p className="text-gray-500">Define your institute's grading scales and performance standards</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Grade Level
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade Label</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentage Range</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Grade Points</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                                        Loading configurations...
                                    </td>
                                </tr>
                            ) : scales.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <Award className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p>No grading scales defined yet. Define them to start evaluating students.</p>
                                    </td>
                                </tr>
                            ) : (
                                [...scales].sort((a, b) => b.minPercentage - a.minPercentage).map((scale) => (
                                    <tr key={scale.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 text-lg">
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                                                {scale.gradeLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-700">{scale.minPercentage}% - {scale.maxPercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-900 font-bold text-lg">{scale.gradePoint.toFixed(1)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {scale.description || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(scale)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(scale)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && editingScale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingScale.id ? 'Edit Grade Level' : 'Add New Grade Level'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grade Label (e.g. A+, Excellent)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="e.g. A+"
                                        value={editingScale.gradeLabel || ''}
                                        onChange={(e) => setEditingScale({ ...editingScale, gradeLabel: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Percentage (%)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={editingScale.minPercentage || 0}
                                        onChange={(e) => setEditingScale({ ...editingScale, minPercentage: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Percentage (%)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={editingScale.maxPercentage || 100}
                                        onChange={(e) => setEditingScale({ ...editingScale, maxPercentage: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grade Points (e.g. 4.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        value={editingScale.gradePoint || 0}
                                        onChange={(e) => setEditingScale({ ...editingScale, gradePoint: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Brief description for this grade level..."
                                        value={editingScale.description || ''}
                                        onChange={(e) => setEditingScale({ ...editingScale, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-md font-semibold"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Config
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Remove Grade Level"
                message={`Are you sure you want to remove the grade "${scaleToDelete?.gradeLabel}"? This might affect existing evaluations.`}
                confirmText="Remove"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default GradingConfigPage;
