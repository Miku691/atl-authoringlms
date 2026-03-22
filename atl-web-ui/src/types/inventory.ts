export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName?: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  type: 'IN' | 'OUT';
  unitPrice?: number;
  totalPrice?: number;
  referenceNumber?: string;
  transactionDate: string;
  remarks?: string;
}

export interface Asset {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseValue: number;
  location: string;
  status: 'ACTIVE' | 'DISPOSED' | 'UNDER_MAINTENANCE';
}
