import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import AuthLayout from '../../layouts/AuthLayout';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';
import { User, Mail, Phone, Lock, Loader2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+1', label: 'CA (+1)' },
];

const RegisterInstitutePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        adminName: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: 'gray'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const checkPasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return { score: 0, message: '', color: 'gray' };

        if (pass.length >= 8) score++;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
        if (/\d/.test(pass)) score++;
        if (/[@#$%^&+=]/.test(pass)) score++;

        switch (score) {
            case 0:
            case 1:
                return { score, message: 'Very Weak', color: 'red' };
            case 2:
                return { score, message: 'Weak', color: 'orange' };
            case 3:
                return { score, message: 'Medium', color: 'yellow' };
            case 4:
                return { score, message: 'Strong', color: 'green' };
            default:
                return { score: 0, message: '', color: 'gray' };
        }
    };

    useEffect(() => {
        setPasswordStrength(checkPasswordStrength(formData.password));
    }, [formData.password]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.adminName.trim()) newErrors.adminName = 'Full Name is required';

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10,12}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10-12 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (passwordStrength.score < 4) {
            newErrors.password = 'Password is not strong enough';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
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

        const payload = {
            adminName: formData.adminName,
            email: formData.email,
            phone: `${formData.countryCode}${formData.phone}`,
            password: formData.password
        };

        try {
            const response = await api.post('/atl-auth-service/auth/onboard-admin', payload);

            if (response.data.status === 'CREATED' || response.status === 201 || response.data.status === 'SUCCESS') {
                toast.success('Registration successful! Please sign in.');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            const msg = error.response?.data?.message || 'Failed to register institute. Please try again.';
            toast.error(msg);

            if (error.response?.data?.apiData) {
                const apiErrors: { [key: string]: string } = {};
                error.response.data.apiData.forEach((err: any) => {
                    apiErrors[err.field] = err.errorMsg;
                });
                setErrors(apiErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Register Institute"
            subtitle="Start your journey with detailed administrative control."
            backgroundImage="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
        >
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                {/* Admin Name */}
                <FloatingLabelInput
                    label="Admin Full Name"
                    name="adminName"
                    required
                    value={formData.adminName}
                    onChange={handleChange}
                    icon={<User className="h-5 w-5" />}
                    error={errors.adminName}
                />

                {/* Email */}
                <FloatingLabelInput
                    label="Email Address"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail className="h-5 w-5" />}
                    error={errors.email}
                />

                {/* Phone */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                        Phone Number
                    </label>
                    <div className="flex gap-2">
                        <div className="w-1/3">
                            <select
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
                                className="block w-full px-3 py-[15px] border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 sm:text-sm transition-all bg-gray-50/50 h-[54px]"
                            >
                                {COUNTRY_CODES.map(c => (
                                    <option key={`${c.code}-${c.label}`} value={c.code}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <FloatingLabelInput
                                label="Phone Number"
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                icon={<Phone className="h-5 w-5" />}
                                error={errors.phone}
                                className="mb-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <FloatingLabelInput
                            label="Password"
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            icon={<Lock className="h-5 w-5" />}
                            error={errors.password}
                        />

                        {/* Strength Meter */}
                        {formData.password && !errors.password && (
                            <div className="px-1 pt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Strength: {passwordStrength.message}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`h-1 w-4 rounded-full ${step <= passwordStrength.score ? `bg-${passwordStrength.color}-500` : 'bg-gray-200'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 leading-tight">Must be 8+ chars with uppercase, number & symbol.</p>
                            </div>
                        )}
                    </div>

                    <FloatingLabelInput
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={<Lock className="h-5 w-5" />}
                        error={errors.confirmPassword}
                    />
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
                                Processing...
                            </>
                        ) : (
                            <>
                                Register Institute
                                <Building2 className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-sm text-center pt-2">
                    <span className="text-gray-500 font-medium">Already have an account? </span>
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline underline-offset-4 decoration-2">
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterInstitutePage;
