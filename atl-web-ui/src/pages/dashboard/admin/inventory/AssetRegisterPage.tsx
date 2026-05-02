import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldCheck,
  Tag,
  Package,
  X,
  Save,
  DollarSign
} from 'lucide-react';
import { inventoryService } from '../../../../api/inventoryService';
import type { Asset, InventoryCategory } from '../../../../types/inventory';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const AssetRegisterPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    categoryId: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseValue: 0,
    location: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsData, catsData] = await Promise.all([
        inventoryService.getAssets(),
        inventoryService.getCategories()
      ]);
      setAssets(assetsData);
      setCategories(catsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({ ...asset });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseValue: 0,
        location: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await inventoryService.updateAsset(editingAsset.id, formData as Asset);
        toast.success('Asset updated');
      } else {
        await inventoryService.createAsset(formData as Asset);
        toast.success('Asset registered');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this asset record?')) return;
    try {
      await inventoryService.deleteAsset(id);
      toast.success('Asset record deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'DISPOSED': return 'bg-chrome text-content-primary border-border';
      case 'UNDER_MAINTENANCE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  if (loading) return <div className="p-8 text-center text-content-secondary font-medium">Loading Assets...</div>;

  return (
    <div className="p-6 space-y-6 bg-chrome/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Asset Register</h1>
          <p className="text-content-secondary text-sm">Official record of institutional property and equipment.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 font-bold"
        >
          <Plus size={18} />
          Register New Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by asset name or serial number..." 
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-surface rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all relative group">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Building2 size={24} />
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(asset.status)}`}>
                {asset.status.replace('_', ' ')}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-content-primary truncate" title={asset.name}>{asset.name}</h3>
            <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs text-indigo-500 font-bold bg-indigo-500/10 w-fit px-2 py-0.5 rounded">
                    {asset.categoryName || 'General Asset'}
                </span>
                <p className="text-xs text-content-muted font-mono flex items-center gap-1.5">
                    <Tag size={12} />
                    {asset.serialNumber}
                </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-3 text-sm text-content-secondary">
                <MapPin size={16} className="text-content-muted" />
                <span className="font-medium">{asset.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-content-secondary">
                <Calendar size={16} className="text-content-muted" />
                <span className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'medium'})}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-content-primary">
                <DollarSign size={16} className="text-emerald-500" />
                <span>₹{asset.purchaseValue.toLocaleString()}</span>
              </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleOpenModal(asset)}
                className="p-2 text-content-muted hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(asset.id)}
                className="p-2 text-content-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-full py-24 text-center bg-surface rounded-2xl border-2 border-dashed border-border">
            <Package size={52} className="mx-auto text-gray-200 mb-4" />
            <h4 className="text-content-secondary font-bold text-xl">No assets found</h4>
            <p className="text-content-muted text-sm mt-1 max-w-xs mx-auto">Start building your institutional asset register by clicking the button above.</p>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'Edit Asset Details' : 'Register New Asset'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-sm font-bold text-content-secondary bg-surface border border-border rounded-xl hover:bg-chrome transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="asset-form"
              className="flex items-center px-8 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} className="mr-2" />
              {editingAsset ? 'Update Asset' : 'Register Asset'}
            </button>
          </>
        }
      >
        <form id="asset-form" onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Asset Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Dell Latitude 5420"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-surface"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="S/N: 12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Purchase Value (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.purchaseValue}
                onChange={(e) => setFormData({ ...formData, purchaseValue: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Current Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. IT lab, Principal Office"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Asset Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-surface font-bold text-content-primary"
            >
              <option value="ACTIVE">Active (In Service)</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="DISPOSED">Disposed / Retired</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetRegisterPage;
