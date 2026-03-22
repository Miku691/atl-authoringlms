import api from '../utils/api';
import type { InventoryCategory, InventoryItem, Supplier, StockTransaction, Asset } from '../types/inventory';

const BASE_URL = '/ims-inventory-service/api/v1/inventory';

export const inventoryService = {
  // Categories
  getCategories: async (): Promise<InventoryCategory[]> => {
    const response = await api.get(`${BASE_URL}/categories`);
    return response.data.apiData;
  },
  createCategory: async (data: Partial<InventoryCategory>): Promise<InventoryCategory> => {
    const response = await api.post(`${BASE_URL}/categories`, data);
    return response.data.apiData;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/categories/${id}`);
  },
  updateCategory: async (id: string, data: Partial<InventoryCategory>): Promise<InventoryCategory> => {
    const response = await api.put(`${BASE_URL}/categories/${id}`, data);
    return response.data.apiData;
  },

  // Items
  getItems: async (): Promise<InventoryItem[]> => {
    const response = await api.get(`${BASE_URL}/items`);
    return response.data.apiData;
  },
  createItem: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post(`${BASE_URL}/items`, data);
    return response.data.apiData;
  },
  updateItem: async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`${BASE_URL}/items/${id}`, data);
    return response.data.apiData;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/items/${id}`);
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get(`${BASE_URL}/suppliers`);
    return response.data.apiData;
  },
  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await api.post(`${BASE_URL}/suppliers`, data);
    return response.data.apiData;
  },
  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/suppliers/${id}`);
  },
  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await api.put(`${BASE_URL}/suppliers/${id}`, data);
    return response.data.apiData;
  },

  // Transactions
  getTransactions: async (): Promise<StockTransaction[]> => {
    const response = await api.get(`${BASE_URL}/transactions`);
    return response.data.apiData;
  },
  recordTransaction: async (data: Partial<StockTransaction>): Promise<StockTransaction> => {
    const response = await api.post(`${BASE_URL}/transactions`, data);
    return response.data.apiData;
  },

  // Assets
  getAssets: async (): Promise<Asset[]> => {
    const response = await api.get(`${BASE_URL}/assets`);
    return response.data.apiData;
  },
  createAsset: async (data: Partial<Asset>): Promise<Asset> => {
    const response = await api.post(`${BASE_URL}/assets`, data);
    return response.data.apiData;
  },
  updateAsset: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`${BASE_URL}/assets/${id}`, data);
    return response.data.apiData;
  },
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/assets/${id}`);
  },

  // Bulk Setup
  getBulkSetupStatus: async () => {
    const response = await api.get(`/ims-inventory-service/api/v1/inventory/bulk-setup/status`);
    return response.data;
  },
  setupCategories: async () => {
    const response = await api.post(`/ims-inventory-service/api/v1/inventory/bulk-setup/categories`);
    return response.data;
  }
};
