import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Package, 
  AlertCircle,
  FolderOpen,
  X,
  Save,
  Tag,
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';
import { inventoryService } from '../../../../api/inventoryService';
import type { InventoryItem, InventoryCategory, Supplier, StockTransaction } from '../../../../types/inventory';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const StockManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [deleteItemConfirmId, setDeleteItemConfirmId] = useState<string | null>(null);
  const [deleteCategoryConfirmId, setDeleteCategoryConfirmId] = useState<string | null>(null);
  
  // Forms state
  const [selectedItemForStock, setSelectedItemForStock] = useState<InventoryItem | null>(null);
  const [stockFormData, setStockFormData] = useState<Partial<StockTransaction>>({
    itemId: '',
    supplierId: '',
    quantity: 1,
    type: 'IN',
    unitPrice: 0,
    totalPrice: 0,
    referenceNumber: '',
    transactionDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemFormData, setItemFormData] = useState<Partial<InventoryItem>>({
    name: '',
    categoryId: '',
    description: '',
    unit: 'PCS',
    reorderLevel: 5,
    itemType: 'CONSUMABLE'
  });
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, catsData, suppliersData] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getCategories(),
        inventoryService.getSuppliers()
      ]);
      setItems(itemsData);
      setCategories(catsData);
      setSuppliers(suppliersData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Item CRUD
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!itemFormData.name || !itemFormData.categoryId || !itemFormData.unit) {
        toast.error('Please fill required fields');
        return;
      }

      if (editingItem) {
        await inventoryService.updateItem(editingItem.id, itemFormData as InventoryItem);
        toast.success('Item updated');
      } else {
        await inventoryService.createItem(itemFormData as InventoryItem);
        toast.success('Item created');
      }
      
      setIsItemModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await inventoryService.deleteItem(id);
      toast.success('Item deleted');
      setDeleteItemConfirmId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({ ...item, itemType: item.itemType || 'CONSUMABLE' });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        description: '',
        unit: 'PCS',
        reorderLevel: 5,
        itemType: 'CONSUMABLE'
      });
    }
    setIsItemModalOpen(true);
  };

  const openStockModal = (item: InventoryItem) => {
    setSelectedItemForStock(item);
    setStockFormData({
      itemId: item.id,
      supplierId: suppliers[0]?.id || '',
      quantity: 1,
      type: 'IN',
      unitPrice: 0,
      totalPrice: 0,
      referenceNumber: '',
      transactionDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!stockFormData.itemId || !stockFormData.quantity) {
        toast.error('Please fill required fields');
        return;
      }
      const payload = {
        ...stockFormData,
        transactionDate: stockFormData.transactionDate ? (stockFormData.transactionDate.includes('T') ? stockFormData.transactionDate : `${stockFormData.transactionDate}T00:00:00`) : `${new Date().toISOString().split('T')[0]}T00:00:00`,
        totalPrice: (stockFormData.quantity || 0) * (stockFormData.unitPrice || 0)
      };
      await inventoryService.recordTransaction(payload as StockTransaction);
      toast.success(stockFormData.type === 'IN' ? 'Stock Added Successfully' : 'Stock Deducted Successfully');
      setIsStockModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to record stock transaction');
    }
  };

  // Category CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newCategory.name) return;
      await inventoryService.createCategory(newCategory);
      toast.success('Category added');
      setNewCategory({ name: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await inventoryService.deleteCategory(id);
      toast.success('Category deleted');
      setDeleteCategoryConfirmId(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-content-secondary">Loading inventory...</div>;

  return (
    <div className="p-6 space-y-6 bg-chrome/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Stock Management</h1>
          <p className="text-content-secondary text-sm">Manage item catalog, categories, and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-surface text-content-primary px-4 py-2 rounded-xl border border-border hover:bg-chrome transition-colors shadow-sm font-semibold"
          >
            <FolderOpen size={18} />
            Categories
          </button>
          <button 
            onClick={() => openItemModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-bold"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by item name or category..." 
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 bg-surface text-content-primary px-6 py-2 rounded-xl border border-border hover:bg-chrome transition-colors shadow-sm font-medium">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-chrome text-content-secondary text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Unit</th>
                <th className="px-6 py-4 text-center">In Stock</th>
                <th className="px-6 py-4 text-center">Min Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.reorderLevel;
                return (
                  <tr key={item.id} className="hover:bg-chrome/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isLow ? 'bg-red-50 text-red-600' : item.itemType === 'ASSET' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {item.itemType === 'ASSET' ? <Layers size={20} /> : <Package size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-content-primary">{item.name}</p>
                            {item.itemType === 'ASSET' ? (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                <Layers size={10} />
                                ASSET / EQUIPMENT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                <Package size={10} />
                                CONSUMABLE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-content-muted truncate max-w-[200px]">{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-chrome text-content-secondary rounded-lg text-xs font-bold">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-content-secondary font-medium">{item.unit}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-content-primary">{item.currentStock}</td>
                    <td className="px-6 py-4 text-center text-content-muted font-medium">{item.reorderLevel}</td>
                    <td className="px-6 py-4">
                      {isLow ? (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                          <AlertCircle size={14} />
                          Low Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Stocked
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openStockModal(item)}
                          title="Record Stock Inflow / Outflow (Adjust Stock)"
                          className="p-1.5 text-content-muted hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                        {item.itemType === 'ASSET' && (
                          <button 
                            onClick={() => navigate('/inventory/assets')}
                            title="View Registered Instances in Asset Register"
                            className="p-1.5 text-content-muted hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => openItemModal(item)}
                          className="p-1.5 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteItemConfirmId(item.id)}
                          className="p-1.5 text-content-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-content-muted italic font-medium">No inventory items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-content-primary bg-surface border border-border rounded-xl hover:bg-chrome mb-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="item-form"
              className="flex items-center px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              <Save size={18} className="mr-2" />
              {editingItem ? 'Update Item' : 'Create Item'}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={handleItemSubmit} className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-content-primary">Item Type *</label>
              <div className="flex items-center gap-1.5 text-xs text-content-muted font-medium">
                <Info size={14} className="text-indigo-500" />
                <span>Select how this item is tracked</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-1 bg-chrome rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setItemFormData({ ...itemFormData, itemType: 'CONSUMABLE' })}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  itemFormData.itemType !== 'ASSET'
                    ? 'bg-surface text-indigo-600 shadow-sm border border-border/50'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Package size={14} />
                Consumable (Stock)
              </button>
              <button
                type="button"
                onClick={() => setItemFormData({ ...itemFormData, itemType: 'ASSET' })}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  itemFormData.itemType === 'ASSET'
                    ? 'bg-surface text-purple-600 shadow-sm border border-border/50'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Layers size={14} />
                Fixed Asset / Equipment
              </button>
            </div>
            {/* Dynamic helper description box */}
            <div className="mt-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-content-secondary leading-relaxed flex gap-2 items-start">
              <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                {itemFormData.itemType !== 'ASSET' ? (
                  <>
                    <strong className="text-indigo-600 font-bold">Consumable (Stock):</strong> Items purchased in bulk and consumed over time (e.g., Printer Paper, Markers, Lab Chemicals). Tracked purely by total stock quantity.
                  </>
                ) : (
                  <>
                    <strong className="text-purple-600 font-bold">Fixed Asset / Equipment:</strong> High-value capital items (e.g., Laptops, Projectors, Lab Microscopes). In addition to total stock tracking, allows registering individual instances with unique serial numbers, custodians, and locations in the Asset Register.
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={itemFormData.name}
              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Printer Paper A4 or Dell Laptop"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Category *</label>
              <select
                required
                value={itemFormData.categoryId}
                onChange={(e) => setItemFormData({ ...itemFormData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-surface"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Management Unit *</label>
              <select
                required
                value={itemFormData.unit}
                onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-surface font-bold text-content-primary"
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="PACK">PACK (Packs)</option>
                <option value="DOZEN">DOZEN (Dozens)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="LITRE">LITRE (Litres)</option>
                <option value="UNITS">UNITS (Units)</option>
                <option value="SET">SET (Sets)</option>
                <option value="REAM">REAM (Reams)</option>
                <option value="ROLL">ROLL (Rolls)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Reorder Level *</label>
            <input
              type="number"
              required
              min="0"
              value={itemFormData.reorderLevel}
              onChange={(e) => setItemFormData({ ...itemFormData, reorderLevel: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-content-muted mt-1">Get alerts when stock falls below this number.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Description</label>
            <textarea
              rows={3}
              value={itemFormData.description}
              onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Categories"
        icon={<FolderOpen size={20} className="text-indigo-600" />}
        footer={
          <button 
            onClick={() => setIsCategoryModalOpen(false)}
            className="px-6 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-content-primary hover:bg-chrome shadow-sm"
          >
            Done
          </button>
        }
      >
        <div className="p-4 space-y-6">
          {/* Add category form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <div className="flex-1">
              <input 
                type="text"
                required
                placeholder="New category name..."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-bold flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Add
            </button>
          </form>

          {/* Category List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-chrome rounded-xl hover:bg-chrome transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface rounded-lg text-indigo-600 shadow-sm">
                    <Tag size={16} />
                  </div>
                  <span className="font-bold text-content-primary">{cat.name}</span>
                </div>
                <button 
                  onClick={() => setDeleteCategoryConfirmId(cat.id)}
                  className="p-1.5 text-content-muted hover:text-red-600 hover:bg-surface rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="py-8 text-center text-content-muted italic">No categories added yet.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Stock Transaction / Adjustment Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock: ${selectedItemForStock?.name}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-content-primary bg-surface border border-border rounded-xl hover:bg-chrome mb-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="stock-form"
              className={`flex items-center px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg ${
                stockFormData.type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
              }`}
            >
              <Save size={18} className="mr-2" />
              {stockFormData.type === 'IN' ? 'Add Stock (Inflow)' : 'Deduct Stock (Outflow)'}
            </button>
          </>
        }
      >
        <form id="stock-form" onSubmit={handleStockSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Transaction Type *</label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-chrome rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setStockFormData({ ...stockFormData, type: 'IN' })}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  stockFormData.type === 'IN'
                    ? 'bg-surface text-emerald-600 shadow-sm border border-border/50'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <Plus size={14} />
                Stock Inflow (Add)
              </button>
              <button
                type="button"
                onClick={() => setStockFormData({ ...stockFormData, type: 'OUT' })}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  stockFormData.type === 'OUT'
                    ? 'bg-surface text-amber-600 shadow-sm border border-border/50'
                    : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <AlertCircle size={14} />
                Stock Outflow (Usage)
              </button>
            </div>
          </div>

          {stockFormData.type === 'IN' && (
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Supplier (Optional)</label>
              <select
                value={stockFormData.supplierId || ''}
                onChange={(e) => setStockFormData({ ...stockFormData, supplierId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-surface"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Quantity ({selectedItemForStock?.unit}) *</label>
              <input
                type="number"
                required
                min="1"
                value={stockFormData.quantity || ''}
                onChange={(e) => setStockFormData({ ...stockFormData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-extrabold text-content-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-content-primary mb-1">Transaction Date *</label>
              <input
                type="date"
                required
                value={stockFormData.transactionDate || ''}
                onChange={(e) => setStockFormData({ ...stockFormData, transactionDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {stockFormData.type === 'IN' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-content-primary mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={stockFormData.unitPrice || ''}
                  onChange={(e) => setStockFormData({ ...stockFormData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-content-primary mb-1">Reference / Invoice #</label>
                <input
                  type="text"
                  value={stockFormData.referenceNumber || ''}
                  onChange={(e) => setStockFormData({ ...stockFormData, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="INV-2026-001"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-content-primary mb-1">Remarks / Reason</label>
            <textarea
              rows={2}
              value={stockFormData.remarks || ''}
              onChange={(e) => setStockFormData({ ...stockFormData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder={stockFormData.type === 'IN' ? 'e.g. Monthly batch purchase' : 'e.g. Issued to Science Lab'}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={!!deleteItemConfirmId}
        onClose={() => setDeleteItemConfirmId(null)}
        title="Confirm Item Deletion"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteItemConfirmId(null)}
              className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-2xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteItemConfirmId && handleDeleteItem(deleteItemConfirmId)}
              className="px-5 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>Delete Item</span>
            </button>
          </>
        }
      >
        <div className="py-4 text-content-secondary flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-content-primary mb-1">Are you sure you want to delete this inventory item?</p>
            <p className="text-xs text-content-muted">This action cannot be undone and will permanently remove the item catalog entry.</p>
          </div>
        </div>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal
        isOpen={!!deleteCategoryConfirmId}
        onClose={() => setDeleteCategoryConfirmId(null)}
        title="Confirm Category Deletion"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteCategoryConfirmId(null)}
              className="px-4 py-2 text-content-secondary hover:bg-chrome rounded-2xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteCategoryConfirmId && handleDeleteCategory(deleteCategoryConfirmId)}
              className="px-5 py-2 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>Delete Category</span>
            </button>
          </>
        }
      >
        <div className="py-4 text-content-secondary flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-content-primary mb-1">Are you sure you want to delete this category?</p>
            <p className="text-xs text-content-muted">Items in this category will remain in the catalog but will lose their category reference.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockManagementPage;
