import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, FileText, CheckCircle2, ChevronDown, ListPlus } from 'lucide-react';
import { academicService } from '../../../../api/academicService';
import { financeService } from '../../../../api/financeService';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import type { FeeInstallmentPlan, FeeInstallmentSchedule, FeeHead } from '../../../../types/finance';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';
import { useCurrency } from '../../../../context/CurrencyContext';
import { getCurrencySymbol } from '../../../../utils/currency';

const InstallmentPlansPage: React.FC = () => {
    const { currencyCode } = useCurrency();
    const { user } = useSelector((state: RootState) => state.auth);
    const tenantId = user?.tenantId;

    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
    const [plans, setPlans] = useState<FeeInstallmentPlan[]>([]);
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    
    const [isCreatingParam, setIsCreatingParam] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<FeeInstallmentPlan>>({});
    
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Partial<FeeInstallmentSchedule>[]>([]);

    useEffect(() => {
        if (tenantId) {
            loadInitialData();
        }
    }, [tenantId]);

    useEffect(() => {
        if (selectedOffering) {
            loadPlans(selectedOffering);
        } else {
            setPlans([]);
            setSelectedPlanId(null);
        }
    }, [selectedOffering]);

    const loadInitialData = async () => {
        if (!tenantId) return;
        try {
            const [offeringsData, headsData] = await Promise.all([
                academicService.getOfferingsByTenant(tenantId),
                financeService.getFeeHeads()
            ]);
            setOfferings(offeringsData);
            setFeeHeads(headsData);
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const loadPlans = async (offeringId: string) => {
        try {
            const data = await financeService.getInstallmentPlansByOffering(offeringId);
            setPlans(data || []);
            setSelectedPlanId(null);
            setSchedules([]);
        } catch (error) {
            toast.error("Failed to load installment plans");
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOffering || !newPlan.name || !academicYear) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await financeService.createInstallmentPlan({
                ...newPlan,
                offeringId: selectedOffering,
                academicYear: academicYear
            });
            toast.success("Installment plan created successfully");
            setIsCreatingParam(false);
            setNewPlan({});
            loadPlans(selectedOffering);
        } catch (error) {
            toast.error("Failed to create plan");
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await financeService.deleteInstallmentPlan(planId);
            toast.success("Plan deleted successfully");
            loadPlans(selectedOffering);
        } catch (error) {
            toast.error("Failed to delete plan");
        }
    };

    const handleSelectPlan = (plan: FeeInstallmentPlan) => {
        setSelectedPlanId(plan.id!);
        // Map existing schedules for editing if required, or start fresh if replacing
        setSchedules(plan.schedules || []);
    };

    const handleAddScheduleRow = () => {
        setSchedules([...schedules, { 
            installmentNumber: schedules.length + 1,
            feeHeadId: feeHeads.length > 0 ? feeHeads[0].id : '',
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0]
        }]);
    };

    const handleRemoveScheduleRow = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const handleScheduleChange = (index: number, field: string, value: any) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        setSchedules(updated);
    };

    const handleSaveSchedules = async () => {
        if (!selectedPlanId) return;
        // Basic validation
        for (let s of schedules) {
            if (!s.feeHeadId || s.amount! <= 0 || !s.dueDate) {
                toast.error("Please fill all fields with valid amounts for each installment");
                return;
            }
        }

        try {
            await financeService.addSchedulesToPlan(selectedPlanId, schedules);
            toast.success("Schedules saved successfully");
            loadPlans(selectedOffering);
        } catch (error) {
            toast.error("Failed to save schedules");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-indigo-600" />
                            Installment Plans
                        </h1>
                        <p className="text-slate-500 mt-1">Configure automated fee installments for academic offerings</p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={selectedOffering}
                            onChange={(e) => setSelectedOffering(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5 outline-none"
                        >
                            <option value="">Select Class / Offering</option>
                            {offerings.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-32 p-2.5 outline-none"
                        >
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>
                </div>

                {selectedOffering && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Plans List Column */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <ListPlus className="w-4 h-4 text-slate-500" />
                                    Available Plans
                                </h2>
                                <button
                                    onClick={() => setIsCreatingParam(!isCreatingParam)}
                                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {isCreatingParam && (
                                    <form onSubmit={handleCreatePlan} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shadow-inner">
                                        <FloatingLabelInput
                                            id="planName"
                                            label="Plan Name (e.g., Quarterly)"
                                            value={newPlan.name || ''}
                                            onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                                            required
                                        />
                                        <FloatingLabelInput
                                            id="planDesc"
                                            label="Description (Optional)"
                                            value={newPlan.description || ''}
                                            onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setIsCreatingParam(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                                            <button type="submit" className="px-3 py-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm">Create Plan</button>
                                        </div>
                                    </form>
                                )}

                                {plans.map((plan) => (
                                    <div 
                                        key={plan.id}
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedPlanId === plan.id ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-medium ${selectedPlanId === plan.id ? 'text-indigo-900' : 'text-slate-800'}`}>{plan.name}</h3>
                                                {plan.description && <p className="text-xs text-slate-500 mt-1">{plan.description}</p>}
                                                <div className="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                    {plan.schedules?.length || 0} Installment(s) mapped
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id!); }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {plans.length === 0 && !isCreatingParam && (
                                    <div className="text-center py-10 px-4">
                                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <h3 className="text-sm font-medium text-slate-700">No Plans Configured</h3>
                                        <p className="text-xs text-slate-500 mt-1">Create an installment plan to split fees into multiple schedules.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Schedules Configuration Column */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                            {selectedPlanId ? (
                                <>
                                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-semibold text-slate-800 text-lg">Define Installment Schedule</h2>
                                            <p className="text-sm text-slate-500">Map fee heads to specific due dates and amounts</p>
                                        </div>
                                        <button
                                            onClick={handleSaveSchedules}
                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Save Schedule
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                        <div className="space-y-4">
                                            {schedules.map((schedule, index) => (
                                                <div key={index} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100 group hover:border-indigo-100 hover:bg-indigo-50/10 transition-colors">
                                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center font-bold text-slate-700 flex-shrink-0">
                                                        #{index + 1}
                                                    </div>
                                                    
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="relative">
                                                            <select
                                                                value={schedule.feeHeadId || ''}
                                                                onChange={(e) => handleScheduleChange(index, 'feeHeadId', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none appearance-none"
                                                            >
                                                                <option value="">Select Fee Head</option>
                                                                {feeHeads.map(fh => (
                                                                    <option key={fh.id} value={fh.id}>{fh.name}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                        </div>

                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{getCurrencySymbol(currencyCode)}</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Amount"
                                                                value={schedule.amount || ''}
                                                                onChange={(e) => handleScheduleChange(index, 'amount', Number(e.target.value))}
                                                                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-8 p-2.5 outline-none"
                                                            />
                                                        </div>

                                                        <div>
                                                            <input
                                                                type="date"
                                                                value={schedule.dueDate ? new Date(schedule.dueDate).toISOString().split('T')[0] : ''}
                                                                onChange={(e) => handleScheduleChange(index, 'dueDate', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveScheduleRow(index)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                onClick={handleAddScheduleRow}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Installment
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                                        <Calendar className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-800">Select a Plan</h3>
                                    <p className="text-slate-500 mt-2 max-w-sm">
                                        Choose an installment plan from the left panel to configure its payment schedule and fee heads.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {!selectedOffering && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <ListPlus className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">No Class Selected</h3>
                        <p className="text-slate-500 mt-2">Please select a class/offering above to view and manage installment plans.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstallmentPlansPage;
