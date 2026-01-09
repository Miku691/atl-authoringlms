import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';
import { Building2, Globe, MapPin, Phone, Mail, Save, Loader2 } from 'lucide-react';

interface TenantData {
    id: string;
    tenantName: string;
    tenantCode: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    bootstrapUsername?: string;
}

const TenantProfileSection: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [formData, setFormData] = useState<TenantData>({
        id: '',
        tenantName: '',
        tenantCode: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        isActive: true
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (tenantId) {
            fetchTenantDetails();
        }
    }, [tenantId]);

    const fetchTenantDetails = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/atl-auth/tenants/${tenantId}`);
            if (response.data.status === 'SUCCESS') {
                setFormData(response.data.apiData);
            }
        } catch (error: any) {
            toast.error('Failed to load institute details');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put(`/atl-auth/tenants/${tenantId}`, formData);
            if (response.data.status === 'SUCCESS') {
                toast.success('Institute settings updated successfully');
                setFormData(response.data.apiData);
            } else {
                toast.error(response.data.message || 'Failed to update settings');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error updating settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
                <p className="text-sm text-gray-500 mt-1">Update your institute's public profile.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">Institute Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="tenantName"
                                id="tenantName"
                                required
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                value={formData.tenantName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="tenantCode" className="block text-sm font-medium text-gray-700">Institute Code</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="tenantCode"
                                id="tenantCode"
                                required
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                value={formData.tenantCode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="contactEmail"
                                id="contactEmail"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                value={formData.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="contactPhone"
                                id="contactPhone"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                value={formData.contactPhone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TenantProfileSection;
