import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import AuthLayout from '../../layouts/AuthLayout';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';
import { Lock, User, Loader2, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!username) errors.username = 'Username or Email is required';
        if (!password) errors.password = 'Password is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/atl-auth-service/auth/signin', { username, password });
            if (response.data.status === 'SUCCESS') {
                navigate('/otp', { state: { username } });
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            const msg = err.response?.data?.message || 'Invalid Credentials or Server Error';
            setError(msg);

            // If backend provides field-level errors
            if (err.response?.data?.apiData) {
                const apiErrors: { [key: string]: string } = {};
                err.response.data.apiData.forEach((error: any) => {
                    apiErrors[error.field] = error.errorMsg;
                });
                setFieldErrors(apiErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFieldChange = (name: string, value: string) => {
        if (name === 'username') setUsername(value);
        if (name === 'password') setPassword(value);

        // Clear errors as user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) setError('');
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Please sign in to access your dashboard"
        >
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <FloatingLabelInput
                        label="Username"
                        name="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        icon={<User className="h-5 w-5" />}
                        error={fieldErrors.username}
                    />

                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <Link to="/forgot-password" stroke-width="2" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 hover:underline underline-offset-4 decoration-2 transition-all">
                                Forgot password?
                            </Link>
                        </div>
                        <FloatingLabelInput
                            label="Password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            icon={<Lock className="h-5 w-5" />}
                            error={fieldErrors.password}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none' : 'hover:shadow-indigo-200'}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">
                            New here?
                        </span>
                    </div>
                </div>

                <div>
                    <Link
                        to="/register-institute"
                        className="w-full flex justify-center py-4 px-4 border-2 border-gray-100 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-indigo-100 hover:text-indigo-600 transition-all duration-300 text-center"
                    >
                        Register details of your Institute
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
