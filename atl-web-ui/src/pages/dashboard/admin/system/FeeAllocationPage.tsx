import React, { useEffect, useState } from 'react';
import { Calculator, Calendar, CheckCircle2, AlertCircle, Info, Layers, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { academicService, type ImsOffering } from '../../../../api/academicService';
import { financeService } from '../../../../api/financeService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';

const FeeAllocationPage: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [offerings, setOfferings] = useState<ImsOffering[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>(
        new Date().getFullYear().toString() + '-' + (new Date().getFullYear() + 1).toString().slice(-2)
    );
    const [isAllocating, setIsAllocating] = useState(false);
    const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

    useEffect(() => {
        if (user?.tenantId) {
            fetchOfferings(user.tenantId);
        }
    }, [user?.tenantId]);

    const fetchOfferings = async (tenantId: string) => {
        setIsLoadingOfferings(true);
        try {
            const data = await academicService.getOfferingsByTenant(tenantId);
            setOfferings(data);
        } catch (error) {
            toast.error('Failed to fetch offerings');
        } finally {
            setIsLoadingOfferings(false);
        }
    };

    const handleBulkAllocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOffering) {
            toast.error('Please select an offering');
            return;
        }

        if (!window.confirm('Are you sure you want to allocate fees to ALL students in this offering? This action will generate fee records for everyone based on the defined structure.')) {
            return;
        }

        setIsAllocating(true);
        try {
            await financeService.bulkAllocateFees(selectedOffering, academicYear);
            toast.success('Bulk fee allocation triggered successfully! Records are being created.');
            setSelectedOffering('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to trigger bulk allocation');
        } finally {
            setIsAllocating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bulk Fee Allocation</h1>
                    <p className="text-sm text-gray-500">Allocate fees to all students in a class/offering at once</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <Calculator className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                Allocation Details
                            </h3>
                        </div>

                        <form onSubmit={handleBulkAllocation} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Select Offering ({offerings.length > 0 ? (offerings[0].type === 'COLLEGE' ? 'Semester' : offerings[0].type === 'COACHING' ? 'Batch' : 'Class') : 'Class'})
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                                            value={selectedOffering}
                                            onChange={(e) => setSelectedOffering(e.target.value)}
                                            disabled={isLoadingOfferings || isAllocating}
                                            required
                                        >
                                            <option value="">Choose an offering...</option>
                                            {offerings.map((off) => (
                                                <option key={off.id} value={off.id}>
                                                    {off.name} {off.programName ? `(${off.programName})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                                            <ArrowRight className="w-4 h-4 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                                        Academic Year
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                            placeholder="e.g. 2024-25"
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            disabled={isAllocating}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isAllocating || !selectedOffering}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                >
                                    {isAllocating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing Allocation...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Trigger Bulk Allocation
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-amber-900">Important Note</h4>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                Bulk allocation will identify all active students in the selected offering and generate fee records for them based on the current Fee Structure. 
                                <span className="font-bold"> Duplicate prevention:</span> If a student already has an unpaid record for a specific fee head in this academic year, a new one will not be created.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            How it works
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-xs text-gray-600 leading-relaxed">Define a Fee Structure for the offering in the <span className="text-indigo-600 font-medium">Fee Structure</span> page.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-xs text-gray-600 leading-relaxed">Select the offering and academic year on this page.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-xs text-gray-600 leading-relaxed">System fetches all students and creates ledger entries for each fee head in the structure.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white overflow-hidden relative">
                        <Calculator className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 rotate-12" />
                        <div className="relative z-10 space-y-2">
                            <h4 className="font-bold">Pro Tip</h4>
                            <p className="text-xs text-indigo-100 leading-relaxed">
                                Always ensure your Fee Structure is correct before triggering bulk allocation. Fees once allocated can be seen in the Student Ledger.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeAllocationPage;
