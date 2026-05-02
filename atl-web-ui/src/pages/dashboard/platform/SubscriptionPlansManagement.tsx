import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Save, X, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import Modal from '../../../components/common/Modal';

interface Plan {
  id?: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxStudents: number;
  maxTeachers: number;
  isActive: boolean;
  featuresList: string;
}

const SubscriptionPlansManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Plan>({
    name: '',
    description: '',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'INR',
    maxStudents: 100,
    maxTeachers: 10,
    isActive: true,
    featuresList: '[]'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/ims-platform-service/api/v1/platform/admin/plans');
      const data = response.data.apiData || response.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        priceMonthly: 0,
        priceYearly: 0,
        currency: 'INR',
        maxStudents: 100,
        maxTeachers: 10,
        isActive: true,
        featuresList: '[]'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan?.id) {
        await api.put(`/ims-platform-service/api/v1/platform/admin/plans/${editingPlan.id}`, formData);
        toast.success("Plan updated successfully");
      } else {
        await api.post('/ims-platform-service/api/v1/platform/admin/plans', formData);
        toast.success("Plan created successfully");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error("Failed to save plan");
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await api.post('/ims-platform-service/api/v1/platform/admin/plans/seed');
      toast.success("Default plans seeded!");
      setIsSeedModalOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error("Failed to seed plans");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Subscription Plans</h1>
          <p className="text-content-secondary text-sm">Manage dynamic SaaS plans and limits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSeedModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors font-semibold"
          >
            <Database className="w-4 h-4" />
            Seed Defaults
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-chrome border-b border-border">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">Plan Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">Price (Monthly)</th>
              <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">Limits</th>
              <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-content-secondary uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-chrome transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-content-primary">{plan.name}</div>
                  <div className="text-xs text-content-muted truncate max-w-xs">{plan.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">{plan.currency} {plan.priceMonthly}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-content-secondary">Students: {plan.maxStudents}</div>
                  <div className="text-xs text-content-secondary">Teachers: {plan.maxTeachers}</div>
                </td>
                <td className="px-6 py-4">
                  {plan.isActive ? (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-content-secondary bg-chrome px-2 py-1 rounded-full text-xs font-medium">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleOpenModal(plan)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-10 text-center text-content-muted">Loading plans...</div>}
      </div>

      {/* Seed Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onConfirm={handleSeed}
        title="Seed Default Plans"
        message="Are you sure you want to seed the default subscription plans? This will only add plans that are currently missing from the system."
        confirmText="Yes, Seed Plans"
        variant="success"
        isLoading={isSeeding}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
        icon={<Database size={18} />}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="modal-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="plan-form"
              className="modal-btn-primary"
            >
              {editingPlan ? 'Update Plan' : 'Save Plan'}
            </button>
          </>
        }
      >
        <form id="plan-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Plan Name</label>
              <input
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Starter, Professional"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="A short summary of the plan"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Price Monthly</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.priceMonthly}
                onChange={e => setFormData({...formData, priceMonthly: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Price Yearly</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.priceYearly}
                onChange={e => setFormData({...formData, priceYearly: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Max Students</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.maxStudents}
                onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Max Teachers</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.maxTeachers}
                onChange={e => setFormData({...formData, maxTeachers: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-content-secondary uppercase mb-1">Features (JSON Array)</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={formData.featuresList}
                onChange={e => setFormData({...formData, featuresList: e.target.value})}
                placeholder='["Feature 1", "Feature 2"]'
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-indigo-600 border-border rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-content-primary">Display this plan as Active</label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubscriptionPlansManagement;
