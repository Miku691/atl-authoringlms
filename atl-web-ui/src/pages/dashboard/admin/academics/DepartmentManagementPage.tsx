import React, { useEffect, useState } from 'react';
import { Plus, Building2, Trash2, Loader2 } from 'lucide-react';
import { academicService, type Department } from '../../../../api/academicService';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import toast from 'react-hot-toast';
import PageHeader from '../../../../components/common/PageHeader';
import Modal from '../../../../components/common/Modal';

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
                        <div key={dept.id} className="bg-surface p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Building2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <button
                                    onClick={() => handleDelete(dept.id)}
                                    disabled={busyId === dept.id}
                                    className="p-1 text-content-muted hover:text-red-500 transition disabled:opacity-100"
                                >
                                    {busyId === dept.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-content-primary">{dept.name}</h3>
                            <p className="text-sm text-content-secondary mb-4">{dept.description || 'No description'}</p>

                            <div className="border-t pt-4">
                                <div className="text-xs text-content-muted uppercase font-semibold mb-2">Details</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-content-secondary">Head:</span>
                                        <span className="font-medium">{dept.headOfDepartment || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-content-secondary">Programs:</span>
                                        <span className="font-medium bg-chrome px-2 rounded-full text-xs">
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
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Department"
                icon={<Building2 size={18} />}
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            className="modal-btn-secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="dept-form"
                            disabled={isSubmitting}
                            className="modal-btn-primary"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Department
                        </button>
                    </>
                }
            >
                <form id="dept-form" onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                        <input
                            required
                            type="text"
                            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            value={newDept.name}
                            onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Head of Department</label>
                        <input
                            type="text"
                            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            value={newDept.headOfDepartment}
                            onChange={e => setNewDept({ ...newDept, headOfDepartment: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <textarea
                            className="w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 resize-none"
                            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                            rows={3}
                            value={newDept.description}
                            onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DepartmentManagementPage;
