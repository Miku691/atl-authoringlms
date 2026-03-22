package com.ims.inventory.repository;

import com.ims.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
    List<InventoryItem> findByTenantId(String tenantId);
    List<InventoryItem> findByTenantIdAndCategoryId(String tenantId, String categoryId);
}
