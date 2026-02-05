import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, MapPin, Mail, Phone, ArrowRight, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { updateUserTenant } from '../../store/authSlice';
import type { RootState } from '../../store/store';

interface TenantDto {
    tenantName: string;
    tenantCode: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    bootstrapUsername: string;
}

const CreateTenantPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        tenantName: '',
        tenantCode: '',
        address: '',
        contactEmail: user?.username || '', // Default to admin email if username is email
        contactPhone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload: TenantDto = {
                ...formData,
                isActive: true,
                bootstrapUsername: user?.username || '',
            };

            const response = await api.post('/atl-auth-service/tenants', payload);

            if (response.data.status === 'SUCCESS') {
                const newTenantId = response.data.apiData.id;

                // Update Redux state
                dispatch(updateUserTenant(newTenantId));

                toast.success('Institute created successfully!');

                // Redirect to Setup Wizard
                navigate('/onboarding/setup-tenant');
            } else {
                toast.error(response.data.message || 'Failed to create institute');
            }
        } catch (err: any) {
            console.error('Create tenant error:', err);
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to create institute. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate code from name
    const handleNameBlur = () => {
        if (formData.tenantName && !formData.tenantCode) {
            const code = formData.tenantName
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 6);
            setFormData(prev => ({ ...prev, tenantCode: code }));
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="bg-white/10 p-3 rounded-lg w-fit backdrop-blur-sm">
                            <LayoutDashboard className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Establish Your Digital Campus
                    </h1>
                    <p className="text-lg text-indigo-100 mb-8 max-w-lg">
                        Create your institute's profile to unlock powerful academic management tools.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Create Institute Profile
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter the details of your educational institution.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                                    Institute Name
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="tenantName"
                                        name="tenantName"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Ex: Springdale Public School"
                                        value={formData.tenantName}
                                        onChange={handleChange}
                                        onBlur={handleNameBlur}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="tenantCode" className="block text-sm font-medium text-gray-700">
                                    Institute Code (Unique ID)
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="h-5 w-5 text-gray-400 font-mono text-xs flex items-center justify-center border border-gray-400 rounded">ID</div>
                                    </div>
                                    <input
                                        id="tenantCode"
                                        name="tenantCode"
                                        type="text"
                                        required
                                        maxLength={10}
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
                                        placeholder="Ex: SPS2024"
                                        value={formData.tenantCode}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="City, State, Country"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                                        Contact Email
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="contactEmail"
                                            name="contactEmail"
                                            type="email"
                                            required
                                            className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="contact@school.com"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                                        Contact Phone
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="contactPhone"
                                            name="contactPhone"
                                            type="tel"
                                            required
                                            className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.contactPhone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Creating...' : (
                                    <span className="flex items-center">
                                        Create Profile
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTenantPage;
