package com.ims.inventory.controller;

import com.ims.inventory.dto.*;
import com.ims.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Categories
    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.getAllCategories()));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody InventoryCategoryDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.createCategory(dto)));
    }

    /**
     * Updates an existing inventory category.
     *
     * @param id category unique identifier
     * @param dto updated category details
     * @return updated category data wrapped in response map
     */
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable String id, @RequestBody InventoryCategoryDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.updateCategory(id, dto)));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        inventoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Items
    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getItems() {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.getAllItems()));
    }

    @PostMapping("/items")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> createItem(@RequestBody InventoryItemDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.createItem(dto)));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateItem(@PathVariable String id, @RequestBody InventoryItemDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.updateItem(id, dto)));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        inventoryService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // Suppliers
    @GetMapping("/suppliers")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getSuppliers() {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.getAllSuppliers()));
    }

    @PostMapping("/suppliers")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> createSupplier(@RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.createSupplier(dto)));
    }

    /**
     * Updates an existing supplier record.
     *
     * @param id supplier unique identifier
     * @param dto updated supplier details
     * @return updated supplier data wrapped in response map
     */
    @PutMapping("/suppliers/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateSupplier(@PathVariable String id, @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.updateSupplier(id, dto)));
    }

    @DeleteMapping("/suppliers/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id) {
        inventoryService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    // Transactions
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getTransactions() {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.getAllTransactions()));
    }

    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> recordTransaction(@RequestBody StockTransactionDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", inventoryService.recordTransaction(dto)));
    }
}
