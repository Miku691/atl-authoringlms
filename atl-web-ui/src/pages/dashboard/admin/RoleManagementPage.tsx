import React, { useState } from 'react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { Shield, UserPlus, Import, AlertCircle } from 'lucide-react';

const RoleManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'import' | 'assign'>('import');
    const [isLoading, setIsLoading] = useState(false);

    // Import Role State
    const [importRoleData, setImportRoleData] = useState({ roleCode: '' });

    // Assign Role State
    const [assignRoleData, setAssignRoleData] = useState({ username: '', roleCode: '' });

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/atl-auth-service/roles/import-role', importRoleData);
            if (response.status === 201 || response.data?.status === 'SUCCESS') {
                toast.success('Role imported successfully!');
                setImportRoleData({ roleCode: '' });
            } else {
                toast.error(response.data?.message || 'Failed to import role');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error import role');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/atl-auth-service/roles/map-role', assignRoleData);
            if (response.status === 201 || response.data?.status === 'SUCCESS') {
                toast.success('Role assigned to user successfully!');
                setAssignRoleData({ username: '', roleCode: '' });
            } else {
                toast.error(response.data?.message || 'Failed to assign role');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error assigning role');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                    <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-content-primary">Role Management</h1>
                    <p className="text-sm text-content-secondary">Manage system roles and user assignments</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'import'
                            ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                            : 'text-content-secondary hover:text-content-primary hover:bg-chrome'
                            }`}
                    >
                        <Import className="w-4 h-4" />
                        Import Role
                    </button>
                    <button
                        onClick={() => setActiveTab('assign')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'assign'
                            ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                            : 'text-content-secondary hover:text-content-primary hover:bg-chrome'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        Assign Role
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {activeTab === 'import' && (
                        <div className="max-w-xl">
                            <h3 className="text-lg font-semibold text-content-primary mb-4 flex items-center gap-2">
                                <Import className="w-5 h-5 text-content-muted" />
                                Add New Role
                            </h3>
                            <p className="text-sm text-content-secondary mb-6">
                                Register a new role in the system. The Role Code should be unique and descriptive (e.g., LIBRARIAN, ACCOUNTANT).
                            </p>

                            <form onSubmit={handleImportSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="roleCode" className="block text-sm font-medium text-content-primary">Role Code</label>
                                    <input
                                        type="text"
                                        id="roleCode"
                                        required
                                        className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                                        placeholder="e.g. LIBRARIAN"
                                        value={importRoleData.roleCode}
                                        onChange={(e) => setImportRoleData({ roleCode: e.target.value.toUpperCase() })}
                                    />
                                    <p className="mt-1 text-xs text-content-muted">Role codes are typically uppercase.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Importing...' : 'Import Role'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'assign' && (
                        <div className="max-w-xl">
                            <h3 className="text-lg font-semibold text-content-primary mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-content-muted" />
                                Assign Role to User
                            </h3>
                            <p className="text-sm text-content-secondary mb-6">
                                Grant specific privileges to a user by mapping a role code to their username.
                            </p>

                            <form onSubmit={handleAssignSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="assignUsername" className="block text-sm font-medium text-content-primary">Username / Email</label>
                                    <input
                                        type="text"
                                        id="assignUsername"
                                        required
                                        className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                                        placeholder="Enter user's email or username"
                                        value={assignRoleData.username}
                                        onChange={(e) => setAssignRoleData({ ...assignRoleData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="assignRoleCode" className="block text-sm font-medium text-content-primary">Role Code</label>
                                    <input
                                        type="text"
                                        id="assignRoleCode"
                                        required
                                        className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                                        placeholder="e.g. LIBRARIAN"
                                        value={assignRoleData.roleCode}
                                        onChange={(e) => setAssignRoleData({ ...assignRoleData, roleCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Assigning...' : 'Assign Role'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-blue-800">Note on Role Changes</h4>
                    <p className="text-sm text-blue-600 mt-1">
                        Assigned roles may not trigger immediate effects for logged-in users. They might need to re-login to see updated permissions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleManagementPage;
