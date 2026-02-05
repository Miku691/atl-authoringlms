import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api';
import { loginSuccess } from '../../store/authSlice';
import AuthLayout from '../../layouts/AuthLayout';
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const OtpPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Get username from navigation state, fallback to empty string if not present
    const username = location.state?.username;

    useEffect(() => {
        if (!username) {
            navigate('/login');
            return;
        }

        // Auto-trigger send OTP on component mount
        const sendOtp = async () => {
            try {
                const response = await api.post('/atl-auth-service/auth/otp/sendOtp', { username });
                if (response.data.message) {
                    setInfoMessage(`We've sent a 6-digit code to your email associated with ${username}`);
                }
            } catch (err) {
                setError('Failed to send OTP. Please try logging in again.');
            }
        };
        sendOtp();
    }, [username, navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/atl-auth-service/auth/otp/verifyOtp', { username, otp });

            if (response.data.status === 'SUCCESS') {
                const { jwt, roles, tenantId, tenantSetupCompleted, tenantType, id, email } = response.data.apiData;

                dispatch(loginSuccess({
                    user: {
                        id,
                        username,
                        email,
                        roles: Array.from(roles),
                        tenantId,
                        tenantSetupCompleted,
                        tenantType
                    },
                    token: jwt
                }));

                // Role Based Redirect
                if (roles.includes('ADMIN') || roles.includes('TENANT_ADMIN')) {
                    if (!tenantId) {
                        navigate('/onboarding/create-tenant'); // Go to creation if no tenant
                    } else if (roles.includes('TENANT_ADMIN') && !tenantSetupCompleted) {
                        navigate('/onboarding/setup-tenant'); // Go to setup if valid tenant but not setup
                    } else {
                        navigate('/dashboard');
                    }
                } else if (roles.includes('STUDENT')) {
                    navigate('/dashboard');
                } else if (roles.includes('TEACHER')) {
                    navigate('/dashboard');
                } else {
                    navigate('/dashboard'); // Fallback
                }
            } else {
                setError(response.data.message || 'OTP Verification failed');
            }
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid or expired OTP');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Two-Factor Authentication"
            subtitle="Secure your account with the code we just sent."
            backgroundImage="https://images.unsplash.com/photo-1614064641938-3e85816550f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-700 font-medium">Verification Failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {infoMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm text-green-700 font-medium">OTP Sent</p>
                            <p className="text-sm text-green-600 mt-1">{infoMessage}</p>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter 6-Digit Code
                    </label>
                    <div className="relative">
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            className="block w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-3xl font-bold tracking-[0.5em] text-gray-900 transition-all duration-200"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => {
                                // Only allow numbers
                                const val = e.target.value;
                                if (/^\d*$/.test(val) && val.length <= 6) {
                                    setOtp(val);
                                }
                            }}
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Didn't receive the code?{' '}
                        <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Resend
                        </button>
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify & Access
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default OtpPage;
