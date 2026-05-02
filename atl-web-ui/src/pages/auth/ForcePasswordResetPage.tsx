import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import AuthLayout from '../../layouts/AuthLayout';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForcePasswordResetPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State from OtpPage
    const email = location.state?.email;
    const otp = location.state?.otp;

    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!email || !otp) {
            toast.error("Invalid session. Please login again.");
            navigate('/login');
        }
    }, [email, otp, navigate]);

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/atl-auth-service/auth/forgot-password/reset', {
                email,
                otp,
                newPassword
            });

            if (response.data.status === 'SUCCESS' || response.status === 200) {
                toast.success('Password updated successfully! Please login with your new password.');
                navigate('/login');
            } else {
                toast.error(response.data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Secure Your Account"
            subtitle="Please set a new password to continue."
            backgroundImage="https://images.unsplash.com/photo-1555421689-d68471e189f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
        >
            <form className="space-y-6" onSubmit={handleResetSubmit}>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl mb-6">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
                        <p className="text-xs text-amber-800">
                            For security, you must change your temporary password before accessing the dashboard.
                        </p>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-content-primary mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-content-muted" />
                        </div>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            id="newPassword"
                            required
                            className="block w-full pl-10 pr-10 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                            placeholder="Create a strong password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-content-secondary focus:outline-none"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-content-primary mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-content-muted" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                            className="block w-full pl-10 pr-10 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                            placeholder="Re-enter your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-content-secondary focus:outline-none"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300 transform active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Updating Security...
                            </>
                        ) : (
                            <>
                                Update Password & Login
                                <CheckCircle className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-sm text-content-secondary">
                        Suddenly remembered? {' '}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForcePasswordResetPage;
