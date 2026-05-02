import React, { useEffect, useState } from 'react';
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
  Tag
} from 'lucide-react';
import { inventoryService } from '../../../../api/inventoryService';
import type { InventoryItem, InventoryCategory } from '../../../../types/inventory';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

const StockManagementPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Forms state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemFormData, setItemFormData] = useState<Partial<InventoryItem>>({
    name: '',
    categoryId: '',
    description: '',
    unit: 'PCS',
    reorderLevel: 5
  });
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, catsData] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getCategories()
      ]);
      setItems(itemsData);
      setCategories(catsData);
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
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await inventoryService.deleteItem(id);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({ ...item });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: '',
        categoryId: categories[0]?.id || '',
        description: '',
        unit: 'PCS',
        reorderLevel: 5
      });
    }
    setIsItemModalOpen(true);
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
    if (!window.confirm('Delete category? Items in this category will remain but without category reference.')) return;
    try {
      await inventoryService.deleteCategory(id);
      toast.success('Category deleted');
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
                        <div className={`p-2.5 rounded-xl ${isLow ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-content-primary">{item.name}</p>
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
                          onClick={() => openItemModal(item)}
                          className="p-1.5 text-content-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
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
            <label className="block text-sm font-bold text-content-primary mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={itemFormData.name}
              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Printer Paper A4"
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
              <input
                type="text"
                required
                value={itemFormData.unit}
                onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. PCS, BOX, KG"
              />
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
                  onClick={() => handleDeleteCategory(cat.id)}
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
    </div>
  );
};

export default StockManagementPage;
