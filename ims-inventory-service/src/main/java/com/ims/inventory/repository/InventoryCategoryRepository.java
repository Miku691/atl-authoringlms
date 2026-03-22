package com.ims.inventory.repository;

import com.ims.inventory.entity.InventoryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryCategoryRepository extends JpaRepository<InventoryCategory, String> {
    List<InventoryCategory> findByTenantId(String tenantId);
    boolean existsByTenantIdAndName(String tenantId, String name);
}
