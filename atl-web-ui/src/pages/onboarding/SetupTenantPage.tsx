import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { updateSetupStatus } from '../../store/authSlice';
import api from '../../utils/api';
import { School, GraduationCap, Users, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface BootstrapReqDto {
    tenantId: string;
    institutionType: 'SCHOOL' | 'COLLEGE' | 'COACHING';
    board?: string;
    academicYear: string;
    numberOfLevels?: number;
}

const SetupTenantPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [step, setStep] = useState(1);
    const [institutionType, setInstitutionType] = useState<BootstrapReqDto['institutionType'] | null>(null);
    const [details, setDetails] = useState({
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        board: 'CBSE',
        numberOfLevels: 12
    });
    const [loading, setLoading] = useState(false);

    const handleTypeSelect = (type: BootstrapReqDto['institutionType']) => {
        setInstitutionType(type);
        // Set defaults based on type
        if (type === 'SCHOOL') {
            setDetails(prev => ({ ...prev, numberOfLevels: 12, board: 'CBSE' }));
        } else if (type === 'COLLEGE') {
            setDetails(prev => ({ ...prev, numberOfLevels: 8, board: '' }));
        } else if (type === 'COACHING') {
            setDetails(prev => ({ ...prev, numberOfLevels: 2, board: '' }));
        }
        setStep(2);
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: BootstrapReqDto = {
                tenantId: user?.tenantId || '',
                institutionType: institutionType!,
                academicYear: details.academicYear,
                board: institutionType === 'SCHOOL' ? details.board : undefined,
                numberOfLevels: Number(details.numberOfLevels)
            };

            const response = await api.post('/ims-academic/bootstrap', payload);

            if (response.data === true) {
                // Update Auth Service (Verify setup)
                await api.put(`/atl-auth/tenants/${user?.tenantId}/verify-setup`, null, {
                    params: { type: institutionType }
                });

                // Update Local State
                dispatch(updateSetupStatus(true));

                toast.success('Setup completed successfully!');
                navigate('/admin/dashboard');
            } else {
                toast.error('Setup failed. Please try again.');
            }
        } catch (error) {
            console.error('Setup error:', error);
            toast.error('An error occurred during setup.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">Select Institution Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => handleTypeSelect('SCHOOL')}
                    className="cursor-pointer p-6 border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all hover:shadow-lg flex flex-col items-center"
                >
                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                        <School className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">School</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">K-12 Education, Classes & Sections</p>
                </div>

                <div
                    onClick={() => handleTypeSelect('COLLEGE')}
                    className="cursor-pointer p-6 border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all hover:shadow-lg flex flex-col items-center"
                >
                    <div className="bg-purple-100 p-4 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">College</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">Degrees, Semesters & Programs</p>
                </div>

                <div
                    onClick={() => handleTypeSelect('COACHING')}
                    className="cursor-pointer p-6 border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all hover:shadow-lg flex flex-col items-center"
                >
                    <div className="bg-orange-100 p-4 rounded-full mb-4">
                        <Users className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">Coaching</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">Batches, Competitive Exams</p>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <form onSubmit={handleDetailsSubmit} className="space-y-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800">Configure {institutionType}</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                <input
                    type="text"
                    value={details.academicYear}
                    onChange={(e) => setDetails({ ...details, academicYear: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                />
            </div>

            {institutionType === 'SCHOOL' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Board</label>
                    <select
                        value={details.board}
                        onChange={(e) => setDetails({ ...details, board: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="STATE_BOARD">State Board</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {institutionType === 'SCHOOL' ? 'Number of Classes' :
                        institutionType === 'COLLEGE' ? 'Number of Semesters' : 'Number of Batches'}
                </label>
                <input
                    type="number"
                    value={details.numberOfLevels}
                    onChange={(e) => setDetails({ ...details, numberOfLevels: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    min="1"
                    max="20"
                    required
                />
            </div>

            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? 'Setting up...' : <>Complete Setup <ArrowRight className="w-4 h-4" /></>}
                </button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <div className="mb-8 flex justify-center">
                    <div className={`w-3 h-3 rounded-full mx-1 ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                    <div className={`w-3 h-3 rounded-full mx-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                </div>

                {step === 1 ? renderStep1() : renderStep2()}
            </div>
        </div>
    );
};

export default SetupTenantPage;
