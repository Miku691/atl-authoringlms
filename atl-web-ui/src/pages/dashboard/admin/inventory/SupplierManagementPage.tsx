import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, Search, Edit2, Save, X, Truck, Phone, Mail, MapPin, Globe
} from 'lucide-react';
import { inventoryService } from '../../../../api/inventoryService';
import type { Supplier } from '../../../../types/inventory';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const SupplierManagementPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setIsLoading(true);
            const data = await inventoryService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.name) {
                toast.error('Supplier name is required');
                return;
            }

            if (editingSupplier) {
                await inventoryService.updateSupplier(editingSupplier.id, formData as Supplier);
                toast.success('Supplier updated successfully');
            } else {
                await inventoryService.createSupplier(formData as Supplier);
                toast.success('Supplier added successfully');
            }

            closeModal();
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to save supplier');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await inventoryService.deleteSupplier(id);
            toast.success('Supplier deleted');
            setDeleteConfirmId(null);
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
        }
    };

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({ ...supplier });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                website: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-chrome/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Supplier Management</h1>
                    <p className="text-sm text-content-secondary mt-1">Manage vendor contacts and information</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-4 rounded-xl shadow-sm border border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
                    <input
                        type="text"
                        placeholder="Search by supplier name, contact person or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 text-center text-content-secondary">Loading suppliers...</div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-content-secondary italic">No suppliers found.</div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-5 border-b border-border bg-chrome/30 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-content-primary line-clamp-1">{supplier.name}</h3>
                                        <p className="text-xs text-content-secondary">{supplier.contactPerson || 'No contact person'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openModal(supplier)}
                                        className="p-1.5 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirmId(supplier.id)}
                                        className="p-1.5 text-content-muted hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-content-secondary">
                                    <Phone size={14} className="text-content-muted" />
                                    <span>{supplier.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-content-secondary">
                                    <Mail size={14} className="text-content-muted" />
                                    <span className="truncate">{supplier.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-content-secondary">
                                    <MapPin size={14} className="text-content-muted mt-1 flex-shrink-0" />
                                    <span className="line-clamp-2">{supplier.address || 'N/A'}</span>
                                </div>
                                {supplier.website && (
                                    <div className="flex items-center gap-3 text-sm text-indigo-600">
                                        <Globe size={14} />
                                        <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                            {supplier.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-semibold text-content-primary bg-surface border border-border rounded-xl hover:bg-chrome transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="supplier-form"
                            className="flex items-center px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                        </button>
                    </>
                }
            >
                <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div>
                        <label className="block text-sm font-semibold text-content-primary mb-1">Supplier Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Enter company or individual name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Contact Person</label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-content-primary mb-1">Website</label>
                            <input
                                type="text"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="www.example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-content-primary mb-1">Office Address</label>
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        />
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirmId}
                onClose={() => setDeleteConfirmId(null)}
                title="Confirm Supplier Deletion"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-2xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                            className="px-5 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={16} />
                            <span>Delete Supplier</span>
                        </button>
                    </>
                }
            >
                <div className="py-4 text-content-secondary flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-content-primary mb-1">Are you sure you want to delete this supplier?</p>
                        <p className="text-xs text-content-muted">This action cannot be undone and will permanently remove vendor contact records.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierManagementPage;
