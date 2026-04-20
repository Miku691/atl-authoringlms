import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, MapPin, Mail, Phone, ArrowRight, LayoutDashboard, Loader2, Globe, Navigation, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { updateUserTenant } from '../../store/authSlice';
import type { RootState } from '../../store/store';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';
import { COUNTRIES } from '../../utils/location';

interface TenantDto {
    tenantName: string;
    address: string;
    country: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    contactEmail: string;
    contactPhone: string;
    isActive: boolean;
    bootstrapUsername: string;
    currency: string;
}

const CreateTenantPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    
    const [formData, setFormData] = useState({
        tenantName: '',
        address: '', // This will be local address (city/street)
        country: 'India',
        state: '',
        latitude: '' as string | number,
        longitude: '' as string | number,
        contactEmail: user?.username || '',
        contactPhone: '',
        currency: 'INR',
        countryPhoneCode: '+91'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Get current country object
    const currentCountry = COUNTRIES.find(c => c.name === formData.country);

    // Auto-update currency and phone code when country changes
    useEffect(() => {
        if (currentCountry) {
            setFormData(prev => ({
                ...prev,
                currency: currentCountry.currency,
                countryPhoneCode: currentCountry.phoneCode,
                state: currentCountry.states.length > 0 ? currentCountry.states[0] : ''
            }));
        }
    }, [formData.country]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setIsDetecting(false);
                toast.success("Location coordinates captured!");
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Unable to retrieve your location. Please enter manually.");
                setIsDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.tenantName.trim()) newErrors.tenantName = 'Institute Name is required';
        if (!formData.address.trim()) newErrors.address = 'Local address is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.contactEmail) {
            newErrors.contactEmail = 'Contact Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }
        if (!formData.contactPhone) {
            newErrors.contactPhone = 'Phone number is required';
        } else if (!/^\d{7,15}$/.test(formData.contactPhone)) {
            newErrors.contactPhone = 'Invalid phone number format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
                country: formData.country,
                state: formData.state,
                latitude: formData.latitude ? parseFloat(formData.latitude.toString()) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude.toString()) : null,
                contactEmail: formData.contactEmail,
                contactPhone: `${formData.countryPhoneCode}${formData.contactPhone}`,
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="bg-white/10 p-4 rounded-2xl w-fit backdrop-blur-md">
                            <LayoutDashboard className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">
                        Build Your Global <span className="text-indigo-400">Campus</span>
                    </h1>
                    <p className="text-xl text-indigo-100/80 mb-8 max-w-lg font-medium">
                        Standardize your institutional identity with precision location mapping and automated regional settings.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mt-12">
                        <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <p className="text-3xl font-black mb-1">100%</p>
                            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Cloud Ready</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <p className="text-3xl font-black mb-1">Global</p>
                            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Multi-Currency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-xl space-y-10 py-10">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Institute Registry
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Enter the core establishment details of your institution.
                        </p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
                        {/* Section 1: Basic Identity */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest px-1">Institutional Identity</h3>
                            <FloatingLabelInput
                                label="Full Legal Name of Institute"
                                name="tenantName"
                                required
                                value={formData.tenantName}
                                onChange={handleChange}
                                icon={<Building2 className="h-5 w-5" />}
                                error={errors.tenantName}
                            />
                            <FloatingLabelInput
                                label="Global Contact Email"
                                type="email"
                                name="contactEmail"
                                required
                                value={formData.contactEmail}
                                onChange={handleChange}
                                icon={<Mail className="h-5 w-5" />}
                                error={errors.contactEmail}
                            />
                        </div>

                        {/* Section 2: Global Location */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest px-1">Regional Setting & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Country</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:text-sm font-bold transition-all bg-white h-[54px]"
                                        >
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">State / Province</label>
                                    <div className="relative group">
                                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:text-sm font-bold transition-all bg-white h-[54px]"
                                        >
                                            <option value="">Select State</option>
                                            {currentCountry?.states.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.state && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.state}</p>}
                                </div>
                            </div>

                            {/* Local Address Details */}
                            <div className="relative">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Local Address (City, Street, Building)</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-4 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <textarea
                                        name="address"
                                        rows={3}
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter city, street no, landmark etc..."
                                        className="block w-full pl-10 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 sm:text-sm font-medium transition-all bg-white resize-none"
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.address}</p>}
                            </div>
                        </div>

                        {/* Section 3: Geo Coordinates */}
                        <div className="space-y-4 bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Establishment Coordinates</h3>
                                <button
                                    type="button"
                                    onClick={handleDetectLocation}
                                    disabled={isDetecting}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition-all uppercase tracking-tighter"
                                >
                                    {isDetecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                                    Auto Pick Location
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingLabelInput
                                    label="Latitude"
                                    name="latitude"
                                    type="number"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="0.000000"
                                    className="mb-0"
                                />
                                <FloatingLabelInput
                                    label="Longitude"
                                    name="longitude"
                                    type="number"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="0.000000"
                                    className="mb-0"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Enter manually or use 'Auto Pick' for precise geo-location mapping.</p>
                        </div>

                        {/* Section 4: Contact & Phone */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest px-1">Institutional Contact</h3>
                            <div className="flex gap-4">
                                <div className="w-[100px]">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Prefix</label>
                                    <input
                                        disabled
                                        value={formData.countryPhoneCode}
                                        className="w-full px-3 py-4 border-2 border-slate-100 rounded-xl bg-slate-50 text-slate-400 font-bold text-sm text-center"
                                    />
                                </div>
                                <div className="flex-1">
                                    <FloatingLabelInput
                                        label="Primary Phone Number"
                                        type="tel"
                                        name="contactPhone"
                                        required
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        icon={<Phone className="h-5 w-5" />}
                                        error={errors.contactPhone}
                                        className="mb-0 h-[58px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                           <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Operational Currency</span>
                                <span className="text-xl font-black text-slate-800 ml-1">{formData.currency}</span>
                           </div>
                           
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full sm:w-auto flex justify-center items-center py-4 px-10 border border-transparent rounded-2xl shadow-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none' : 'hover:shadow-indigo-200'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Onboarding...
                                    </>
                                ) : (
                                    <>
                                        Complete Registry 
                                        <ArrowRight className="ml-3 h-5 w-5" />
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
