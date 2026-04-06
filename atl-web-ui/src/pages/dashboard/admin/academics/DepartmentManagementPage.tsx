import React, { useEffect, useState } from 'react';
import { Plus, Building2, Trash2, Loader2 } from 'lucide-react';
import { academicService, type Department } from '../../../../api/academicService';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import toast from 'react-hot-toast';
import PageHeader from '../../../../components/common/PageHeader';

const DepartmentManagementPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '', headOfDepartment: '' });
    const [busyId, setBusyId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const res = await academicService.getDepartments();
            if (res.status === 'SUCCESS') {
                setDepartments(res.apiData || []);
            }
        } catch (error) {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!tenantId) {
                toast.error("Tenant ID missing");
                setIsSubmitting(false);
                return;
            }
            await academicService.createDepartment({
                ...newDept,
                tenantId,
                code: newDept.name.toUpperCase().replace(/\s+/g, '-')
            });
            toast.success('Department created');
            setIsModalOpen(false);
            setNewDept({ name: '', description: '', headOfDepartment: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to create department');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setBusyId(id);
        try {
            await academicService.deleteDepartment(id);
            toast.success('Department deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete department');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Departments"
                description="Manage academic departments and faculties"
                actions={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </button>
                }
            />

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <button
                                    onClick={() => handleDelete(dept.id)}
                                    disabled={busyId === dept.id}
                                    className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-100"
                                >
                                    {busyId === dept.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{dept.description || 'No description'}</p>

                            <div className="border-t pt-4">
                                <div className="text-xs text-gray-400 uppercase font-semibold mb-2">Details</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Head:</span>
                                        <span className="font-medium">{dept.headOfDepartment || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Programs:</span>
                                        <span className="font-medium bg-gray-100 px-2 rounded-full text-xs">
                                            {dept.programIds?.length || 0} Linked
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">Add New Department</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newDept.name}
                                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newDept.headOfDepartment}
                                    onChange={e => setNewDept({ ...newDept, headOfDepartment: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newDept.description}
                                    onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Department
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagementPage;
