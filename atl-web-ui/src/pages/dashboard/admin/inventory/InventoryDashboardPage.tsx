import React, { useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Plus, 
  Box,
  Truck,
  X,
  Save,
  FileText
} from 'lucide-react';
import { inventoryService } from '../../../../api/inventoryService';
import type { InventoryItem, StockTransaction, Supplier } from '../../../../types/inventory';
import toast from 'react-hot-toast';

const InventoryDashboardPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StockTransaction>>({
    itemId: '',
    supplierId: '',
    quantity: 1,
    type: 'IN',
    unitPrice: 0,
    referenceNumber: '',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, transData, suppliersData] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getTransactions(),
        inventoryService.getSuppliers()
      ]);
      setItems(itemsData);
      setTransactions(transData.slice(0, 10)); // Latest 10
      setSuppliers(suppliersData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.itemId || !formData.quantity || !formData.type) {
        toast.error('Please fill required fields');
        return;
      }

      await inventoryService.recordTransaction(formData as StockTransaction);
      toast.success('Transaction recorded');
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        itemId: '',
        supplierId: '',
        quantity: 1,
        type: 'IN',
        unitPrice: 0,
        referenceNumber: '',
        remarks: ''
      });
      
      fetchData();
    } catch (error) {
      toast.error('Failed to record transaction');
    }
  };

  const lowStockItems = items.filter(item => item.currentStock <= item.reorderLevel);
  const totalItems = items.length;
  const inStockValue = items.reduce((acc, item) => acc + item.currentStock, 0);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium font-inter">Loading Dashboard Assets...</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-gray-500 text-sm font-medium">Real-time overview of your institutional stock and assets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold"
        >
          <Plus size={18} />
          Record Transaction
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Unique Items" 
          value={totalItems.toString()} 
          icon={<Box className="text-blue-600" />} 
          trend="In Catalog"
          trendColor="text-blue-500"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={lowStockItems.length.toString()} 
          icon={<AlertTriangle className="text-amber-500" />} 
          trend={lowStockItems.length > 0 ? "Replenishment needed" : "All levels healthy"}
          trendColor={lowStockItems.length > 0 ? "text-amber-600" : "text-emerald-500"}
        />
        <StatCard 
          title="Total Units in Stock" 
          value={inStockValue.toLocaleString()} 
          icon={<Package className="text-indigo-600" />} 
          trend="Physical inventory"
          trendColor="text-indigo-500"
        />
        <StatCard 
          title="Verified Suppliers" 
          value={suppliers.length.toString()} 
          icon={<Truck className="text-emerald-600" />} 
          trend="Active Vendors"
          trendColor="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Critical Stock Levels
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-lg transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4 text-center">In Stock</th>
                  <th className="px-6 py-4 text-center">Reorder Point</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-normal uppercase">{item.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-red-600 font-extrabold">{item.currentStock} <span className="text-[10px] font-medium text-gray-400">{item.unit}</span></td>
                      <td className="px-6 py-4 text-center text-gray-500 font-bold">{item.reorderLevel}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[10px] font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-lg hover:bg-red-600 uppercase transition-colors">Restock</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400 italic font-medium">All stock levels are optimal.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                Recent Activity
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-bold">LATEST 10</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[460px] p-2 space-y-1">
            {transactions.map((trans) => (
              <div key={trans.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group">
                <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${trans.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {trans.type === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate leading-tight">{trans.itemName}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                    {trans.type === 'IN' ? `Received from ${trans.supplierName || 'Unknown'}` : 'Stock Out (Issued)'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                        {new Date(trans.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                    </span>
                    {trans.referenceNumber && (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase truncate max-w-[80px]">
                            {trans.referenceNumber}
                        </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${trans.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {trans.type === 'IN' ? '+' : '-'}{trans.quantity}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-20 text-center text-gray-300 italic font-medium">No recent transactions recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History size={20} className="text-indigo-600" />
                Record Stock Transaction
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Activity Type *</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'IN' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.type === 'IN' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                        <ArrowUpRight size={18} />
                        STOCK IN (Purchase)
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'OUT' })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.type === 'OUT' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                        <ArrowDownRight size={18} />
                        STOCK OUT (Usage)
                    </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Item *</label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium shadow-sm transition-all"
                >
                  <option value="">Choose item...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (Current: {item.currentStock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>

              {formData.type === 'IN' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Supplier</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium shadow-sm transition-all"
                    >
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-emerald-600"
                    />
                  </div>
                </>
              )}

              <div className={formData.type === 'IN' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-bold text-gray-700 mb-1">Reference / Invoice #</label>
                <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. INV-2024-001"
                    />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                  placeholder="Additional notes about this transaction..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-inter shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-8 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-wider"
                >
                  <Save size={18} className="mr-2" />
                  Confirm Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{icon}</div>
    </div>
    <div className="mt-5">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-none">{title}</p>
      <h2 className="text-3xl font-black text-gray-900 mt-2 tracking-tighter">{value}</h2>
      <div className="flex items-center gap-1.5 mt-3">
        <div className={`w-1.5 h-1.5 rounded-full ${trendColor.replace('text-', 'bg-')}`} />
        <p className={`text-[11px] font-bold ${trendColor}`}>{trend}</p>
      </div>
    </div>
  </div>
);

export default InventoryDashboardPage;
