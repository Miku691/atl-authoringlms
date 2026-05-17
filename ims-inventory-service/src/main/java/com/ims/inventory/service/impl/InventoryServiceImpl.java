package com.ims.inventory.service.impl;

import com.ims.inventory.client.FinanceClient;
import com.ims.inventory.dto.InventoryCategoryDTO;
import com.ims.inventory.dto.InventoryItemDTO;
import com.ims.inventory.dto.StockTransactionDTO;
import com.ims.inventory.dto.SupplierDTO;
import com.ims.inventory.dto.external.ExternalExpenseDTO;
import com.ims.inventory.entity.*;
import com.ims.inventory.repository.*;
import com.ims.inventory.service.InventoryService;
import com.ims.inventory.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryCategoryRepository categoryRepository;
    private final InventoryItemRepository itemRepository;
    private final SupplierRepository supplierRepository;
    private final StockTransactionRepository transactionRepository;
    private final FinanceClient financeClient;
    private final ModelMapper modelMapper;

    @Override
    public List<InventoryCategoryDTO> getAllCategories() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return categoryRepository.findByTenantId(tenantId).stream()
                .map(cat -> modelMapper.map(cat, InventoryCategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public InventoryCategoryDTO createCategory(InventoryCategoryDTO dto) {
        InventoryCategory category = modelMapper.map(dto, InventoryCategory.class);
        category.setTenantId(SecurityUtils.getCurrentTenantId());
        return modelMapper.map(categoryRepository.save(category), InventoryCategoryDTO.class);
    }

    @Override
    public InventoryCategoryDTO updateCategory(String id, InventoryCategoryDTO dto) {
        InventoryCategory existing = categoryRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        return modelMapper.map(categoryRepository.save(existing), InventoryCategoryDTO.class);
    }

    @Override
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<InventoryItemDTO> getAllItems() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return itemRepository.findByTenantId(tenantId).stream()
                .map(item -> {
                    InventoryItemDTO dto = modelMapper.map(item, InventoryItemDTO.class);
                    dto.setItemType(item.getItemType() != null ? item.getItemType().name() : "CONSUMABLE");
                    categoryRepository.findById(item.getCategoryId())
                            .ifPresent(cat -> dto.setCategoryName(cat.getName()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public InventoryItemDTO createItem(InventoryItemDTO dto) {
        InventoryItem item = modelMapper.map(dto, InventoryItem.class);
        item.setTenantId(SecurityUtils.getCurrentTenantId());
        item.setCurrentStock(0.0);
        if (dto.getItemType() != null && !dto.getItemType().isEmpty()) {
            try {
                item.setItemType(InventoryItem.ItemType.valueOf(dto.getItemType().toUpperCase()));
            } catch (Exception e) {
                item.setItemType(InventoryItem.ItemType.CONSUMABLE);
            }
        } else {
            item.setItemType(InventoryItem.ItemType.CONSUMABLE);
        }
        InventoryItem saved = itemRepository.save(item);
        InventoryItemDTO result = modelMapper.map(saved, InventoryItemDTO.class);
        result.setItemType(saved.getItemType().name());
        return result;
    }

    @Override
    public InventoryItemDTO updateItem(String id, InventoryItemDTO dto) {
        InventoryItem existing = itemRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setCategoryId(dto.getCategoryId());
        existing.setDescription(dto.getDescription());
        existing.setUnit(dto.getUnit());
        existing.setReorderLevel(dto.getReorderLevel());
        if (dto.getItemType() != null && !dto.getItemType().isEmpty()) {
            try {
                existing.setItemType(InventoryItem.ItemType.valueOf(dto.getItemType().toUpperCase()));
            } catch (Exception e) {
                // keep existing
            }
        }
        InventoryItem saved = itemRepository.save(existing);
        InventoryItemDTO result = modelMapper.map(saved, InventoryItemDTO.class);
        result.setItemType(saved.getItemType().name());
        return result;
    }

    @Override
    public void deleteItem(String id) {
        itemRepository.deleteById(id);
    }

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return supplierRepository.findByTenantId(tenantId).stream()
                .map(s -> modelMapper.map(s, SupplierDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDTO createSupplier(SupplierDTO dto) {
        Supplier supplier = modelMapper.map(dto, Supplier.class);
        supplier.setTenantId(SecurityUtils.getCurrentTenantId());
        return modelMapper.map(supplierRepository.save(supplier), SupplierDTO.class);
    }

    @Override
    public SupplierDTO updateSupplier(String id, SupplierDTO dto) {
        Supplier existing = supplierRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setContactPerson(dto.getContactPerson());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setAddress(dto.getAddress());
        return modelMapper.map(supplierRepository.save(existing), SupplierDTO.class);
    }

    @Override
    public void deleteSupplier(String id) {
        supplierRepository.deleteById(id);
    }

    @Override
    public List<StockTransactionDTO> getAllTransactions() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return transactionRepository.findByTenantId(tenantId).stream()
                .map(t -> {
                    StockTransactionDTO dto = modelMapper.map(t, StockTransactionDTO.class);
                    itemRepository.findById(t.getItemId()).ifPresent(i -> dto.setItemName(i.getName()));
                    if (t.getSupplierId() != null) {
                        supplierRepository.findById(t.getSupplierId()).ifPresent(s -> dto.setSupplierName(s.getName()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StockTransactionDTO recordTransaction(StockTransactionDTO dto) {
        InventoryItem item = itemRepository.findById(dto.getItemId()).orElseThrow();
        StockTransaction transaction = modelMapper.map(dto, StockTransaction.class);
        transaction.setTenantId(SecurityUtils.getCurrentTenantId());
        transaction.setTransactionDate(LocalDateTime.now());

        if (StockTransaction.TransactionType.IN.name().equalsIgnoreCase(dto.getType())) {
            item.setCurrentStock(item.getCurrentStock() + dto.getQuantity());
            transaction.setType(StockTransaction.TransactionType.IN);
            
            // Finance Integration: Record Purchase as Expense
            if (dto.getTotalPrice() != null && dto.getTotalPrice() > 0) {
                try {
                    ExternalExpenseDTO expenseDTO = ExternalExpenseDTO.builder()
                            .categoryId(null) // Generic category or we can map it
                            .categoryName("Inventory Purchase")
                            .amount(BigDecimal.valueOf(dto.getTotalPrice()))
                            .description("Stock Purchase: " + item.getName() + " (Qty: " + dto.getQuantity() + ")")
                            .expenseDate(LocalDate.now())
                            .paymentMethod("CASH") // Default or from DTO
                            .referenceNo(dto.getReferenceNumber())
                            .tenantId(transaction.getTenantId())
                            .build();
                    financeClient.recordExpense(expenseDTO);
                } catch (Exception e) {
                    // Log error but don't fail transaction? Or fail? 
                    // For now, logging to console (will improve with structured logging)
                    System.err.println("Failed to record expense in finance service: " + e.getMessage());
                }
            }
        } else {
            item.setCurrentStock(item.getCurrentStock() - dto.getQuantity());
            transaction.setType(StockTransaction.TransactionType.OUT);
        }

        itemRepository.save(item);
        return modelMapper.map(transactionRepository.save(transaction), StockTransactionDTO.class);
    }

    @Override
    @Transactional
    public void bootstrapCategories() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        String[][] standardCategories = {
            {"Stationery", "General office and classroom stationery"},
            {"IT Assets", "Computers, printers, and networking equipment"},
            {"Lab Equipment", "Science and technical laboratory tools"},
            {"Furniture", "Desks, chairs, and institutional furniture"},
            {"Uniforms", "Student and staff uniform stock"}
        };

        for (String[] cat : standardCategories) {
            if (!categoryRepository.existsByTenantIdAndName(tenantId, cat[0])) {
                InventoryCategory category = new InventoryCategory();
                category.setName(cat[0]);
                category.setDescription(cat[1]);
                category.setTenantId(tenantId);
                categoryRepository.save(category);
            }
        }
    }

    @Override
    public Map<String, Boolean> getBulkSetupStatus() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        Map<String, Boolean> status = new HashMap<>();
        status.put("inventoryCategories", !categoryRepository.findByTenantId(tenantId).isEmpty());
        return status;
    }
}
