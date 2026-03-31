import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, MapPin, Mail, Phone, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { updateUserTenant } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';

const COUNTRY_CODES = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+1', label: 'CA (+1)' },
];

interface TenantDto {
    tenantName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    bootstrapUsername: string;
    currency: string;
}

import { CURRENCIES } from '../../utils/currency';

const CreateTenantPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        tenantName: '',
        address: '',
        contactEmail: user?.username || '',
        countryCode: '+91',
        contactPhone: '',
        currency: 'INR',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.tenantName.trim()) newErrors.tenantName = 'Institute Name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.contactEmail) {
            newErrors.contactEmail = 'Contact Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }
        if (!formData.contactPhone) {
            newErrors.contactPhone = 'Phone number is required';
        } else if (!/^\d{10,12}$/.test(formData.contactPhone)) {
            newErrors.contactPhone = 'Phone must be 10-12 digits';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsLoading(true);

        try {
            const payload: TenantDto = {
                tenantName: formData.tenantName,
                address: formData.address,
                contactEmail: formData.contactEmail,
                contactPhone: `${formData.countryCode}${formData.contactPhone}`,
                isActive: true,
                bootstrapUsername: user?.username || '',
                currency: formData.currency,
            };

            const response = await api.post('/atl-auth-service/tenants', payload);

            if (response.data.status === 'SUCCESS') {
                const newTenantId = response.data.apiData.id;
                dispatch(updateUserTenant(newTenantId));
                toast.success('Institute created successfully!');
                navigate('/onboarding/setup-tenant');
            } else {
                toast.error(response.data.message || 'Failed to create institute');
            }
        } catch (err: any) {
            console.error('Create tenant error:', err);
            const msg = err.response?.data?.message || 'Failed to create institute. Please check your connection.';
            toast.error(msg);

            if (err.response?.data?.apiData) {
                const apiErrors: { [key: string]: string } = {};
                err.response.data.apiData.forEach((error: any) => {
                    apiErrors[error.field] = error.errorMsg;
                });
                setErrors(apiErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="bg-white/10 p-3 rounded-xl w-fit backdrop-blur-sm">
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

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                        <FloatingLabelInput
                            label="Institute Name"
                            name="tenantName"
                            required
                            value={formData.tenantName}
                            onChange={handleChange}
                            icon={<Building2 className="h-5 w-5" />}
                            error={errors.tenantName}
                        />


                        <FloatingLabelInput
                            label="Address"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            icon={<MapPin className="h-5 w-5" />}
                            error={errors.address}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <FloatingLabelInput
                                label="Contact Email"
                                type="email"
                                name="contactEmail"
                                required
                                value={formData.contactEmail}
                                onChange={handleChange}
                                icon={<Mail className="h-5 w-5" />}
                                error={errors.contactEmail}
                            />

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                                    Functional Currency
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-[15px] border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 sm:text-sm transition-all bg-white h-[54px]"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                                    Contact Phone
                                </label>
                                <div className="flex gap-2">
                                    <div className="w-1/3">
                                        <select
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-[15px] border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 sm:text-sm transition-all bg-white h-[54px]"
                                        >
                                            {COUNTRY_CODES.map(c => (
                                                <option key={`${c.code}-${c.label}`} value={c.code}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <FloatingLabelInput
                                            label="Contact Phone"
                                            type="tel"
                                            name="contactPhone"
                                            required
                                            value={formData.contactPhone}
                                            onChange={handleChange}
                                            icon={<Phone className="h-5 w-5" />}
                                            error={errors.contactPhone}
                                            className="mb-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none' : 'hover:shadow-indigo-200'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        Create Profile
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
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
