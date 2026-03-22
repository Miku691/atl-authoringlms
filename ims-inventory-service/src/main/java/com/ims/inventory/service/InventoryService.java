package com.ims.inventory.service;

import com.ims.inventory.dto.*;
import java.util.List;

public interface InventoryService {
    // Categories
    List<InventoryCategoryDTO> getAllCategories();
    InventoryCategoryDTO createCategory(InventoryCategoryDTO dto);
    void deleteCategory(String id);

    // Items
    List<InventoryItemDTO> getAllItems();
    InventoryItemDTO createItem(InventoryItemDTO dto);
    InventoryItemDTO updateItem(String id, InventoryItemDTO dto);
    void deleteItem(String id);

    // Suppliers
    List<SupplierDTO> getAllSuppliers();
    SupplierDTO createSupplier(SupplierDTO dto);
    void deleteSupplier(String id);

    // Transactions
    List<StockTransactionDTO> getAllTransactions();
    StockTransactionDTO recordTransaction(StockTransactionDTO dto);

    void bootstrapCategories();
    java.util.Map<String, Boolean> getBulkSetupStatus();
}
